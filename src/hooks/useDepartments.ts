import { useEffect, useState } from 'react'
import { storage } from '../data/storage.js'
import type { Department } from '../types'

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const allDepartments = storage.getAll('departments')
      const sortedDepartments = allDepartments.sort((a, b) => a.name.localeCompare(b.name))
      setDepartments(sortedDepartments)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDepartment = async (name: string, description: string) => {
    try {
      const newDepartment = storage.insert('departments', { name, description })
      await fetchDepartments() // Refresh departments
      return newDepartment
    } catch (error) {
      console.error('Error creating department:', error)
      throw error
    }
  }

  const updateDepartment = async (id: string, updates: Partial<Department>) => {
    try {
      const updatedDepartment = storage.update('departments', id, updates)
      await fetchDepartments() // Refresh departments
      return updatedDepartment
    } catch (error) {
      console.error('Error updating department:', error)
      throw error
    }
  }

  const deleteDepartment = async (id: string) => {
    try {
      storage.delete('departments', id)
      await fetchDepartments() // Refresh departments
    } catch (error) {
      console.error('Error deleting department:', error)
      throw error
    }
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