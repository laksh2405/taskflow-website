export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          avatar_url: string | null
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          avatar_url?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          owner_id: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          owner_id?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'guest'
          joined_at: string
        }
        Insert: {
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'guest'
          joined_at?: string
        }
        Update: {
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'guest'
          joined_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          color: string
          status: 'active' | 'archived' | 'completed'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          color?: string
          status?: 'active' | 'archived' | 'completed'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          color?: string
          status?: 'active' | 'archived' | 'completed'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          project_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          created_at?: string
        }
      }
      columns: {
        Row: {
          id: string
          board_id: string
          name: string
          color: string
          position: number
          wip_limit: number | null
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          name: string
          color?: string
          position?: number
          wip_limit?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string
          color?: string
          position?: number
          wip_limit?: number | null
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          board_id: string
          column_id: string | null
          title: string
          description: string | null
          status: 'backlog' | 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id: string | null
          due_date: string | null
          position: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          board_id: string
          column_id?: string | null
          title: string
          description?: string | null
          status?: 'backlog' | 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          position?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          column_id?: string | null
          title?: string
          description?: string | null
          status?: 'backlog' | 'todo' | 'in_progress' | 'done'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          assignee_id?: string | null
          due_date?: string | null
          position?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      labels: {
        Row: {
          id: string
          board_id: string
          name: string
          color: string
        }
        Insert: {
          id?: string
          board_id: string
          name: string
          color?: string
        }
        Update: {
          id?: string
          board_id?: string
          name?: string
          color?: string
        }
      }
      task_labels: {
        Row: {
          task_id: string
          label_id: string
        }
        Insert: {
          task_id: string
          label_id: string
        }
        Update: {
          task_id?: string
          label_id?: string
        }
      }
      subtasks: {
        Row: {
          id: string
          task_id: string
          title: string
          completed: boolean
          position: number
        }
        Insert: {
          id?: string
          task_id: string
          title: string
          completed?: boolean
          position?: number
        }
        Update: {
          id?: string
          task_id?: string
          title?: string
          completed?: boolean
          position?: number
        }
      }
      comments: {
        Row: {
          id: string
          task_id: string
          author_id: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          author_id: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          author_id?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          task_id: string
          uploader_id: string | null
          file_name: string
          file_path: string
          file_size: number | null
          mime_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          uploader_id?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          uploader_id?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          mime_type?: string | null
          created_at?: string
        }
      }
      activity_log: {
        Row: {
          id: string
          workspace_id: string | null
          entity_type: string
          entity_id: string
          action: string
          actor_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id?: string | null
          entity_type: string
          entity_id: string
          action: string
          actor_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: string
          actor_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: {
          workspace_id: string
        }
        Returns: boolean
      }
      get_workspace_role: {
        Args: {
          workspace_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
