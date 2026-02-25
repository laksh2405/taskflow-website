/*
  # TaskFlow - Sample Seed Data

  IMPORTANT: Run this AFTER creating your first user account via signup.
  Replace 'YOUR_USER_ID' below with your actual user ID from auth.users.

  To get your user ID:
  1. Sign up for an account in the app
  2. Run: SELECT id FROM auth.users WHERE email = 'your@email.com';
  3. Copy the UUID and replace 'YOUR_USER_ID' below

  This seed file creates:
  - 1 workspace with you as owner
  - 2 projects (Website Redesign, Mobile App)
  - 2 boards (one per project)
  - 4 columns per board (Backlog, To Do, In Progress, Done)
  - 12+ tasks across projects
  - Labels (Bug, Feature, Enhancement, etc.)
  - Sample comments and subtasks
*/

-- =====================================================
-- REPLACE THIS WITH YOUR ACTUAL USER ID
-- =====================================================
DO $$
DECLARE
  v_user_id UUID := 'YOUR_USER_ID'; -- REPLACE WITH YOUR ACTUAL USER ID
  v_workspace_id UUID;
  v_project1_id UUID;
  v_project2_id UUID;
  v_board1_id UUID;
  v_board2_id UUID;
  v_col1_backlog UUID;
  v_col1_todo UUID;
  v_col1_progress UUID;
  v_col1_done UUID;
  v_col2_backlog UUID;
  v_col2_todo UUID;
  v_col2_progress UUID;
  v_col2_done UUID;
  v_task1_id UUID;
  v_task2_id UUID;
  v_task3_id UUID;
  v_label_bug UUID;
  v_label_feature UUID;
  v_label_enhancement UUID;
BEGIN

-- =====================================================
-- CREATE WORKSPACE
-- =====================================================
INSERT INTO workspaces (name, slug, owner_id, settings)
VALUES ('My Workspace', 'my-workspace', v_user_id, '{"theme": "light"}')
RETURNING id INTO v_workspace_id;

-- Add user as workspace owner
INSERT INTO workspace_members (workspace_id, user_id, role)
VALUES (v_workspace_id, v_user_id, 'owner');

-- =====================================================
-- CREATE PROJECTS
-- =====================================================

-- Project 1: Website Redesign
INSERT INTO projects (workspace_id, name, description, color, status, created_by)
VALUES (
  v_workspace_id,
  'Website Redesign',
  'Complete overhaul of company website with modern design',
  '#3B82F6',
  'active',
  v_user_id
) RETURNING id INTO v_project1_id;

-- Project 2: Mobile App
INSERT INTO projects (workspace_id, name, description, color, status, created_by)
VALUES (
  v_workspace_id,
  'Mobile App',
  'iOS and Android mobile application development',
  '#10B981',
  'active',
  v_user_id
) RETURNING id INTO v_project2_id;

-- =====================================================
-- CREATE BOARDS
-- =====================================================

INSERT INTO boards (project_id, name)
VALUES (v_project1_id, 'Website Redesign Board')
RETURNING id INTO v_board1_id;

INSERT INTO boards (project_id, name)
VALUES (v_project2_id, 'Mobile App Board')
RETURNING id INTO v_board2_id;

-- =====================================================
-- CREATE COLUMNS FOR BOARD 1
-- =====================================================

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board1_id, 'Backlog', '#94A3B8', 0)
RETURNING id INTO v_col1_backlog;

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board1_id, 'To Do', '#3B82F6', 1)
RETURNING id INTO v_col1_todo;

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board1_id, 'In Progress', '#F59E0B', 2)
RETURNING id INTO v_col1_progress;

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board1_id, 'Done', '#10B981', 3)
RETURNING id INTO v_col1_done;

-- =====================================================
-- CREATE COLUMNS FOR BOARD 2
-- =====================================================

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board2_id, 'Backlog', '#94A3B8', 0)
RETURNING id INTO v_col2_backlog;

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board2_id, 'To Do', '#3B82F6', 1)
RETURNING id INTO v_col2_todo;

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board2_id, 'In Progress', '#F59E0B', 2)
RETURNING id INTO v_col2_progress;

INSERT INTO columns (board_id, name, color, position)
VALUES (v_board2_id, 'Done', '#10B981', 3)
RETURNING id INTO v_col2_done;

-- =====================================================
-- CREATE LABELS FOR BOARD 1
-- =====================================================

INSERT INTO labels (board_id, name, color)
VALUES (v_board1_id, 'Bug', '#EF4444')
RETURNING id INTO v_label_bug;

INSERT INTO labels (board_id, name, color)
VALUES (v_board1_id, 'Feature', '#3B82F6')
RETURNING id INTO v_label_feature;

INSERT INTO labels (board_id, name, color)
VALUES (v_board1_id, 'Enhancement', '#8B5CF6')
RETURNING id INTO v_label_enhancement;

INSERT INTO labels (board_id, name, color)
VALUES (v_board1_id, 'Documentation', '#6B7280');

-- =====================================================
-- CREATE TASKS FOR PROJECT 1 (Website Redesign)
-- =====================================================

-- Task 1: Homepage Design
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, due_date, position, created_by)
VALUES (
  v_board1_id,
  v_col1_done,
  'Design new homepage layout',
  'Create modern, responsive homepage design with hero section and feature highlights',
  'done',
  'high',
  v_user_id,
  CURRENT_DATE - INTERVAL '5 days',
  0,
  v_user_id
) RETURNING id INTO v_task1_id;

-- Add label to task 1
INSERT INTO task_labels (task_id, label_id)
VALUES (v_task1_id, v_label_feature);

