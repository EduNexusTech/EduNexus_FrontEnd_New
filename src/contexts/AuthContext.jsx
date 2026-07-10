import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { setAuthHandlers } from '@/api/axios'
import { authService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { AuthSyncEvent, notifyAuthSync, subscribeAuthSync } from '@/utils/authSync'
import { loadAuth, saveAuth, clearAuth, getStoredAccessToken, getStoredRefreshToken, getStoredUser } from '@/utils/storage'

const AuthContext = createContext(null)

function buildAuthState(saved) {
  if (!saved?.accessToken) {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: false,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: true,
    }
  }

  return {
    user: saved.user || null,
    accessToken: saved.accessToken,
    refreshToken: saved.refreshToken,
    rememberMe: saved.rememberMe || false,
    isAuthenticated: true,
    isLoading: false,
    isHydrated: true,
  }
}

function resolveUserId(user) {
  if (!user) return null
  return user.user_id || user.id || user.email || user.username || null
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient()
  const [state, setState] = useState(() => buildAuthState(loadAuth()))
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    setState((prev) => ({ ...prev, isHydrated: true }))
  }, [])

  const persist = useCallback((next, rememberMe) => {
    saveAuth(
      {
        user: next.user,
        accessToken: next.accessToken,
        refreshToken: next.refreshToken,
        rememberMe,
      },
      rememberMe,
    )
  }, [])

  const applyAuthFromStorage = useCallback(
    (options = {}) => {
      const { silent = false } = options
      const saved = loadAuth()
      const nextState = buildAuthState(saved)
      const prevUserId = resolveUserId(stateRef.current.user)
      const nextUserId = resolveUserId(nextState.user)

      setState(nextState)

      if (!nextState.isAuthenticated) {
        queryClient.clear()
        return 'logout'
      }

      if (nextUserId && nextUserId !== prevUserId) {
        queryClient.clear()
        if (!silent) {
          const label =
            nextState.user?.full_name ||
            `${nextState.user?.first_name || ''} ${nextState.user?.last_name || ''}`.trim() ||
            nextState.user?.email ||
            'another account'
          toast(`Session updated — signed in as ${label}`)
        }
      }

      return 'updated'
    },
    [queryClient],
  )

  useEffect(() => {
    return subscribeAuthSync(({ event }) => {
      if (event === AuthSyncEvent.LOGOUT) {
        if (!stateRef.current.isAuthenticated) return
        clearAuth()
        setState(buildAuthState(null))
        queryClient.clear()
        toast('Signed out — session ended in another tab.')
        return
      }
      applyAuthFromStorage({ silent: false })
    })
  }, [applyAuthFromStorage, queryClient])

  const logout = useCallback(async () => {
    try {
      const refreshToken = stateRef.current.refreshToken || getStoredRefreshToken()
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // ignore logout errors
    }
    clearAuth()
    setState(buildAuthState(null))
    queryClient.clear()
    notifyAuthSync(AuthSyncEvent.LOGOUT)
  }, [queryClient])

  const updateTokens = useCallback(
    ({ accessToken, refreshToken }) => {
      setState((prev) => {
        const next = { ...prev, accessToken, refreshToken, isAuthenticated: Boolean(accessToken) }
        persist(next, prev.rememberMe)
        return next
      })
      notifyAuthSync(AuthSyncEvent.UPDATED)
    },
    [persist],
  )

  const login = useCallback(
    async (credentials, rememberMe = false) => {
      setState((prev) => ({ ...prev, isLoading: true }))
      try {
        const response = await authService.login(credentials)
        const data = unwrapData(response) || response?.data || response
        const user = data?.user
        const accessToken = data?.access_token || data?.access
        const refreshToken = data?.refresh_token || data?.refresh

        if (!accessToken) {
          throw new Error('Login succeeded but no access token was returned.')
        }

        const next = {
          user,
          accessToken,
          refreshToken,
          rememberMe,
          isAuthenticated: true,
          isLoading: false,
          isHydrated: true,
        }

        persist(next, rememberMe)
        setState(next)
        queryClient.clear()
        notifyAuthSync(AuthSyncEvent.UPDATED)

        setAuthHandlers({
          getAccessToken: () => accessToken,
          getRefreshToken: () => refreshToken,
          getUser: () => user,
          isSuperAdmin: () => Boolean(user?.is_super_admin),
          onTokensUpdated: updateTokens,
          onUnauthorized: logout,
        })

        return next
      } catch (error) {
        setState((prev) => ({ ...prev, isLoading: false }))
        throw error
      }
    },
    [persist, updateTokens, logout, queryClient],
  )

  const refreshProfile = useCallback(async () => {
    const response = await authService.profile()
    const payload = unwrapData(response)
    const user = payload?.user || payload
    setState((prev) => {
      const next = { ...prev, user }
      persist(next, prev.rememberMe)
      return next
    })
    notifyAuthSync(AuthSyncEvent.UPDATED)
  }, [persist])

  useEffect(() => {
    setAuthHandlers({
      getAccessToken: () => state.accessToken || getStoredAccessToken(),
      getRefreshToken: () => state.refreshToken || getStoredRefreshToken(),
      getUser: () => state.user || getStoredUser(),
      isSuperAdmin: () => Boolean(state.user?.is_super_admin),
      onTokensUpdated: updateTokens,
      onUnauthorized: logout,
    })
  }, [state.accessToken, state.refreshToken, state.user, updateTokens, logout])

  const value = useMemo(
    () => ({
      ...state,
      login,
      logout,
      updateTokens,
      refreshProfile,
      isSuperAdmin: Boolean(state.user?.is_super_admin),
      isOrgAdmin: Boolean(state.user?.is_org_admin),
      isSchoolAdmin: Boolean(state.user?.is_school_admin),
    }),
    [state, login, logout, updateTokens, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
