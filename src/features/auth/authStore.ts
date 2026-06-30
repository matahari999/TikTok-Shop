import { create } from 'zustand'
import { supabase } from '@/shared/lib/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  initialized: boolean
  init: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({
      user: session?.user ? { id: session.user.id, email: session.user.email ?? undefined, name: session.user.user_metadata?.name } : null,
      initialized: true,
    })
    supabase.auth.onAuthStateChange((_e, session) => {
      set({ user: session?.user ? { id: session.user.id, email: session.user.email ?? undefined, name: session.user.user_metadata?.name } : null })
    })
  },

  login: async (email, password) => {
    set({ loading: true })
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    set({ loading: false })
    if (error) throw error
  },

  register: async (email, password, name) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/app/dashboard`,
      },
    })
    set({ loading: false })
    if (error) throw error
    // identities가 빈 배열이면 이미 가입된 이메일 (user_repeated_signup)
    if (data.user && data.user.identities?.length === 0) {
      throw new Error('REPEATED_SIGNUP')
    }
  },

  resetPassword: async (email) => {
    set({ loading: true })
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    set({ loading: false })
    if (error) throw error
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))
