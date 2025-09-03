import { useEffect, useState } from 'react'
import { storage } from '../data/storage.js'
import type { Message, ChatConversation, User } from '../types'

export function useChat(currentUserId?: string) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUserId) return
    fetchConversations()
  }, [currentUserId])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
      markMessagesAsRead(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const users = storage.getWhere('users', user => user.id !== currentUserId)
      const conversationsData: ChatConversation[] = []

      for (const user of users) {
        // Get last message between current user and this user
        const allMessages = storage.getAll('messages')
        const conversationMessages = allMessages.filter(msg => 
          (msg.sender_id === currentUserId && msg.receiver_id === user.id) ||
          (msg.sender_id === user.id && msg.receiver_id === currentUserId)
        )
        
        const lastMessage = conversationMessages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        // Count unread messages from this user
        const unreadCount = conversationMessages.filter(msg => 
          msg.sender_id === user.id && 
          msg.receiver_id === currentUserId && 
          !msg.is_read
        ).length

        conversationsData.push({
          id: user.id,
          user,
          lastMessage,
          unreadCount,
        })
      }

      setConversations(conversationsData)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (otherUserId: string) => {
    try {
      const allMessages = storage.getAll('messages')
      const conversationMessages = allMessages.filter(msg => 
        (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
        (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
      )
      
      const sortedMessages = conversationMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      
      setMessages(sortedMessages)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const sendMessage = async (receiverId: string, content: string, attachment?: File) => {
    try {
      let attachmentUrl: string | undefined
      let attachmentName: string | undefined
      let attachmentType: string | undefined

      if (attachment) {
        const fileName = `${Date.now()}-${attachment.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, attachment)

        if (uploadError) throw uploadError

        attachmentUrl = supabase.storage.from('chat-attachments').getPublicUrl(uploadData.path).data.publicUrl
        attachmentName = attachment.name
        attachmentType = attachment.type
      }

      const newMessage = storage.insert('messages', {
        content,
        sender_id: currentUserId,
        receiver_id: receiverId,
        attachment_url: attachmentUrl,
        attachment_name: attachmentName,
        attachment_type: attachmentType,
        is_read: false,
      })

      // Refresh messages and conversations
      await fetchMessages(receiverId)
      await fetchConversations()
      
      return newMessage
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const markMessagesAsRead = async (senderId: string) => {
    try {
      const allMessages = storage.getAll('messages')
      const unreadMessages = allMessages.filter(msg => 
        msg.sender_id === senderId && 
        msg.receiver_id === currentUserId && 
        !msg.is_read
      )

      unreadMessages.forEach(msg => {
        storage.update('messages', msg.id, { is_read: true })
      })

      // Refresh conversations to update unread count
      fetchConversations()
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  return {
    conversations,
    messages,
    selectedConversation,
    loading,
    setSelectedConversation,
    sendMessage,
    fetchConversations,
  }
}