import React from 'react'
import { Users, CheckSquare, MessageSquare, Settings, LogOut, Building2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import type { AuthUser } from '../../types'

interface SidebarProps {
  user: AuthUser
  currentView: string
  onViewChange: (view: string) => void
}

export default function Sidebar({ user, currentView, onViewChange }: SidebarProps) {
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const masterAdminMenuItems = [
    { id: 'dashboard', icon: CheckSquare, label: 'Dashboard' },
    { id: 'users', icon: Users, label: 'Sub Admins' },
    { id: 'departments', icon: Building2, label: 'Departments' },
    { id: 'tasks', icon: CheckSquare, label: 'Task Management' },
    { id: 'chat', icon: MessageSquare, label: 'Communications' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const subAdminMenuItems = [
    { id: 'dashboard', icon: CheckSquare, label: 'My Tasks' },
    { id: 'chat', icon: MessageSquare, label: 'Chat with Admin' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const menuItems = user?.role === 'master_admin' ? masterAdminMenuItems : subAdminMenuItems

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">Admin System</h1>
        <p className="text-gray-400 text-sm mt-1">
          {user?.role === 'master_admin' ? 'Master Admin' : 'Sub Admin'}
        </p>
        <p className="text-gray-300 text-sm mt-1">{user?.full_name}</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  )
}