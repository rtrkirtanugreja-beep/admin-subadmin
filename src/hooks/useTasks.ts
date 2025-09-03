import { useEffect, useState } from 'react'
import { storage } from '../data/storage.js'
import type { Task } from '../types'

export function useTasks(userId?: string, userRole?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    fetchTasks()
  }, [userId, userRole])

  const fetchTasks = async () => {
    try {
      let allTasks = storage.getAll('tasks')
      
      // Enrich tasks with related data
      const enrichedTasks = allTasks.map(task => {
        const department = storage.getById('departments', task.department_id)
        const assignee = storage.getById('users', task.assigned_to)
        const assigner = storage.getById('users', task.assigned_by)
        
        return {
          ...task,
          department,
          assignee,
          assigner
        }
      })

      // Sub admins only see their own tasks
      if (userRole === 'sub_admin') {
        const userTasks = enrichedTasks.filter(task => task.assigned_to === userId)
        setTasks(userTasks)
      } else {
        setTasks(enrichedTasks)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newTask = storage.insert('tasks', taskData)
      await fetchTasks() // Refresh tasks
      return newTask
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updatedTask = storage.update('tasks', id, updates)
      await fetchTasks() // Refresh tasks
      return updatedTask
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const deleteTask = async (id: string) => {
    try {
      storage.delete('tasks', id)
      await fetchTasks() // Refresh tasks
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks: fetchTasks,
  }
}