# Board BE

NestJS 기반 게시판 API 서버입니다. 인증은 JWT(access/refresh)로 처리하고, 게시글/댓글 CRUD를 제공합니다.

## 주요 기능
- 이메일/비밀번호 회원가입 및 로그인
- JWT access/refresh 토큰 발급과 리프레시 로테이션
- 게시글 CRUD 및 커서 기반 페이지네이션
- 댓글 CRUD
- Swagger API 문서 제공 (`/api-docs`)

## 기술 스택
- NestJS, TypeScript
- PostgreSQL, TypeORM
- JWT, Passport (local/jwt)
- Swagger, class-validator/transformer

## 요구 사항
- Node.js (권장: 18+)
- pnpm (권장)
- PostgreSQL

## 환경 변수
`.env` 파일에 아래 값을 설정합니다.

```env
# DB
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=postgres
DB_SCHEMA=public

# JWT
JWT_ACCESS_SECRET_KEY=your_access_secret
JWT_ACCESS_EXPIRES_IN=30m
JWT_REFRESH_SECRET_KEY=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# Cookie
COOKIE_REFRESH_NAME=refresh_token
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
# COOKIE_DOMAIN=
```

## 설치 및 실행

```bash
pnpm install
pnpm start:dev
```

기본 포트는 `3000`입니다. (`PORT` 환경변수로 변경 가능)

## API 인증 방식
- Access Token: `Authorization: Bearer <token>`
- Refresh Token: `COOKIE_REFRESH_NAME` 쿠키로 전달 (path: `/auth`)

## API 요약

### Auth
- `POST /auth/register` 회원가입
- `POST /auth/login` 로그인 (access token 반환, refresh token 쿠키 저장)
- `POST /auth/refresh` access token 재발급
- `POST /auth/logout` 로그아웃

### Users
- `GET /users/me` 내 기본 정보 (JWT 필요)
- `GET /users/profile` 내 상세 정보 (JWT 필요)

### Posts
- `POST /posts` 게시글 작성 (JWT 필요)
- `GET /posts` 게시글 목록 (cursor, limit)
- `GET /posts/:id` 게시글 상세
- `PATCH /posts/:id` 게시글 수정 (JWT 필요)
- `DELETE /posts/:id` 게시글 삭제 (JWT 필요)

### Comments
- `GET /comment/:postId` 댓글 목록
- `POST /comment/:postId` 댓글 작성 (JWT 필요)
- `PATCH /comment/:commentId` 댓글 수정 (JWT 필요)
- `DELETE /comment/:commentId` 댓글 삭제 (JWT 필요)

## Swagger
- `http://localhost:3000/api-docs`

## 스크립트
- `pnpm start` 로컬 실행
- `pnpm start:dev` 개발 모드
- `pnpm build` 빌드
- `pnpm test` 테스트
- `pnpm test:e2e` E2E 테스트

## 프로젝트 구조
- `src/auth` 인증/토큰/가드
- `src/user` 유저 도메인
- `src/post` 게시글 도메인
- `src/comment` 댓글 도메인
- `src/common` 공통 설정/로거
