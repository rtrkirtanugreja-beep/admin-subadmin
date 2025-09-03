# Comprehensive Admin Management System

A modern, full-featured administrative management system built with React, TypeScript, and Supabase.

## Features

### 🔐 Authentication & Authorization
- Role-based access control (Master Admin / Sub Admin)
- Secure login with email and password
- Automatic profile creation on signup

### 👥 User Management
- Master Admin can create Sub Admin accounts
- Department-based user organization
- User profile management with last login tracking

### 🏢 Department Management
- Create and manage company departments
- Assign Sub Admins to specific departments
- Department overview with member statistics

### ✅ Task Management
- Comprehensive task assignment system
- Priority levels (Low, Medium, High, Urgent)
- Status tracking (Pending, In Progress, Completed, Overdue)
- Department-based task filtering
- Deadline management with overdue detection

### 💬 Real-time Communication
- Direct messaging between Master Admin and Sub Admins
- File attachment support (Images, PDFs)
- Message read/unread status
- Real-time message delivery
- Chat history preservation

### 📊 Dashboard Analytics
- **Master Admin Dashboard**: System-wide overview with statistics
- **Sub Admin Dashboard**: Personal task management view
- Real-time data updates
- Visual progress indicators

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- A Supabase account and project

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure your Supabase project:
   - Click "Connect to Supabase" in the top right corner
   - Follow the setup instructions to link your Supabase project

4. The database migrations will be automatically applied when you connect to Supabase

5. Start the development server:
```bash
npm run dev
```

### Initial Setup

1. **Create Master Admin Account (Demo):**
   - Use the signup process with any email/password combination
   - Recommended demo credentials:
     - Email: `admin@company.com`
     - Password: `admin123`
   - The first user automatically becomes the Master Admin

2. **Add Departments:**
   - Demo departments are automatically created (Sales, Marketing, IT, HR)
   - You can add more departments through the "Departments" section

3. **Create Sub Admin Accounts:**
   - Use the "Sub Admins" section to create demo accounts:
     - Sales Admin: `sales@company.com` / `sales123`
     - Marketing Admin: `marketing@company.com` / `marketing123`
     - IT Admin: `it@company.com` / `it123`
   - Assign each Sub Admin to a department

4. **Start Managing Tasks:**
   - Create and assign tasks to Sub Admins
   - Track progress through the dashboard
   - Communicate via the chat system

## Demo Instructions

To quickly test the system:

1. **Master Admin Login:**
   - Email: `admin@company.com`
   - Password: `admin123`
   - Access: Full system management, create sub admins, assign tasks, view all data

2. **Create Sub Admin Accounts:**
   - From Master Admin dashboard, go to "Sub Admins" → "Add Sub Admin"
   - Create accounts for different departments to test role separation
   - Suggested demo accounts:
     - Sales: `sales@company.com` / `sales123`
     - Marketing: `marketing@company.com` / `marketing123`

3. **Test Features:**
   - Create tasks and assign to sub admins
   - Login as sub admin to see limited dashboard view
   - Test chat system between master and sub admins
   - Upload files in chat to test attachment functionality

4. **Role Testing:**
   - Master Admin: Can see all tasks, create users, manage departments
   - Sub Admin: Can only see assigned tasks, chat with master admin

## Database Schema

### Tables
- **user_profiles**: Extended user information with roles and departments
- **departments**: Company departments with descriptions
- **tasks**: Task assignments with priorities, deadlines, and status tracking
- **messages**: Real-time chat system with file attachments

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access policies
- Secure file storage for chat attachments

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Real-time, Storage, Auth)
- **Icons**: Lucide React
- **Build Tool**: Vite

## Features by Role

### Master Admin
- Create and manage Sub Admin accounts
- Manage company departments
- Assign tasks to Sub Admins across departments
- Monitor system-wide task progress
- Communicate with all Sub Admins
- Access comprehensive analytics dashboard

### Sub Admin
- View and manage assigned tasks
- Update task status and progress
- Communicate with Master Admin
- Access personal dashboard with task statistics
- Manage personal profile and security settings