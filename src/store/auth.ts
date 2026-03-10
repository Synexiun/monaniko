import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CustomerUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar: string | null
}

interface AuthStore {
  user: CustomerUser | null
  setUser: (user: CustomerUser) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    { name: 'mona-niko-auth' }
  )
)