-- Task 2: Navigation Menu
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, due_date, position, created_by)
VALUES (
  v_board1_id,
  v_col1_progress,
  'Implement responsive navigation',
  'Build mobile-friendly navigation menu with dropdown support',
  'in_progress',
  'high',
  v_user_id,
  CURRENT_DATE + INTERVAL '3 days',
  0,
  v_user_id
) RETURNING id INTO v_task2_id;

-- Add subtasks to task 2
INSERT INTO subtasks (task_id, title, completed, position)
VALUES (v_task2_id, 'Create desktop nav', true, 0);

INSERT INTO subtasks (task_id, title, completed, position)
VALUES (v_task2_id, 'Add mobile hamburger menu', true, 1);

INSERT INTO subtasks (task_id, title, completed, position)
VALUES (v_task2_id, 'Implement dropdown menus', false, 2);

INSERT INTO subtasks (task_id, title, completed, position)
VALUES (v_task2_id, 'Add accessibility features', false, 3);

-- Task 3: Contact Form
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, due_date, position, created_by)
VALUES (
  v_board1_id,
  v_col1_todo,
  'Build contact form',
  'Create contact form with validation and email integration',
  'todo',
  'medium',
  v_user_id,
  CURRENT_DATE + INTERVAL '7 days',
  0,
  v_user_id
) RETURNING id INTO v_task3_id;

INSERT INTO task_labels (task_id, label_id)
VALUES (v_task3_id, v_label_feature);

-- Add comment to task 3
INSERT INTO comments (task_id, author_id, content)
VALUES (v_task3_id, v_user_id, 'Need to integrate with SendGrid for email delivery');

-- Task 4: Fix Mobile Layout
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, position, created_by)
VALUES (
  v_board1_id,
  v_col1_progress,
  'Fix mobile layout issues',
  'Address responsive breakpoint issues on tablet devices',
  'in_progress',
  'urgent',
  v_user_id,
  1,
  v_user_id
);

-- Task 5: Performance Optimization
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, due_date, position, created_by)
VALUES (
  v_board1_id,
  v_col1_todo,
  'Optimize page load speed',
  'Improve lighthouse scores through image optimization and code splitting',
  'todo',
  'medium',
  v_user_id,
  CURRENT_DATE + INTERVAL '14 days',
  1,
  v_user_id
);

-- Task 6: SEO Setup
INSERT INTO tasks (board_id, column_id, title, description, status, priority, position, created_by)
VALUES (
  v_board1_id,
  v_col1_backlog,
  'Implement SEO best practices',
  'Add meta tags, sitemap, and structured data',
  'backlog',
  'low',
  0,
  v_user_id
);

-- =====================================================
-- CREATE TASKS FOR PROJECT 2 (Mobile App)
-- =====================================================

-- Task 7: User Authentication
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, due_date, position, created_by)
VALUES (
  v_board2_id,
  v_col2_done,
  'Implement user authentication',
  'Set up email/password and social login',
  'done',
  'high',
  v_user_id,
  CURRENT_DATE - INTERVAL '10 days',
  0,
  v_user_id
);

-- Task 8: Dashboard UI
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, position, created_by)
VALUES (
  v_board2_id,
  v_col2_progress,
  'Build main dashboard',
  'Create dashboard with stats and activity feed',
  'in_progress',
  'high',
  v_user_id,
  0,
  v_user_id
);

-- Task 9: Push Notifications
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, due_date, position, created_by)
VALUES (
  v_board2_id,
  v_col2_todo,
  'Set up push notifications',
  'Integrate Firebase Cloud Messaging for notifications',
  'todo',
  'medium',
  v_user_id,
  CURRENT_DATE + INTERVAL '10 days',
  0,
  v_user_id
);

-- Task 10: Offline Mode
INSERT INTO tasks (board_id, column_id, title, description, status, priority, position, created_by)
VALUES (
  v_board2_id,
  v_col2_todo,
  'Add offline support',
  'Implement local data caching and sync',
  'todo',
  'low',
  1,
  v_user_id
);

-- Task 11: User Profile
INSERT INTO tasks (board_id, column_id, title, description, status, priority, assignee_id, position, created_by)
VALUES (
  v_board2_id,
  v_col2_backlog,
  'Create user profile screen',
  'Build profile page with edit functionality',
  'backlog',
  'medium',
  v_user_id,
  0,
  v_user_id
);

-- Task 12: App Store Submission
INSERT INTO tasks (board_id, column_id, title, description, status, priority, due_date, position, created_by)
VALUES (
  v_board2_id,
  v_col2_backlog,
  'Prepare app store submission',
  'Create assets and submit to Apple App Store and Google Play',
  'backlog',
  'low',
  CURRENT_DATE + INTERVAL '60 days',
  1,
  v_user_id
);

-- =====================================================
-- CREATE ACTIVITY LOG ENTRIES
-- =====================================================

INSERT INTO activity_log (workspace_id, entity_type, entity_id, action, actor_id, metadata)
VALUES (
  v_workspace_id,
  'project',
  v_project1_id,
  'created',
  v_user_id,
  '{"project_name": "Website Redesign"}'
);

INSERT INTO activity_log (workspace_id, entity_type, entity_id, action, actor_id, metadata)
VALUES (
  v_workspace_id,
  'project',
  v_project2_id,
  'created',
  v_user_id,
  '{"project_name": "Mobile App"}'
);

INSERT INTO activity_log (workspace_id, entity_type, entity_id, action, actor_id, metadata)
VALUES (
  v_workspace_id,
  'task',
  v_task1_id,
  'completed',
  v_user_id,
  '{"task_title": "Design new homepage layout"}'
);

END $$;
