import React, { useState, useEffect } from 'react'
import { BarChart3, Users, CheckSquare, Clock, AlertTriangle } from 'lucide-react'
import { useTasks } from '../../hooks/useTasks'
import { storage } from '../../data/storage.js'
import type { AuthUser, User, Task } from '../../types'

interface MasterDashboardProps {
  user: AuthUser
}

interface DashboardStats {
  totalSubAdmins: number
  totalTasks: number
  completedTasks: number
  overdueasks: number
}

export default function MasterDashboard({ user }: MasterDashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubAdmins: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueasks: 0,
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const { tasks } = useTasks(user?.id, user?.role)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch sub admin count
      const subAdminCount = storage.count('users', user => user.role === 'sub_admin')

      // Calculate task statistics
      const totalTasks = tasks.length
      const completedTasks = tasks.filter(task => task.status === 'completed').length
      const overdueTasks = tasks.filter(task => 
        task.status !== 'completed' && new Date(task.deadline) < new Date()
      ).length

      setStats({
        totalSubAdmins: subAdminCount,
        totalTasks,
        completedTasks,
        overdueTasks: overdueTasks,
      })

      // Get recent tasks
      setRecentTasks(tasks.slice(0, 5))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [tasks])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-green-600 bg-green-50'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50'
      case 'in_progress': return 'text-blue-600 bg-blue-50'
      case 'overdue': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Admin Dashboard</h1>
        <p className="text-gray-600">Overview of system activity and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Sub Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSubAdmins}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
            </div>
            <CheckSquare className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTasks}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdueasks}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
        </div>
        <div className="p-6">
          {recentTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks assigned yet</p>
          ) : (
            <div className="space-y-4">
              {recentTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span>Assigned to: {task.assignee?.full_name}</span>
                      <span className="mx-2">•</span>
                      <span>Department: {task.department?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}