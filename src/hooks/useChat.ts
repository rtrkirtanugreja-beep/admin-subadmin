import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Message, ChatConversation, User } from '../types'

export function useChat(currentUserId?: string) {
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUserId) return

    fetchConversations()
    
    // Subscribe to real-time message changes
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new as Message
          // Only add if it's relevant to current user
          if (newMessage.sender_id === currentUserId || newMessage.receiver_id === currentUserId) {
            setMessages(prev => [...prev, newMessage])
            fetchConversations() // Refresh conversations to update last message
          }
        }
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentUserId])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
      markMessagesAsRead(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      const { data: users, error } = await supabase
        .from('user_profiles')
        .select('*')
        .neq('id', currentUserId)

      if (error) throw error

      const conversationsData: ChatConversation[] = []

      for (const user of users || []) {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${user.id}),and(sender_id.eq.${user.id},receiver_id.eq.${currentUserId})`)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('sender_id', user.id)
          .eq('receiver_id', currentUserId)
          .eq('is_read', false)

        conversationsData.push({
          id: user.id,
          user,
          lastMessage: lastMessage || undefined,
          unreadCount: unreadCount || 0,
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
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
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

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          sender_id: currentUserId,
          receiver_id: receiverId,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          attachment_type: attachmentType,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const markMessagesAsRead = async (senderId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('receiver_id', currentUserId)
        .eq('is_read', false)

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