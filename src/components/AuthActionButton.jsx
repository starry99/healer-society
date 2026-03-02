import { useAuthSession } from "../hooks/useAuthSession";

export function AuthActionButton({ showUserLabel = false }) {
  const { firebaseEnabled, isAdmin, isLoggedIn, loading, loginWithGoogle, logout, userLabel } = useAuthSession();

  if (!firebaseEnabled) {
    return (
      <button
        className="cursor-not-allowed rounded-xl border border-slate-700/80 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-400 opacity-80"
        disabled
        title="Firebase 환경변수를 설정하면 로그인 버튼이 활성화됩니다."
        type="button"
      >
        Google 로그인
      </button>
    );
  }

  if (loading) {
    return (
      <span className="rounded-xl border border-slate-700/80 bg-slate-900/75 px-3 py-1.5 text-xs text-slate-300">
        인증 확인 중...
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {isLoggedIn && isAdmin ? (
        <span className="rounded-lg border border-amber-300/60 bg-amber-300/15 px-2 py-1 text-[11px] font-semibold text-amber-100">
          관리자
        </span>
      ) : null}
      {showUserLabel && isLoggedIn ? (
        <span className="max-w-[140px] truncate rounded-lg border border-slate-700/80 bg-slate-900/65 px-2 py-1 text-xs text-slate-300">
          {userLabel}
        </span>
      ) : null}
      <button
        className="rounded-xl border border-violet-300/55 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-violet-100 transition hover:bg-violet-300/12"
        onClick={isLoggedIn ? logout : loginWithGoogle}
        type="button"
      >
        {isLoggedIn ? "로그아웃" : "Google 로그인"}
      </button>
    </div>
  );
}
