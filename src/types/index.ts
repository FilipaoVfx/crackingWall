export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  alt_text: string;
  width: number;
  height: number;
  file_size: number;
  format: 'webp' | 'jpg' | 'jpeg' | 'png';
  created_at: string;
  updated_at: string;
  downloads: number;
  likes: number;
  isLiked?: boolean;
  is_featured?: boolean;
  tags?: string[];
  slug?: string;
  mood?: string;
  resolution?: string;
}

export interface User {
  id: string;
  email: string;
  registeredAt: Date;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}
