import React, { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import LoginForm from './components/Auth/LoginForm'
import Sidebar from './components/Layout/Sidebar'
import MasterDashboard from './components/Dashboard/MasterDashboard'
import SubAdminDashboard from './components/Dashboard/SubAdminDashboard'
import UserManagement from './components/Users/UserManagement'
import DepartmentManagement from './components/Departments/DepartmentManagement'
import TaskManagement from './components/Tasks/TaskManagement'
import ChatSystem from './components/Chat/ChatSystem'
import Settings from './components/Settings/Settings'

function App() {
  const { user, loading } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return user.role === 'master_admin' 
          ? <MasterDashboard user={user} />
          : <SubAdminDashboard user={user} />
      case 'users':
        return user.role === 'master_admin' ? <UserManagement /> : null
      case 'departments':
        return user.role === 'master_admin' ? <DepartmentManagement /> : null
      case 'tasks':
        return user.role === 'master_admin' ? <TaskManagement user={user} /> : null
      case 'chat':
        return <ChatSystem user={user} />
      case 'settings':
        return <Settings user={user} />
      default:
        return user.role === 'master_admin' 
          ? <MasterDashboard user={user} />
          : <SubAdminDashboard user={user} />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar user={user} currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  )
}

export default App