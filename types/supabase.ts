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
                    username: string | null
                    full_name: string | null
                    avatar_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    username?: string | null
                    full_name?: string | null
                    avatar_url?: string | null
                    updated_at?: string | null
                }
            }
            lists: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    type: 'standard' | 'advanced'
                    created_at: string
                    icon_name: string
                    icon_color: string
                    features: Json
                }
                Insert: {
                    id?: string
                    owner_id: string
                    title: string
                    type?: 'standard' | 'advanced'
                    created_at?: string
                    icon_name?: string
                    icon_color?: string
                    features?: Json
                }
                Update: {
                    id?: string
                    owner_id?: string
                    title?: string
                    type?: 'standard' | 'advanced'
                    created_at?: string
                    icon_name?: string
                    icon_color?: string
                    features?: Json
                }
            }
            list_members: {
                Row: {
                    id: string
                    list_id: string
                    user_id: string
                    role: 'owner' | 'editor' | 'viewer'
                    status: 'pending' | 'accepted'
                    invited_at: string
                }
                Insert: {
                    id?: string
                    list_id: string
                    user_id: string
                    role?: 'owner' | 'editor' | 'viewer'
                    status?: 'pending' | 'accepted'
                    invited_at?: string
                }
                Update: {
                    id?: string
                    list_id?: string
                    user_id?: string
                    role?: 'owner' | 'editor' | 'viewer'
                    status?: 'pending' | 'accepted'
                    invited_at?: string
                }
            }
            tasks: {
                Row: {
                    id: string
                    list_id: string
                    title: string
                    status: boolean
                    priority: 'low' | 'normal' | 'high' | null
                    due_date: string | null
                    assignee_id: string | null
                    created_at: string
                    tags: Json
                }
                Insert: {
                    id?: string
                    list_id: string
                    title: string
                    status?: boolean
                    priority?: 'low' | 'normal' | 'high' | null
                    due_date?: string | null
                    assignee_id?: string | null
                    created_at?: string
                    tags?: Json
                }
                Update: {
                    id?: string
                    list_id?: string
                    title?: string
                    status?: boolean
                    priority?: 'low' | 'normal' | 'high' | null
                    due_date?: string | null
                    assignee_id?: string | null
                    created_at?: string
                    tags?: Json
                }
            }
            updates: {
                Row: {
                    id: string
                    task_id: string
                    user_id: string
                    message: string
                    type: 'comment' | 'log'
                    created_at: string
                }
                Insert: {
                    id?: string
                    task_id: string
                    user_id: string
                    message: string
                    type?: 'comment' | 'log'
                    created_at?: string
                }
                Update: {
                    id?: string
                    task_id?: string
                    user_id?: string
                    message?: string
                    type?: 'comment' | 'log'
                    created_at?: string
                }
            }
        }
    }
}
