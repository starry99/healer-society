import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  appCheckConfigured,
  appCheckEnabled,
  appCheckLoadError,
  auth,
  db,
  firebaseEnabled,
  firebaseLoadError,
  googleProvider,
  serverTimestamp
} from "../lib/firebase";

const AuthSessionContext = createContext(null);
const USER_PROFILE_COLLECTION = "users";
const USER_PUBLIC_PROFILE_COLLECTION = "userPublicProfiles";
const NICKNAME_CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const NICKNAME_ALLOWED_REGEX = /^[A-Za-z가-힣]+$/;

const WOW_NICKNAME_NOUNS = [
  "잘아타스",
  "실바나스",
  "스랄",
  "제이나",
  "가로쉬",
  "줄진",
  "볼진",
  "안두인",
  "살게라스",
  "일리단",
  "아서스",
  "아즈샤라",
  "말퓨리온",
  "티란데",
  "알레리아",
  "간수",
  "디멘시우스",
  "살라다르",
  "아르거스",
  "아제로스",
  "굴단",
  "넬쥴",
  "안수레크",
  "갤리윅스",
  "리아드린",
  "브란",
  "데스윙",
  "카드가",
  "메디브",
  "우서",
  "사울팽",
  "렉사르",
  "가로나",
  "킬제덴",
  "켈투자드",
  "아키몬드",
  "브원삼디",
  "느조스",
  "요그사론",
  "이샤라즈",
  "크툰",
  "아만툴",
  "데나트리우스",
  "발리라",
  "만노로스",
  "오닉시아",
  "라그나로스",
  "알갈론",
  "블랙핸드",
  "그훈",
  "틴드랄",
  "피락",
  "아카마",
  "이렐",
  "나타노스",
  "바리안",
  "투랄리온",
  "멕카토크",
  "벨렌",
  "가즈로",
  "탈리스라",
  "테론",
  "화이트메인",
];

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

function normalizeNicknameNoun(value) {
  if (typeof value !== "string") {
    return "";
  }
  const normalized = value.replace(/\s+/g, "").trim().slice(0, 12);
  if (!normalized) {
    return "";
  }
  if (!NICKNAME_ALLOWED_REGEX.test(normalized)) {
    return "";
  }
  return normalized;
}

function makeRandomNicknameNoun() {
  return WOW_NICKNAME_NOUNS[Math.floor(Math.random() * WOW_NICKNAME_NOUNS.length)];
}

function makeRandomNicknameTag() {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

function makeUserId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `uid-${Math.random().toString(16).slice(2, 10)}-${Date.now().toString(16)}`;
}

function fallbackUserLabel(user) {
  if (!user) {
    return "게스트";
  }
  return `유저-${user.uid.slice(0, 6)}`;
}

function formatNickname(noun, tag) {
  if (!noun || !tag) {
    return "";
  }
  return `${noun}#${tag}`;
}

