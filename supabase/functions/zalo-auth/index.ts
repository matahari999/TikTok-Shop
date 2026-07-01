// Zalo OAuth Edge Function
// 프론트엔드에서 받은 code + codeVerifier로 Zalo 토큰 교환 → Supabase 사용자 생성/조회 → 매직링크 토큰 반환
// 배포: supabase functions deploy zalo-auth

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
}

interface ZaloTokenResponse {
  access_token?: string
  error?: number
  message?: string
}

interface ZaloUserProfile {
  id: string
  name: string
  picture?: { data: { url: string } }
  error?: number
  message?: string
}

Deno.serve(async (req: Request) => {
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: CORS_HEADERS,
    })
  }

  try {
    const { code, codeVerifier } = await req.json()

    if (!code || !codeVerifier) {
      return new Response(JSON.stringify({ error: 'code와 codeVerifier가 필요합니다' }), {
        status: 400,
        headers: CORS_HEADERS,
      })
    }

    const zaloAppId = Deno.env.get('ZALO_APP_ID')
    const zaloAppSecret = Deno.env.get('ZALO_APP_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!zaloAppId || !zaloAppSecret) {
      return new Response(JSON.stringify({ error: 'Zalo 앱 설정이 누락되었습니다' }), {
        status: 500,
        headers: CORS_HEADERS,
      })
    }

    // ─── 1단계: Zalo authorization code → access_token 교환 ───
    // Zalo v4는 Authorization 헤더 대신 secret_key 헤더를 사용함
    const tokenRes = await fetch('https://oauth.zaloapp.com/v4/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'secret_key': zaloAppSecret,
      },
      body: new URLSearchParams({
        app_id: zaloAppId,
        code,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }),
    })

    const tokenData: ZaloTokenResponse = await tokenRes.json()

    if (!tokenData.access_token) {
      return new Response(
        JSON.stringify({ error: `Zalo 토큰 교환 실패: ${tokenData.message ?? '알 수 없는 오류'}` }),
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // ─── 2단계: Zalo 사용자 프로필 조회 ───
    const profileRes = await fetch('https://graph.zalo.me/v2.0/me?fields=id,name,picture', {
      headers: { 'access_token': tokenData.access_token },
    })

    const zaloUser: ZaloUserProfile = await profileRes.json()

    if (zaloUser.error || !zaloUser.id) {
      return new Response(
        JSON.stringify({ error: `Zalo 프로필 조회 실패: ${zaloUser.message ?? ''}` }),
        { status: 400, headers: CORS_HEADERS }
      )
    }

    // ─── 3단계: Supabase 사용자 생성 또는 조회 ───
    // Zalo는 이메일을 제공하지 않으므로 플레이스홀더 이메일 사용
    // 형식: zalo_{id}@zalo.auth.noreply — 실제 이메일 발송 없음
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)
    const placeholderEmail = `zalo_${zaloUser.id}@zalo.auth.noreply`

    const { error: createError } = await supabase.auth.admin.createUser({
      email: placeholderEmail,
      email_confirm: true, // 이메일 확인 불필요 (Zalo 인증으로 대체)
      user_metadata: {
        provider: 'zalo',
        zalo_id: zaloUser.id,
        full_name: zaloUser.name,
        avatar_url: zaloUser.picture?.data?.url ?? null,
      },
    })

    // 이미 존재하는 사용자는 정상 처리 (중복 에러 무시)
    if (createError && !createError.message.includes('already been registered')) {
      return new Response(
        JSON.stringify({ error: `사용자 생성 실패: ${createError.message}` }),
        { status: 500, headers: CORS_HEADERS }
      )
    }

    // ─── 4단계: 매직링크 토큰 생성 → 프론트엔드에 반환 ───
    // 프론트엔드에서 verifyOtp({ type: 'magiclink', token_hash }) 호출로 세션 수립
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: placeholderEmail,
    })

    if (linkError || !linkData?.properties?.hashed_token) {
      return new Response(
        JSON.stringify({ error: `세션 토큰 생성 실패: ${linkError?.message ?? ''}` }),
        { status: 500, headers: CORS_HEADERS }
      )
    }

    return new Response(
      JSON.stringify({
        hashed_token: linkData.properties.hashed_token,
        name: zaloUser.name,
        avatar_url: zaloUser.picture?.data?.url ?? null,
      }),
      { status: 200, headers: CORS_HEADERS }
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: CORS_HEADERS,
    })
  }
})
