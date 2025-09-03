import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { storage } from '../data/storage.js'
import type { AuthUser } from '../types'

export function useAuth() {
  const [user, setUser] = useState<AuthUser>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const { data: { session } } = supabase.auth.getSession()
    if (session?.user) {
      fetchUserProfile(session.user.id)
    } else {
      setLoading(false)
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const userProfile = storage.getById('users', userId)
      if (!userProfile) {
        throw new Error('User profile not found')
      }
      setUser(userProfile)
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const createSubAdmin = async (email: string, password: string, fullName: string, departmentId: string) => {
    // Check if user already exists
    const existingUsers = storage.getWhere('users', u => u.email === email)
    if (existingUsers.length > 0) {
      return { data: null, error: { message: 'User already exists' } }
    }

    // Create new user
    const newUser = storage.insert('users', {
      email,
      full_name: fullName,
      role: 'sub_admin',
      department_id: departmentId,
    })

    return { data: { user: newUser }, error: null }
  }

  return {
    user,
    loading,
    signIn,
    signOut,
    createSubAdmin,
  }
}