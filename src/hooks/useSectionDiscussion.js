import { useCallback, useEffect, useMemo, useState } from "react";
import { db, firebaseEnabled, serverTimestamp } from "../lib/firebase";

const ROOT_KEY = "__root__";
const USER_PUBLIC_PROFILE_COLLECTION = "userPublicProfiles";
const COMMENT_TEXT_MAX_LENGTH = 100
const USER_RATE_LIMIT_COLLECTION = "rateLimits";
const COMMENT_RATE_LIMIT_DOC_ID = "comments";

function toMillis(value) {
  if (!value) {
    return 0;
  }
  if (typeof value?.toMillis === "function") {
    return value.toMillis();
  }
  if (typeof value?.toDate === "function") {
    return value.toDate().getTime();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 0 : parsed.getTime();
}

function toNetScore(comment) {
  const upvotes = Number(comment?.upvotes) || 0;
  const downvotes = Number(comment?.downvotes) || 0;
  return upvotes - downvotes;
}

function sortByNetDescThenCreatedDesc(a, b) {
  const byNet = toNetScore(b) - toNetScore(a);
  if (byNet !== 0) {
    return byNet;
  }
  return toMillis(b?.createdAt) - toMillis(a?.createdAt);
}

export function useSectionDiscussion({ guideSlug, sectionId, user, isAdmin, commentAuthorName, commentAuthorUserId }) {
  const [commentsRaw, setCommentsRaw] = useState([]);
  const [votesRaw, setVotesRaw] = useState([]);
  const [displayNameByUserId, setDisplayNameByUserId] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const commentsRef = useMemo(() => {
    if (!firebaseEnabled || !db || !guideSlug || !sectionId) {
      return null;
    }
    return db.collection("guides").doc(guideSlug).collection("sections").doc(sectionId).collection("comments");
  }, [guideSlug, sectionId]);

  const votesRef = useMemo(() => {
    if (!firebaseEnabled || !db || !guideSlug || !sectionId) {
      return null;
    }
    return db.collection("guides").doc(guideSlug).collection("sections").doc(sectionId).collection("votes");
  }, [guideSlug, sectionId]);

  useEffect(() => {
    if (!commentsRef || !votesRef) {
      setCommentsRaw([]);
      setVotesRaw([]);
      setLoading(false);
      return () => {};
    }

    setLoading(true);
    setErrorMessage("");

    let commentsReady = false;
    let votesReady = false;
    const syncReady = () => {
      if (commentsReady && votesReady) {
        setLoading(false);
      }
    };

    const unsubscribeComments = commentsRef.orderBy("createdAt", "desc").onSnapshot(
      (snapshot) => {
        setCommentsRaw(snapshot.docs.map((commentDoc) => ({ id: commentDoc.id, ...commentDoc.data() })));
        commentsReady = true;
        syncReady();
      },
      () => {
        setErrorMessage("댓글 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    );

    const unsubscribeVotes = votesRef.onSnapshot(
      (snapshot) => {
        setVotesRaw(snapshot.docs.map((voteDoc) => ({ id: voteDoc.id, ...voteDoc.data() })));
        votesReady = true;
        syncReady();
      },
      () => {
        setErrorMessage("추천/비추천 데이터를 불러오지 못했습니다.");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeComments();
      unsubscribeVotes();
    };
  }, [commentsRef, votesRef]);

  useEffect(() => {
    const userIds = [...new Set(commentsRaw.map((comment) => comment.authorUserId).filter(Boolean))];
    if (!firebaseEnabled || !db || userIds.length === 0) {
      setDisplayNameByUserId({});
      return () => {};
    }

    const unsubscribers = userIds.map((userId) =>
      db
        .collection(USER_PUBLIC_PROFILE_COLLECTION)
        .doc(userId)
        .onSnapshot((snapshot) => {
          setDisplayNameByUserId((prev) => {
            const next = { ...prev };
            if (!snapshot.exists) {
              delete next[userId];
              return next;
            }
            const data = snapshot.data() || {};
            if (typeof data.nicknameNoun !== "string" || typeof data.nicknameTag !== "string") {
              delete next[userId];
              return next;
            }
            next[userId] = `${data.nicknameNoun}#${data.nicknameTag}`;
            return next;
          });
        })
    );

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [commentsRaw, firebaseEnabled]);

  const comments = useMemo(() => {
    const votesByComment = new Map();

    votesRaw.forEach((vote) => {
      const key = vote.commentId;
      if (!key) {
        return;
      }

      const value = Number(vote.value);
      if (!votesByComment.has(key)) {
        votesByComment.set(key, { upvotes: 0, downvotes: 0, myVote: 0 });
      }

      const target = votesByComment.get(key);
      if (value === 1) {
        target.upvotes += 1;
      }
      if (value === -1) {
        target.downvotes += 1;
      }
      if (user && vote.uid === user.uid) {
        target.myVote = value;
      }
    });

    const childrenByParent = new Map();
    commentsRaw.forEach((comment) => {
      const parentKey = comment.parentId ?? ROOT_KEY;
      if (!childrenByParent.has(parentKey)) {
        childrenByParent.set(parentKey, []);
      }
      childrenByParent.get(parentKey).push(comment);
    });

    const attachVoteMeta = (comment) => {
      const voteMeta = votesByComment.get(comment.id) ?? { upvotes: 0, downvotes: 0, myVote: 0 };
      return {
        ...comment,
        displayAuthorName: comment.authorUserId ? displayNameByUserId[comment.authorUserId] || comment.authorName : comment.authorName,
        ...voteMeta
      };
    };

    const roots = childrenByParent.get(ROOT_KEY) ?? [];
    const normalizedRoots = roots.map((root) => {
      const childComments = childrenByParent.get(root.id) ?? [];
      const sortedChildren = [...childComments]
        .map((child) => attachVoteMeta(child))
        .sort(sortByNetDescThenCreatedDesc)
        .map((child) => ({
          ...child,
          replies: []
        }));
      return {
        ...attachVoteMeta(root),
        replies: sortedChildren
      };
    });
    return normalizedRoots.sort(sortByNetDescThenCreatedDesc);
  }, [commentsRaw, displayNameByUserId, votesRaw, user]);

  const addComment = useCallback(
    async (text, parentId = null) => {
      if (!firebaseEnabled || !commentsRef || !user || !commentAuthorUserId) {
        return;
      }

      const trimmed = text.trim();
      if (!trimmed || trimmed.length > COMMENT_TEXT_MAX_LENGTH) {
        setErrorMessage(`댓글은 최대 ${COMMENT_TEXT_MAX_LENGTH}자까지 작성할 수 있습니다.`);
        return;
      }

      try {
        if (parentId) {
          const parent = commentsRaw.find((comment) => comment.id === parentId);
          if (!parent || parent.parentId) {
            setErrorMessage("답글은 1단계까지만 작성할 수 있습니다.");
            return;
          }
        }

        const commentRef = commentsRef.doc();
        const commentRateLimitRef = db
          .collection("users")
          .doc(user.uid)
          .collection(USER_RATE_LIMIT_COLLECTION)
          .doc(COMMENT_RATE_LIMIT_DOC_ID);
        const batch = db.batch();
        batch.set(commentRef, {
          text: trimmed,
          parentId,
          authorUserId: commentAuthorUserId,
          authorName: commentAuthorName || "모험가#0000",
          createdAt: serverTimestamp()
        });
        batch.set(
          commentRateLimitRef,
          {
            lastCommentAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        await batch.commit();
      } catch (error) {
        if (error?.code === "permission-denied") {
          setErrorMessage("댓글 저장 권한이 없습니다. (댓글 20초 쿨다운 또는 App Check/Rules 설정을 확인하세요)");
        } else {
          setErrorMessage("댓글 저장에 실패했습니다.");
        }
      }
    },
    [commentAuthorName, commentAuthorUserId, commentsRaw, commentsRef, user]
  );

  const toggleVote = useCallback(
    async (commentId, value) => {
      if (!firebaseEnabled || !votesRef || !user) {
        return;
      }
      if (value !== 1 && value !== -1) {
        return;
      }

      const voteDocId = `${commentId}_${user.uid}`;
      const voteRef = votesRef.doc(voteDocId);

      try {
        const snapshot = await voteRef.get();
        if (snapshot.exists && snapshot.data()?.value === value) {
          await voteRef.delete();
          return;
        }

        await voteRef.set({
          commentId,
          uid: user.uid,
          value,
          updatedAt: serverTimestamp()
        });
      } catch (error) {
        setErrorMessage("추천/비추천 처리에 실패했습니다.");
      }
    },
    [votesRef, user]
  );

  const deleteComment = useCallback(
    async (commentId) => {
      if (!firebaseEnabled || !commentsRef || !votesRef || !isAdmin) {
        return;
      }

      try {
        const idsToDelete = new Set();
        const collectChildren = (targetId) => {
          idsToDelete.add(targetId);
          commentsRaw.forEach((comment) => {
            if (comment.parentId === targetId) {
              collectChildren(comment.id);
            }
          });
        };
        collectChildren(commentId);

        const batch = db.batch();
        idsToDelete.forEach((id) => {
          batch.delete(commentsRef.doc(id));
        });

        votesRaw.forEach((vote) => {
          if (idsToDelete.has(vote.commentId)) {
            batch.delete(votesRef.doc(vote.id));
          }
        });

        await batch.commit();
      } catch (error) {
        setErrorMessage("댓글 삭제에 실패했습니다.");
      }
    },
    [commentsRaw, commentsRef, isAdmin, votesRaw, votesRef]
  );

  return {
    comments,
    loading,
    errorMessage,
    addComment,
    toggleVote,
    deleteComment
  };
}
