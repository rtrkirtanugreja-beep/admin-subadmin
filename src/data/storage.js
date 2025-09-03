// Local file-based data storage system
// This replaces Supabase functionality with localStorage and mock data

// Mock data structure
const initialData = {
  departments: [
    {
      id: 'dept-1',
      name: 'Sales',
      description: 'Responsible for revenue generation and client acquisition',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'dept-2',
      name: 'Marketing',
      description: 'Brand management and promotional campaigns',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'dept-3',
      name: 'IT',
      description: 'Technology infrastructure and software development',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 'dept-4',
      name: 'Human Resources',
      description: 'Employee management and organizational development',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  users: [
    {
      id: 'user-1',
      email: 'admin@company.com',
      full_name: 'Master Administrator',
      role: 'master_admin',
      department_id: null,
      created_at: '2024-01-01T00:00:00Z',
      last_login: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Review Q4 Sales Report',
      description: 'Analyze quarterly sales performance and prepare recommendations',
      priority: 'high',
      status: 'pending',
      deadline: '2024-12-31T23:59:59Z',
      department_id: 'dept-1',
      assigned_to: 'user-2',
      assigned_by: 'user-1',
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    }
  ],
  messages: [],
  currentUser: null
}

// Initialize data if not exists
const initializeData = () => {
  if (!localStorage.getItem('appData')) {
    localStorage.setItem('appData', JSON.stringify(initialData))
  }
}

// Get all data
const getData = () => {
  initializeData()
  return JSON.parse(localStorage.getItem('appData') || '{}')
}

// Save data
const saveData = (data) => {
  localStorage.setItem('appData', JSON.stringify(data))
}

// Generate unique ID
const generateId = () => {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

// Generic CRUD operations
export const storage = {
  // Get all records from a table
  getAll: (table) => {
    const data = getData()
    return data[table] || []
  },

  // Get record by ID
  getById: (table, id) => {
    const data = getData()
    const records = data[table] || []
    return records.find(record => record.id === id)
  },

  // Get records with filter
  getWhere: (table, filterFn) => {
    const data = getData()
    const records = data[table] || []
    return records.filter(filterFn)
  },

  // Add new record
  insert: (table, record) => {
    const data = getData()
    if (!data[table]) data[table] = []
    
    const newRecord = {
      ...record,
      id: record.id || generateId(),
      created_at: record.created_at || new Date().toISOString()
    }
    
    data[table].push(newRecord)
    saveData(data)
    return newRecord
  },

  // Update record
  update: (table, id, updates) => {
    const data = getData()
    const records = data[table] || []
    const index = records.findIndex(record => record.id === id)
    
    if (index === -1) {
      throw new Error(`Record with id ${id} not found in ${table}`)
    }
    
    records[index] = {
      ...records[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    
    saveData(data)
    return records[index]
  },

  // Delete record
  delete: (table, id) => {
    const data = getData()
    const records = data[table] || []
    const filteredRecords = records.filter(record => record.id !== id)
    
    data[table] = filteredRecords
    saveData(data)
    return true
  },

  // Count records
  count: (table, filterFn) => {
    const records = storage.getAll(table)
    return filterFn ? records.filter(filterFn).length : records.length
  }
}

// Authentication simulation
export const auth = {
  currentUser: null,

  // Get current session
  getSession: () => {
    const data = getData()
    return { data: { session: data.currentUser ? { user: data.currentUser } : null } }
  },

  // Sign in
  signInWithPassword: ({ email, password }) => {
    const users = storage.getAll('users')
    const user = users.find(u => u.email === email)
    
    if (!user) {
      return { 
        data: null, 
        error: { message: 'Invalid email or password' } 
      }
    }

    // Update last login
    storage.update('users', user.id, { last_login: new Date().toISOString() })
    
    // Set current user
    const data = getData()
    data.currentUser = user
    saveData(data)
    
    auth.currentUser = user
    return { data: { user }, error: null }
  },

  // Sign up
  signUp: ({ email, password, options }) => {
    const users = storage.getAll('users')
    const existingUser = users.find(u => u.email === email)
    
    if (existingUser) {
      return { 
        data: null, 
        error: { message: 'User already exists' } 
      }
    }

    const newUser = storage.insert('users', {
      email,
      full_name: options?.data?.full_name || email,
      role: options?.data?.role || 'sub_admin',
      department_id: options?.data?.department_id || null
    })

    return { data: { user: newUser }, error: null }
  },

  // Sign out
  signOut: () => {
    const data = getData()
    data.currentUser = null
    saveData(data)
    auth.currentUser = null
    return { error: null }
  },

  // Update user
  updateUser: ({ password }) => {
    // In a real app, you'd hash and store the password
    // For demo purposes, we'll just return success
    return { error: null }
  },

  // Auth state change listener (simplified)
  onAuthStateChange: (callback) => {
    // Simulate auth state changes
    const data = getData()
    if (data.currentUser) {
      setTimeout(() => callback('SIGNED_IN', { user: data.currentUser }), 100)
    } else {
      setTimeout(() => callback('SIGNED_OUT', null), 100)
    }
    
    return {
      data: {
        subscription: {
          unsubscribe: () => {}
        }
      }
    }
  }
}

// File storage simulation
export const fileStorage = {
  upload: async (bucket, file) => {
    // Simulate file upload by creating a mock URL
    const fileName = `${Date.now()}-${file.name}`
    const mockUrl = `data:${file.type};base64,${await fileToBase64(file)}`
    
    return {
      data: { path: fileName },
      error: null
    }
  },

  getPublicUrl: (bucket, path) => {
    return {
      data: { publicUrl: `mock://storage/${bucket}/${path}` }
    }
  }
}

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const base64 = reader.result?.toString().split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
  })
}

// Real-time subscription simulation
export const realtime = {
  channel: (name) => ({
    on: (event, config, callback) => ({
      subscribe: () => {}
    })
  })
}

// Initialize data on module load
initializeData()