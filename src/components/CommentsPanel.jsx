import { useEffect, useMemo, useState } from "react";

const PAGE_ITEM_LIMIT = 3;
const COMMENT_TEXT_MAX_LENGTH = 100;

function paginateCommentThreads(comments) {
  const pages = [];
  let currentPage = [];
  let usedSlots = 0;

  const flushPage = () => {
    if (currentPage.length === 0) {
      return;
    }
    pages.push(currentPage);
    currentPage = [];
    usedSlots = 0;
  };

  comments.forEach((comment) => {
    const replies = Array.isArray(comment.replies) ? comment.replies : [];
    let replyIndex = 0;
    let isFirstChunk = true;

    while (true) {
      if (usedSlots >= PAGE_ITEM_LIMIT) {
        flushPage();
      }

      const remaining = PAGE_ITEM_LIMIT - usedSlots;
      const replySlots = Math.max(remaining - 1, 0);
      const replyChunk = replies.slice(replyIndex, replyIndex + replySlots);

      currentPage.push({
        ...comment,
        replies: replyChunk,
        splitFromPreviousPage: !isFirstChunk
      });
      usedSlots += 1 + replyChunk.length;
      replyIndex += replyChunk.length;
      isFirstChunk = false;

      if (replyIndex >= replies.length) {
        break;
      }
      flushPage();
    }
  });

  flushPage();
  return pages;
}

