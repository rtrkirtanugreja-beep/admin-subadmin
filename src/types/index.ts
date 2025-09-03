export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'master_admin' | 'sub_admin';
  department_id?: string;
  created_at: string;
  last_login?: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  deadline: string;
  department_id: string;
  assigned_to: string;
  assigned_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  attachment_url?: string;
  attachment_name?: string;
  attachment_type?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  full_name: string;
  department_id?: string;
} | null;