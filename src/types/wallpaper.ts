export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  url: string;
  alt_text: string;
  category: string;
  tags: string[];
  width: number;
  height: number;
  resolution: string;
  file_size: number;
  format: 'webp' | 'jpg' | 'png';
  created_at: string;
  updated_at: string;
  downloads: number;
  likes: number;
  is_featured: boolean;
}