export function AuthSessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!firebaseEnabled || !auth) {
      setLoading(false);
      return () => { };
    }

    const unsubscribe = auth.onAuthStateChanged((nextUser) => {
      setUser(nextUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseEnabled || !db || !user) {
      setProfile(null);
      setProfileLoading(false);
      return () => { };
    }

    setProfileLoading(true);
    const profileRef = db.collection(USER_PROFILE_COLLECTION).doc(user.uid);
    let creating = false;
    const unsubscribe = profileRef.onSnapshot(
      async (snapshot) => {
        if (snapshot.exists) {
          setProfile(snapshot.data());
          setProfileLoading(false);
          return;
        }

        if (creating) {
          return;
        }

        creating = true;
        try {
          await profileRef.set({
            userId: makeUserId(),
            nicknameNoun: makeRandomNicknameNoun(),
            nicknameTag: makeRandomNicknameTag(),
            nicknameChangeCount: 0,
            createdAt: serverTimestamp(),
            nicknameUpdatedAt: null,
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          setErrorMessage("유저 프로필 생성에 실패했습니다.");
          setProfileLoading(false);
        } finally {
          creating = false;
        }
      },
      () => {
        setErrorMessage("유저 프로필을 불러오지 못했습니다.");
        setProfile(null);
        setProfileLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!firebaseEnabled || !db || !user || !profile?.userId || !profile?.nicknameNoun || !profile?.nicknameTag) {
      return () => {};
    }

    const publicProfileRef = db.collection(USER_PUBLIC_PROFILE_COLLECTION).doc(profile.userId);
    publicProfileRef
      .set(
        {
          userId: profile.userId,
          nicknameNoun: profile.nicknameNoun,
          nicknameTag: profile.nicknameTag,
          authUid: user.uid,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      )
      .catch(() => {
        setErrorMessage("공개 프로필 동기화에 실패했습니다.");
      });

    return () => {};
  }, [profile?.nicknameNoun, profile?.nicknameTag, profile?.userId, user?.uid]);

  useEffect(() => {
    if (!firebaseEnabled || !db || !user) {
      setIsAdmin(false);
      return () => { };
    }

    const adminState = {
      admins: false,
      admin: false
    };
    const syncAdminState = () => {
      setIsAdmin(adminState.admins || adminState.admin);
    };

    const unsubscribeAdmins = db
      .collection("admins")
      .doc(user.uid)
      .onSnapshot(
        (snapshot) => {
          adminState.admins = snapshot.exists;
          syncAdminState();
        },
        () => {
          adminState.admins = false;
          syncAdminState();
        }
      );

    const unsubscribeAdmin = db
      .collection("admin")
      .doc(user.uid)
      .onSnapshot(
        (snapshot) => {
          adminState.admin = snapshot.exists;
          syncAdminState();
        },
        () => {
          adminState.admin = false;
          syncAdminState();
        }
      );

    return () => {
      unsubscribeAdmins();
      unsubscribeAdmin();
    };
  }, [user]);

  useEffect(() => {
    if (firebaseLoadError) {
      setErrorMessage(firebaseLoadError);
    }
  }, [firebaseLoadError]);

  useEffect(() => {
    if (appCheckLoadError) {
      setErrorMessage((prev) => prev || appCheckLoadError);
    }
  }, [appCheckLoadError]);

  const loginWithGoogle = useCallback(async () => {
    if (!firebaseEnabled || !auth || !googleProvider) {
      setErrorMessage("Firebase 설정이 없어 Google 로그인을 사용할 수 없습니다.");
      return;
    }

    try {
      setErrorMessage("");
      await auth.signInWithPopup(googleProvider);
    } catch (error) {
      setErrorMessage("Google 로그인에 실패했습니다.");
    }
  }, []);

  const logout = useCallback(async () => {
    if (!firebaseEnabled || !auth) {
      return;
    }
    try {
      await auth.signOut();
    } catch (error) {
      setErrorMessage("로그아웃에 실패했습니다.");
    }
  }, []);

  const updateNicknameNoun = useCallback(
    async (nextNounRaw) => {
      if (!firebaseEnabled || !db || !user || !profile) {
        setErrorMessage("로그인 후 프로필이 준비되면 닉네임을 변경할 수 있습니다.");
        return false;
      }

      const nextNoun = normalizeNicknameNoun(nextNounRaw);
      if (!nextNoun) {
        setErrorMessage("닉네임 명사는 한글/영문만 입력할 수 있습니다.");
        return false;
      }
      if (nextNoun === profile.nicknameNoun) {
        setErrorMessage("현재와 다른 명사를 입력해 주세요.");
        return false;
      }

      const changeCount = Number.isFinite(profile.nicknameChangeCount) ? Number(profile.nicknameChangeCount) : 0;
      const now = Date.now();
      const lastChangedAt = toMillis(profile.nicknameUpdatedAt);
      if (changeCount > 0 && lastChangedAt && now - lastChangedAt < NICKNAME_CHANGE_COOLDOWN_MS) {
        setErrorMessage("닉네임은 첫 변경 이후 7일마다 1번만 변경할 수 있습니다.");
        return false;
      }

      try {
        setErrorMessage("");
        await db
          .collection(USER_PROFILE_COLLECTION)
          .doc(user.uid)
          .set(
            {
              nicknameNoun: nextNoun,
              nicknameChangeCount: changeCount + 1,
              nicknameUpdatedAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            },
            { merge: true }
          );
        return true;
      } catch (error) {
        if (error?.code === "permission-denied") {
          setErrorMessage("권한 오류로 닉네임 변경에 실패했습니다. Firestore rules 배포 상태를 확인해 주세요.");
        } else {
          setErrorMessage("닉네임 변경에 실패했습니다.");
        }
        return false;
      }
    },
    [profile, user]
  );

  const nicknameChangeAvailableAt = useMemo(() => {
    if (!profile) {
      return null;
    }
    const changeCount = Number.isFinite(profile.nicknameChangeCount) ? Number(profile.nicknameChangeCount) : 0;
    if (changeCount === 0) {
      return null;
    }
    if (!profile.nicknameUpdatedAt) {
      return null;
    }
    const lastChangedAt = toMillis(profile.nicknameUpdatedAt);
    if (!lastChangedAt) {
      return null;
    }
    return new Date(lastChangedAt + NICKNAME_CHANGE_COOLDOWN_MS);
  }, [profile?.nicknameUpdatedAt]);

  const canChangeNickname = useMemo(() => {
    if (!profile) {
      return false;
    }
    const changeCount = Number.isFinite(profile.nicknameChangeCount) ? Number(profile.nicknameChangeCount) : 0;
    if (changeCount === 0) {
      return true;
    }
    const lastChangedAt = toMillis(profile.nicknameUpdatedAt);
    if (!lastChangedAt) {
      return true;
    }
    return Date.now() - lastChangedAt >= NICKNAME_CHANGE_COOLDOWN_MS;
  }, [profile]);

  const userLabel = useMemo(() => {
    const nickname = formatNickname(profile?.nicknameNoun, profile?.nicknameTag);
    if (nickname) {
      return nickname;
    }
    return fallbackUserLabel(user);
  }, [profile?.nicknameNoun, profile?.nicknameTag, user]);

  const value = useMemo(
    () => ({
      user,
      userLabel,
      internalUserId: profile?.userId || null,
      nicknameNoun: profile?.nicknameNoun || "",
      nicknameTag: profile?.nicknameTag || "",
      nicknameChangeCount: Number.isFinite(profile?.nicknameChangeCount) ? Number(profile.nicknameChangeCount) : 0,
      profileLoading,
      isLoggedIn: Boolean(user),
      isAdmin,
      loading,
      errorMessage,
      firebaseEnabled,
      appCheckConfigured,
      appCheckEnabled,
      appCheckLoadError,
      canChangeNickname,
      nicknameChangeAvailableAt,
      nicknameNouns: WOW_NICKNAME_NOUNS,
      updateNicknameNoun,
      loginWithGoogle,
      loginAsAdmin: loginWithGoogle,
      logout
    }),
    [
      appCheckConfigured,
      appCheckEnabled,
      appCheckLoadError,
      canChangeNickname,
      errorMessage,
      firebaseEnabled,
      isAdmin,
      loading,
      loginWithGoogle,
      logout,
      nicknameChangeAvailableAt,
      profile,
      profileLoading,
      updateNicknameNoun,
      user,
      userLabel
    ]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

const fallbackSession = {
  user: null,
  userLabel: "게스트",
  internalUserId: null,
  nicknameNoun: "",
  nicknameTag: "",
  nicknameChangeCount: 0,
  profileLoading: false,
  isLoggedIn: false,
  isAdmin: false,
  loading: false,
  errorMessage: "",
  firebaseEnabled: false,
  appCheckConfigured: false,
  appCheckEnabled: false,
  appCheckLoadError: "",
  canChangeNickname: false,
  nicknameChangeAvailableAt: null,
  nicknameNouns: [],
  updateNicknameNoun: async () => false,
  loginWithGoogle: async () => { },
  loginAsAdmin: async () => { },
  logout: async () => { }
};

export function useAuthSession() {
  return useContext(AuthSessionContext) ?? fallbackSession;
}
