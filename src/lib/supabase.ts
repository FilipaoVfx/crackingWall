import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase env vars missing! Check .env. Using mock client.');
}

// Prevent build crash by using valid-looking placeholder if missing
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key);

// Types para Database
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallpapers: {
        Row: {
          id: string;
          title: string;
          category: string;
          url: string;
          resolution: string;
          downloads: number;
          likes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          url: string;
          resolution: string;
          downloads?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          url?: string;
          resolution?: string;
          downloads?: number;
          likes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_likes: {
        Row: {
          id: string;
          user_id: string;
          wallpaper_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallpaper_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallpaper_id?: string;
          created_at?: string;
        };
      };
      user_downloads: {
        Row: {
          id: string;
          user_id: string;
          wallpaper_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallpaper_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallpaper_id?: string;
          created_at?: string;
        };
      };
    };
  };
};
