import React, { createContext, useState, useContext, useEffect, useCallback } from 'react'
import { requireSupabase, supabase } from '@/lib/supabase'

const AuthContext = createContext(null)
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false)
  const [authError, setAuthError] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [appPublicSettings] = useState(null)

  const checkUserAuth = useCallback(async () => {
    const { data, error } = await requireSupabase().auth.getUser()
    if (error && error.name !== 'AuthSessionMissingError') throw error
    setUser(data?.user || null)
    setIsAuthenticated(!!data?.user)
    setIsLoadingAuth(false)
    setAuthChecked(true)
    return data?.user || null
  }, [])
  const checkAppState = useCallback(async () => {
    setIsLoadingAuth(true)
    setAuthError(null)
    if (!supabase) {
      setAuthError({ type: 'config_missing', message: 'Add your Supabase project URL and anon key to .env.local.' })
      setIsLoadingAuth(false); setAuthChecked(true); return
    }
    try { await checkUserAuth() }
    catch (e) { setAuthError({ type: 'unknown', message: e.message }); setIsLoadingAuth(false); setAuthChecked(true) }
  }, [checkUserAuth])
  useEffect(() => {
    checkAppState()
    if (!supabase) return undefined
    const { data } = requireSupabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null); setIsAuthenticated(!!session?.user); setAuthChecked(true); setIsLoadingAuth(false)
    })
    return () => data.subscription.unsubscribe()
  }, [checkAppState])
  const logout = async () => { await requireSupabase().auth.signOut(); setUser(null); setIsAuthenticated(false) }
  const navigateToLogin = () => { window.location.assign('/admin') }
  return <AuthContext.Provider value={{ user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, appPublicSettings, authChecked, logout, navigateToLogin, checkUserAuth, checkAppState }}>{children}</AuthContext.Provider>
}
export const useAuth = () => { const c = useContext(AuthContext); if (!c) throw new Error('useAuth must be used within an AuthProvider'); return c }
