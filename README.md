# 해피 힐링 (React + TailwindCSS)

와우 7종류 힐러 가이드용 다크모드 사이트입니다.

## 실행

```bash
npm install
npm run dev
```

## Firebase 설정

1. `.env.example`을 복사해서 `.env` 생성
2. Firebase 프로젝트 키 + `VITE_FIREBASE_APPCHECK_SITE_KEY` 입력
3. Authentication에서 `Google` 로그인만 활성화
4. Firestore 생성 후 `firestore.rules` 배포
5. 관리자 계정 UID를 `admins/{uid}` 문서로 직접 추가
6. Firebase Console에서 App Check(Web, reCAPTCHA v3) 등록 후 Firestore Enforce 활성화

## 핵심 편집 위치

- 힐러 데이터/수정일/본문: `src/data/healers.js`
- 시뮬레이터 활성 여부(false 처리): `src/data/simulators.js`
- Firebase 초기화: `src/lib/firebase.js`
- 인증 훅: `src/hooks/useAuthSession.jsx`
- 섹션 댓글/답글/투표 훅: `src/hooks/useSectionDiscussion.js`

## 스킬 자동 링크 문법

가이드 본문에서 아래처럼 입력하면 자동으로 Wowhead 링크/툴팁/아이콘이 적용됩니다.

```txt
[[스킬명#12345]]
```

예시:

```txt
[[회복#774]], [[치유의 비#73920]]
```

## 특성 트리

- 각 힐러에 `talentTrees`가 정의되어 있으며 3개 탭으로 구성됩니다.
  - `공용 특성`
  - `전문화 특성`
  - `영웅 특성`
- 읽기 전용 트리이며 클릭 편집은 없고, 노드 hover 시 정보가 표시됩니다.
- `spellId`가 있는 노드는 Wowhead 툴팁/아이콘이 붙습니다.
- 편집 위치: `src/data/healers.js`

## 댓글 아키텍처

- 기본 사용자: Google 로그인 사용자
- 관리자: Google 로그인 후 `admins/{uid}` 존재 시 삭제 권한 부여
- 저장 경로(섹션별 분리):
  - 댓글: `guides/{guideSlug}/sections/{sectionId}/comments/{commentId}`
  - 추천/비추천: `guides/{guideSlug}/sections/{sectionId}/votes/{commentId_uid}`
- 댓글 작성 쿨다운: 20초 (댓글 문서 + `users/{uid}/rateLimits/comments` 배치 write를 rules에서 강제)
- 댓글은 `parentId`로 답글(대댓글) 구조를 만듭니다.

## 보안 운영 체크리스트

- Firebase API Key 제한: HTTP referrer를 운영 도메인으로 제한
- Firebase Auth Authorized domains: 실제 운영 도메인만 허용
- Firestore 사용량/비용 알림 설정
- Auth 가입 급증/쓰기 급증 알림 설정
