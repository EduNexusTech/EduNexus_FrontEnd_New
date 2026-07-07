import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthHandlers } from '@/api/axios'
import { authService } from '@/api/services'
import { unwrapData } from '@/api/client'
import { loadAuth, saveAuth, clearAuth, getStoredAccessToken, getStoredRefreshToken, getStoredUser } from '@/utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = loadAuth()
    return {
      user: saved?.user || null,
      accessToken: saved?.accessToken || null,
      refreshToken: saved?.refreshToken || null,
      rememberMe: saved?.rememberMe || false,
      isAuthenticated: Boolean(saved?.accessToken),
      isLoading: false,
      isHydrated: false,
    }
  })

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

  const logout = useCallback(async () => {
    try {
      const refreshToken = state.refreshToken || getStoredRefreshToken()
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch {
      // ignore logout errors
    }
    clearAuth()
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      rememberMe: false,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: true,
    })
  }, [state.refreshToken])

  const updateTokens = useCallback(
    ({ accessToken, refreshToken }) => {
      setState((prev) => {
        const next = { ...prev, accessToken, refreshToken, isAuthenticated: Boolean(accessToken) }
        persist(next, prev.rememberMe)
        return next
      })
    },
    [persist],
  )
  const login = useCallback(async (credentials, rememberMe = false) => {
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

      // Save to storage BEFORE state update so axios can read token immediately
      persist(next, rememberMe)
      setState(next)

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
  }, [persist, updateTokens, logout])

  const refreshProfile = useCallback(async () => {
    const response = await authService.profile()
    const payload = unwrapData(response)
    const user = payload?.user || payload
    setState((prev) => {
      const next = { ...prev, user }
      persist(next, prev.rememberMe)
      return next
    })
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
