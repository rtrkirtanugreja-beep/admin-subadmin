// Local storage implementation replacing Supabase
import { storage, auth, fileStorage, realtime } from '../data/storage.js'

// Mock Supabase client interface
export const supabase = {
  // Database operations
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        single: async () => {
          const records = storage.getWhere(table, record => record[column] === value)
          if (records.length === 0) {
            return { data: null, error: { message: 'No records found' } }
          }
          return { data: records[0], error: null }
        },
        order: (column, options = {}) => ({
          async then(resolve) {
            const records = storage.getWhere(table, record => record[column] === value)
            const sorted = records.sort((a, b) => {
              if (options.ascending === false) {
                return new Date(b[column]).getTime() - new Date(a[column]).getTime()
              }
              return new Date(a[column]).getTime() - new Date(b[column]).getTime()
            })
            resolve({ data: sorted, error: null })
          }
        })
      }),
      neq: (column, value) => ({
        order: (orderColumn, options = {}) => ({
          async then(resolve) {
            const records = storage.getWhere(table, record => record[column] !== value)
            const sorted = records.sort((a, b) => {
              if (options.ascending === false) {
                return new Date(b[orderColumn]).getTime() - new Date(a[orderColumn]).getTime()
              }
              return new Date(a[orderColumn]).getTime() - new Date(b[orderColumn]).getTime()
            })
            resolve({ data: sorted, error: null })
          }
        })
      }),
      or: (condition) => ({
        order: (column, options = {}) => ({
          limit: (num) => ({
            maybeSingle: async () => {
              // Parse OR condition for messages
              const records = storage.getAll(table)
              const filtered = records.filter(record => {
                // Simple OR condition parsing for messages
                return true // Simplified for demo
              })
              const sorted = filtered.sort((a, b) => {
                if (options.ascending === false) {
                  return new Date(b[column]).getTime() - new Date(a[column]).getTime()
                }
                return new Date(a[column]).getTime() - new Date(b[column]).getTime()
              })
              return { data: sorted[0] || null, error: null }
            }
          }),
          async then(resolve) {
            const records = storage.getAll(table)
            const sorted = records.sort((a, b) => {
              if (options.ascending === false) {
                return new Date(b[column]).getTime() - new Date(a[column]).getTime()
              }
              return new Date(a[column]).getTime() - new Date(b[column]).getTime()
            })
            resolve({ data: sorted, error: null })
          }
        })
      }),
      order: (column, options = {}) => ({
        async then(resolve) {
          const records = storage.getAll(table)
          const sorted = records.sort((a, b) => {
            if (options.ascending === false) {
              return new Date(b[column]).getTime() - new Date(a[column]).getTime()
            }
            return new Date(a[column]).getTime() - new Date(b[column]).getTime()
          })
          resolve({ data: sorted, error: null })
        }
      }),
      async then(resolve) {
        const records = storage.getAll(table)
        resolve({ data: records, error: null })
      }
    }),
    insert: (record) => ({
      select: () => ({
        single: async () => {
          try {
            const newRecord = storage.insert(table, record)
            return { data: newRecord, error: null }
          } catch (error) {
            return { data: null, error: { message: error.message } }
          }
        },
        async then(resolve) {
          try {
            const newRecord = storage.insert(table, record)
            resolve({ data: [newRecord], error: null })
          } catch (error) {
            resolve({ data: null, error: { message: error.message } })
          }
        }
      }),
      async then(resolve) {
        try {
          const newRecord = storage.insert(table, record)
          resolve({ data: newRecord, error: null })
        } catch (error) {
          resolve({ data: null, error: { message: error.message } })
        }
      }
    }),
    update: (updates) => ({
      eq: (column, value) => ({
        select: () => ({
          single: async () => {
            try {
              const updatedRecord = storage.update(table, value, updates)
              return { data: updatedRecord, error: null }
            } catch (error) {
              return { data: null, error: { message: error.message } }
            }
          }
        }),
        async then(resolve) {
          try {
            const updatedRecord = storage.update(table, value, updates)
            resolve({ data: updatedRecord, error: null })
          } catch (error) {
            resolve({ data: null, error: { message: error.message } })
          }
        }
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        async then(resolve) {
          try {
            storage.delete(table, value)
            resolve({ data: null, error: null })
          } catch (error) {
            resolve({ data: null, error: { message: error.message } })
          }
        }
      })
    })
  }),

  // Auth operations
  auth: {
    getSession: auth.getSession,
    signInWithPassword: auth.signInWithPassword,
    signUp: auth.signUp,
    signOut: auth.signOut,
    updateUser: auth.updateUser,
    onAuthStateChange: auth.onAuthStateChange
  },

  // Storage operations
  storage: {
    from: (bucket) => ({
      upload: (path, file) => fileStorage.upload(bucket, file),
      getPublicUrl: (path) => fileStorage.getPublicUrl(bucket, path)
    })
  },

  // Real-time subscriptions
  channel: realtime.channel
}

// Helper functions for common operations
export const uploadFile = async (file, bucket, path) => {
  const { data, error } = await fileStorage.upload(bucket, file)
  if (error) throw error
  return data
}

export const getFileUrl = (bucket, path) => {
  const { data } = fileStorage.getPublicUrl(bucket, path)
  return data.publicUrl
}