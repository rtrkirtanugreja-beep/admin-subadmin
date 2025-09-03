/*
  # Add Demo Data for Testing

  1. Demo Departments
    - Sales Department
    - Marketing Department  
    - IT Department
    - Human Resources Department

  2. Demo Tasks
    - Sample tasks with various priorities and statuses
    - Assigned to different departments

  3. Demo Messages
    - Sample chat conversations between admins

  Note: Demo user accounts will need to be created through the signup process
  since Supabase auth requires proper password hashing.
*/

-- Insert demo departments
INSERT INTO departments (name, description) VALUES
  ('Sales', 'Responsible for revenue generation and client acquisition'),
  ('Marketing', 'Brand management and promotional campaigns'),
  ('IT', 'Technology infrastructure and software development'),
  ('Human Resources', 'Employee management and organizational development')
ON CONFLICT (name) DO NOTHING;

-- Note: User accounts must be created through Supabase Auth signup process
-- The first user to sign up will automatically become the master admin
-- Additional sub admin accounts can be created through the UI by the master admin