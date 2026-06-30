# TikTok Shop VN — 초기 설정

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 → New Project 생성
2. Project Settings → API → `Project URL`과 `anon public` 키 복사

## 2. .env 수정

```
VITE_SUPABASE_URL=https://xxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

## 3. 데이터베이스 테이블 생성

Supabase Dashboard → SQL Editor → `supabase/migrations/001_init.sql` 내용을 붙여넣고 실행

## 4. 이메일 발송 설정 (Resend SMTP — 필수)

Supabase 기본 SMTP는 Gmail 스팸 필터에 걸릴 수 있고, 무료 플랜 rate limit(2건/시간)이 있습니다.
Resend 무료 플랜(하루 3,000건)으로 교체하는 절차:

### 4-1. Resend 가입 및 API 키 발급

1. https://resend.com 접속 → 구글 계정으로 가입
2. 좌측 **API Keys** → **Create API Key** → 이름 `tiktok-shop-vn` 입력 → **Full Access** 선택 → Create
3. 발급된 키(`re_xxxxxx...`) 복사 (한 번만 표시됨)

### 4-2. Supabase에 SMTP 설정

Supabase Dashboard → **Project Settings** → **Authentication** → **SMTP Settings**

| 항목 | 값 |
|------|----|
| Enable Custom SMTP | ON |
| Sender name | TikTok Shop VN |
| Sender email | `onboarding@resend.dev` (무료 도메인 인증 전) |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | `re_xxxxxx...` (4-1에서 복사한 API 키) |

→ **Save** 클릭

### 4-3. Supabase URL 설정 확인

Supabase Dashboard → **Authentication** → **URL Configuration**

| 항목 | 값 |
|------|----|
| Site URL | `http://localhost:3333` (개발 중) |
| Redirect URLs | `http://localhost:3333/**` (이 패턴이 /reset-password, /app/dashboard 모두 포함) |

→ **Save** 클릭

### 4-4. 확인

새 이메일로 회원가입 시도 → Resend Dashboard → **Emails** 탭에서 발송 로그 확인 가능

## 5. 개발 서버 실행

```bash
cd D:\tiktok-shop-vn
npm run dev
# → http://localhost:3333
```

## 수수료 구조 (2026 기준)

| 항목 | 요율 |
|------|------|
| 플랫폼 수수료 (마켓플레이스) | 12.5% |
| 거래 처리 수수료 | 6% |
| 주문 처리 수수료 | 3,000₫/건 |
