import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Department } from '../types'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartments()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('departments')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'departments' 
      }, () => {
        fetchDepartments()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name')

      if (error) throw error
      setDepartments(data || [])
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDepartment = async (name: string, description: string) => {
    const { data, error } = await supabase
      .from('departments')
      .insert({ name, description })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const deleteDepartment = async (id: string) => {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    departments,
    loading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refreshDepartments: fetchDepartments,
  }
}