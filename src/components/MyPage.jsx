import { useEffect, useMemo, useState } from "react";
import { useAuthSession } from "../hooks/useAuthSession";
import Dither from "./Dither";
import { NavBar } from "./NavBar";
import { SiteFooter } from "./SiteFooter";

function sanitizeNicknameInput(value) {
  if (typeof value !== "string") {
    return "";
  }
  const alphaOnly = value.replace(/[^A-Za-z가-힣]/g, "");
  return Array.from(alphaOnly).slice(0, 8).join("");
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

export function MyPage() {
  const {
    firebaseEnabled,
    isLoggedIn,
    loading,
    profileLoading,
    userLabel,
    internalUserId,
    nicknameNoun,
    nicknameTag,
    nicknameChangeCount,
    canChangeNickname,
    nicknameChangeAvailableAt,
    nicknameNouns,
    updateNicknameNoun,
    loginWithGoogle,
    errorMessage
  } = useAuthSession();
  const [nounDraft, setNounDraft] = useState("");
  const [localMessage, setLocalMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    setNounDraft(nicknameNoun || "");
  }, [nicknameNoun]);

  const fullNickname = useMemo(() => {
    if (!nicknameNoun || !nicknameTag) {
      return userLabel;
    }
    return `${nicknameNoun}#${nicknameTag}`;
  }, [nicknameNoun, nicknameTag, userLabel]);

  const submitNickname = async (event) => {
    event.preventDefault();
    const ok = await updateNicknameNoun(nounDraft);
    setLocalMessage(ok ? "닉네임이 변경되었습니다." : "");
  };

  const handleShuffleClick = () => {
    if (!nicknameNouns.length) {
      return;
    }
    const randomNoun = nicknameNouns[Math.floor(Math.random() * nicknameNouns.length)];
    setNounDraft(sanitizeNicknameInput(randomNoun));
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-gray-950 text-slate-100">
      <div className="fixed inset-0 z-0">
        <Dither
          waveColor={[0.25, 0.15, 0.8]}
          disableAnimation={false}
          enableMouseInteraction={false}
          mouseRadius={0.35}
          colorNum={4}
          pixelSize={2}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.025}
          targetFps={24}
          dpr={0.75}
          antialias={false}
          preserveDrawingBuffer={false}
          powerPreference="low-power"
        />
      </div>
      <NavBar />
      <main className="relative z-10 mx-auto flex-grow w-full max-w-3xl px-4 py-10">
        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 shadow-panel">
          <h1 className="site-accent-text text-2xl font-semibold tracking-tight">마이페이지</h1>
          <p className="mt-2 text-sm text-slate-300">닉네임 명사 부분만 변경할 수 있으며, 태그 숫자는 고정됩니다.</p>

          {!firebaseEnabled ? (
            <p className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-sm text-amber-100">
              Firebase 설정이 없어 마이페이지를 사용할 수 없습니다.
            </p>
          ) : null}

          {loading ? <p className="mt-4 text-sm text-slate-300">로그인 상태 확인 중...</p> : null}

          {firebaseEnabled && !loading && !isLoggedIn ? (
            <div className="mt-5 rounded-xl border border-slate-700 bg-gray-950/40 p-4">
              <p className="text-sm text-slate-300">Google 로그인 후 마이페이지를 사용할 수 있습니다.</p>
              <button
                className="site-accent-outline-button mt-3 rounded-lg border px-3 py-2 text-sm font-semibold transition"
                onClick={loginWithGoogle}
                type="button"
              >
                Google 로그인
              </button>
            </div>
          ) : null}

          {firebaseEnabled && isLoggedIn ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-slate-700 bg-gray-950/40 p-4">
                <p className="text-xs uppercase text-slate-400">현재 닉네임</p>
                <p className="mt-1 text-xl font-semibold text-slate-100">{fullNickname}</p>
                {/* <p className="mt-2 text-xs text-slate-500">내부 userId(UUID): {internalUserId || "프로필 동기화 중"}</p> */}
              </div>

              <form className="rounded-xl border border-slate-700 bg-gray-950/40 p-4" onSubmit={submitNickname}>
                <p className="text-xs uppercase text-slate-400">닉네임 변경</p>
                <p className="mt-1 text-sm text-slate-300">
                  형식: <span className="font-semibold text-slate-100">명사#{nicknameTag || "0000"}</span>
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    className="site-accent-focus w-full rounded-lg border border-slate-700 bg-gray-950/90 px-3 py-2 text-sm text-slate-100 outline-none transition sm:w-1/2"
                    maxLength={8}
                    onChange={(event) => {
                      const rawValue = event.target.value;
                      if (isComposing) {
                        setNounDraft(rawValue);
                        return;
                      }
                      setNounDraft(sanitizeNicknameInput(rawValue));
                    }}
                    onCompositionEnd={(event) => {
                      setIsComposing(false);
                      setNounDraft(sanitizeNicknameInput(event.currentTarget.value));
                    }}
                    onCompositionStart={() => {
                      setIsComposing(true);
                    }}
                    pattern="[A-Za-z가-힣]{1,8}"
                    placeholder="명사 입력 (최대 8자)"
                    value={nounDraft}
                  />
                  <button
                    className="rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800/70"
                    onClick={handleShuffleClick}
                    type="button"
                  >
                    랜덤 셔플
                  </button>
                  <button
                    className="site-accent-button rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canChangeNickname || !nounDraft.trim() || profileLoading}
                    type="submit"
                  >
                    닉네임 변경
                  </button>
                </div>

                {!canChangeNickname ? (
                  <p className="mt-2 text-xs text-amber-200">
                    다음 변경 가능 시각: {formatDateTime(nicknameChangeAvailableAt)}
                  </p>
                ) : nicknameChangeCount === 0 ? (
                  <p className="mt-2 text-xs text-slate-400">첫 닉네임 변경은 즉시 1회 가능하며, 이후부터는 7일마다 1회 변경됩니다.</p>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">닉네임은 7일마다 1회 변경할 수 있습니다.</p>
                )}
                {localMessage ? <p className="mt-2 text-xs text-emerald-300">{localMessage}</p> : null}
                {errorMessage ? <p className="mt-2 text-xs text-rose-300">{errorMessage}</p> : null}
              </form>
            </div>
          ) : null}
        </section>
      </main>
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}