function formatDate(value) {
  if (!value) {
    return "방금 전";
  }

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleString("ko-KR", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }

  return new Date(value).toLocaleString("ko-KR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function formatAuthor(comment) {
  if (comment.displayAuthorName) {
    return comment.displayAuthorName;
  }
  if (comment.authorName) {
    return comment.authorName.includes("@") ? comment.authorName.split("@")[0] : comment.authorName;
  }
  if (comment.authorUserId) {
    return `모험가-${String(comment.authorUserId).slice(0, 8)}`;
  }
  if (comment.authorUid) {
    return `익명-${comment.authorUid.slice(0, 6)}`;
  }
  return "익명";
}

function VoteButton({ active, count, onClick, tone, label }) {
  const styles =
    tone === "up"
      ? active
        ? "border-emerald-300/70 bg-emerald-300/20 text-emerald-100"
        : "border-slate-600 text-slate-300 hover:border-emerald-300/50 hover:text-emerald-100"
      : active
        ? "border-rose-300/70 bg-rose-300/20 text-rose-100"
        : "border-slate-600 text-slate-300 hover:border-rose-300/50 hover:text-rose-100";

  return (
    <button className={`rounded-md border px-2 py-1 text-[11px] font-semibold transition ${styles}`} onClick={onClick} type="button">
      {label} {count}
    </button>
  );
}

function CommentCard({ comment, currentUser, depth, isAdmin, onDeleteComment, onSubmitReply, onToggleVote }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyDraft, setReplyDraft] = useState("");
  const canReply = depth === 0 && Boolean(currentUser);

  const submitReply = async (event) => {
    event.preventDefault();
    const trimmed = replyDraft.trim();
    if (!trimmed || trimmed.length > COMMENT_TEXT_MAX_LENGTH) {
      return;
    }
    await onSubmitReply(comment.id, trimmed);
    setReplyDraft("");
    setReplyOpen(false);
  };

  return (
    <article
      className={`rounded-lg border border-slate-700 bg-gray-950/70 p-3 ${depth > 0 ? "site-accent-left-border ml-4 border-l-2 bg-slate-900/70" : ""
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="site-accent-text text-xs font-semibold">{formatAuthor(comment)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <p className="text-[11px] text-slate-400">{formatDate(comment.createdAt)}</p>
          {isAdmin ? (
            <button
              className="rounded-md border border-rose-300/50 px-2 py-1 text-[11px] font-semibold text-rose-200 transition hover:bg-rose-300/10"
              onClick={() => onDeleteComment(comment.id)}
              type="button"
            >
              삭제
            </button>
          ) : null}
        </div>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-100">{comment.text}</p>

      <div className="mt-3 flex items-center gap-2">
        <VoteButton
          active={comment.myVote === 1}
          count={comment.upvotes}
          label="추천"
          onClick={() => onToggleVote(comment.id, 1)}
          tone="up"
        />
        <VoteButton
          active={comment.myVote === -1}
          count={comment.downvotes}
          label="비추천"
          onClick={() => onToggleVote(comment.id, -1)}
          tone="down"
        />
        {depth === 0 ? (
          <button
            className="rounded-md border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-55"
            disabled={!canReply}
            onClick={() => setReplyOpen((prev) => !prev)}
            title={!currentUser ? "로그인 후 답글 작성 가능" : undefined}
            type="button"
          >
            답글
          </button>
        ) : null}
      </div>

      {replyOpen && canReply ? (
        <form className="mt-3 space-y-2" onSubmit={submitReply}>
          <textarea
            className="site-accent-focus h-20 w-full resize-none rounded-md border border-slate-700 bg-gray-950/90 px-2 py-1.5 text-sm text-slate-100 outline-none transition"
            maxLength={COMMENT_TEXT_MAX_LENGTH}
            onChange={(event) => setReplyDraft(event.target.value)}
            placeholder={`답글을 작성하세요. (최대 ${COMMENT_TEXT_MAX_LENGTH}자)`}
            value={replyDraft}
          />
          <p className="text-right text-[11px] text-slate-400">
            {replyDraft.length}/{COMMENT_TEXT_MAX_LENGTH}
          </p>
          <button
            className="site-accent-button rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!replyDraft.trim() || !currentUser || replyDraft.trim().length > COMMENT_TEXT_MAX_LENGTH}
            type="submit"
          >
            답글 등록
          </button>
        </form>
      ) : null}

      {comment.replies?.length > 0 ? (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => (
            <CommentCard
              comment={reply}
              currentUser={currentUser}
              depth={depth + 1}
              isAdmin={isAdmin}
              key={reply.id}
              onDeleteComment={onDeleteComment}
              onSubmitReply={onSubmitReply}
              onToggleVote={onToggleVote}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function CommentsPanel({
  comments,
  currentUser,
  commentReady,
  errorMessage,
  firebaseEnabled,
  appCheckConfigured,
  appCheckEnabled,
  isAdmin,
  loading,
  onDeleteComment,
  onSubmitComment,
  onSubmitReply,
  onToggleVote,
  sectionTitle,
  userLabel
}) {
  const [draft, setDraft] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const commentPages = useMemo(() => paginateCommentThreads(comments), [comments]);
  const totalPages = Math.max(commentPages.length, 1);
  const currentPageComments = commentPages[pageIndex] || [];

  useEffect(() => {
    setPageIndex(0);
  }, [comments]);

  useEffect(() => {
    if (pageIndex < totalPages) {
      return;
    }
    setPageIndex(Math.max(totalPages - 1, 0));
  }, [pageIndex, totalPages]);

  const submitComment = async (event) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || trimmed.length > COMMENT_TEXT_MAX_LENGTH) {
      return;
    }
    await onSubmitComment(trimmed);
    setDraft("");
  };

  return (
    <aside className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-4 shadow-panel">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="site-accent-text text-md font-semibold">섹션 댓글 - {sectionTitle}</p>
          <p className="mt-1 text-xs text-slate-400">닉네임: {userLabel}</p>
        </div>
        {isAdmin ? (
          <span className="rounded-md border border-amber-300/60 bg-amber-300/15 px-2 py-1 text-[11px] font-semibold text-amber-100">
            관리자 모드
          </span>
        ) : null}
      </div>

      {!firebaseEnabled ? (
        <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
          Firebase 환경변수가 없어 DB 연결이 비활성화되었습니다.
        </p>
      ) : null}
      {firebaseEnabled && !currentUser ? (
        <p className="mt-3 rounded-lg border border-slate-700 bg-gray-950/45 px-3 py-2 text-xs text-slate-300">
          댓글 작성은 상단 Google 로그인 후 이용할 수 있습니다.
        </p>
      ) : null}
      {firebaseEnabled && !appCheckConfigured ? (
        <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
          App Check 사이트 키가 설정되지 않았습니다. 스팸 방지를 위해 `VITE_FIREBASE_APPCHECK_SITE_KEY`를 설정하세요.
        </p>
      ) : null}
      {firebaseEnabled && appCheckConfigured && !appCheckEnabled ? (
        <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
          App Check 초기화에 실패했습니다. Firebase App Check 설정/도메인을 확인하세요.
        </p>
      ) : null}
      {firebaseEnabled && currentUser && !commentReady ? (
        <p className="mt-3 rounded-lg border border-slate-700 bg-gray-950/45 px-3 py-2 text-xs text-slate-300">
          프로필 동기화 중입니다. 잠시 후 댓글 작성이 활성화됩니다.
        </p>
      ) : null}
      {errorMessage ? (
        <p className="mt-3 rounded-lg border border-rose-300/40 bg-rose-300/10 px-3 py-2 text-xs text-rose-100">{errorMessage}</p>
      ) : null}

      <form className="mt-4 space-y-3" onSubmit={submitComment}>
        <textarea
          className="site-accent-focus h-24 w-full resize-none rounded-lg border border-slate-700 bg-gray-950/85 px-3 py-2 text-sm text-slate-100 outline-none transition"
          disabled={!firebaseEnabled || !currentUser || !commentReady}
          maxLength={COMMENT_TEXT_MAX_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={`이 섹션에 대한 댓글을 작성하세요. (최대 ${COMMENT_TEXT_MAX_LENGTH}자)`}
          value={draft}
        />
        <p className="text-right text-[11px] text-slate-400">
          {draft.length}/{COMMENT_TEXT_MAX_LENGTH}
        </p>
        {/* <p className="text-[11px] text-slate-400">스팸 방지를 위해 댓글은 20초에 1회 작성할 수 있습니다.</p> */}
        <button
          className="site-accent-button inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!draft.trim() || !firebaseEnabled || !currentUser || !commentReady || draft.trim().length > COMMENT_TEXT_MAX_LENGTH}
          type="submit"
        >
          댓글 저장
        </button>
      </form>

      <div className="mt-5 max-h-[580px] space-y-3 overflow-auto pr-1">
        {loading ? <p className="text-sm text-slate-400">댓글 불러오는 중...</p> : null}
        {!loading && comments.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-400">아직 댓글이 없습니다.</p>
        ) : null}
        {!loading
          ? currentPageComments.map((comment, idx) => (
            <CommentCard
              comment={comment}
              currentUser={currentUser}
              depth={0}
              isAdmin={isAdmin}
              key={`${comment.id}-${pageIndex}-${idx}`}
              onDeleteComment={onDeleteComment}
              onSubmitReply={onSubmitReply}
              onToggleVote={onToggleVote}
            />
          ))
          : null}
      </div>
      {!loading && comments.length > 0 ? (
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-700/70 pt-3">
          <p className="text-xs text-slate-400">
            페이지 {pageIndex + 1} / {totalPages} (페이지당 댓글+답글 최대 {PAGE_ITEM_LIMIT}개)
          </p>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pageIndex === 0}
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              type="button"
            >
              이전
            </button>
            <button
              className="rounded-md border border-slate-600 px-2 py-1 text-xs text-slate-200 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={pageIndex >= totalPages - 1}
              onClick={() => setPageIndex((prev) => Math.min(prev + 1, totalPages - 1))}
              type="button"
            >
              다음
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
