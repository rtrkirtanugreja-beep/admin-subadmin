import React, { useState, useEffect } from 'react'
import { Plus, Building2, Users, Edit, Trash2 } from 'lucide-react'
import { storage } from '../../data/storage.js'
import type { Department, User } from '../../types'

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [subAdmins, setSubAdmins] = useState<User[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDepartments()
    fetchSubAdmins()
  }, [])

  const fetchDepartments = async () => {
    try {
      const allDepartments = storage.getAll('departments')
      const sortedDepartments = allDepartments.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setDepartments(sortedDepartments)
    } catch (error) {
      console.error('Error fetching departments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubAdmins = async () => {
    try {
      const allSubAdmins = storage.getWhere('users', user => user.role === 'sub_admin')
      
      // Enrich with department data
      const enrichedSubAdmins = allSubAdmins.map(user => {
        const department = user.department_id ? storage.getById('departments', user.department_id) : null
        return {
          ...user,
          department
        }
      })
      
      setSubAdmins(enrichedSubAdmins)
    } catch (error) {
      console.error('Error fetching sub admins:', error)
    }
  }

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    try {
      storage.insert('departments', {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      })
      
      setShowCreateForm(false)
      form.reset()
      fetchDepartments()
    } catch (error: any) {
      console.error('Error creating department:', error)
      alert('Error creating department: ' + error.message)
    }
  }

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDepartment) return

    const form = e.target as HTMLFormElement
    const formData = new FormData(form)
    
    try {
      storage.update('departments', editingDepartment.id, {
        name: formData.get('name') as string,
        description: formData.get('description') as string,
      })
      
      setEditingDepartment(null)
      fetchDepartments()
    } catch (error: any) {
      console.error('Error updating department:', error)
      alert('Error updating department: ' + error.message)
    }
  }

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return
    }

    try {
      storage.delete('departments', id)
      fetchDepartments()
    } catch (error: any) {
      console.error('Error deleting department:', error)
      alert('Error deleting department: ' + error.message)
    }
  }

  const getDepartmentSubAdmins = (departmentId: string) => {
    return subAdmins.filter((admin: any) => admin.department_id === departmentId)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Management</h1>
          <p className="text-gray-600">Organize and manage company departments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Create Department Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Department</h2>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sales, Marketing, IT"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the department's role and responsibilities"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Department Modal */}
      {editingDepartment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Edit Department</h2>
            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingDepartment.name}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingDepartment.description}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingDepartment(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Update Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => {
          const departmentAdmins = getDepartmentSubAdmins(department.id)
          return (
            <div key={department.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                    <p className="text-sm text-gray-500">Department</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => setEditingDepartment(department)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(department.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">
                {department.description || 'No description provided'}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{departmentAdmins.length} Sub Admins</span>
                </div>
                <div className="text-xs text-gray-400">
                  Created {new Date(department.created_at).toLocaleDateString()}
                </div>
              </div>

              {/* Sub Admins List */}
              {departmentAdmins.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assigned Sub Admins:</h4>
                  <div className="space-y-2">
                    {departmentAdmins.slice(0, 3).map((admin) => (
                      <div key={admin.id} className="flex items-center text-sm">
                        <div className="h-6 w-6 bg-gray-300 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs text-gray-700">
                            {admin.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-gray-600">{admin.full_name}</span>
                      </div>
                    ))}
                    {departmentAdmins.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{departmentAdmins.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}