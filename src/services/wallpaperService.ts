import { supabase } from '../lib/supabase';
import { Wallpaper } from '../types';

import localWallpapers from '../content/wallpapers.json';

// Ensure type compatibility by casting or mapping if necessary
const typedLocalWallpapers: Wallpaper[] = (localWallpapers as any[]).map(w => ({
  ...w,
  isLiked: false,
  created_at: w.created_at || new Date().toISOString(),
  updated_at: w.updated_at || new Date().toISOString()
}));

export class WallpaperService {
  // Obtener todos los wallpapers (sin usuario autenticado)
  static async getAllWallpapers(): Promise<Wallpaper[]> {
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        console.warn('No wallpapers found in Supabase, using local content');
        return typedLocalWallpapers;
      }

      return data.map(wallpaper => ({
        ...wallpaper,
        isLiked: false
      }));
    } catch (error) {
      console.warn('Backend failed, using local content:', error);
      return typedLocalWallpapers;
    }
  }

  // Obtener wallpapers con estado de like del usuario
  static async getWallpapersForUser(userId: string): Promise<Wallpaper[]> {
    // Obtener wallpapers básicos
    const { data: wallpapers, error: wallpapersError } = await supabase
      .from('wallpapers')
      .select('*')
      .order('created_at', { ascending: false });

    if (wallpapersError) throw wallpapersError;

    // Obtener likes del usuario para todos los wallpapers
    const { data: userLikes, error: likesError } = await supabase
      .from('user_likes')
      .select('wallpaper_id')
      .eq('user_id', userId);

    if (likesError) throw likesError;

    // Crear un Set para búsqueda rápida de wallpapers con like
    const likedWallpaperIds = new Set(userLikes.map(like => like.wallpaper_id));

    // Combinar datos
    return wallpapers.map(wallpaper => ({
      ...wallpaper,
      isLiked: likedWallpaperIds.has(wallpaper.id)
    }));
  }

  // Update wallpaper like status
  static async updateWallpaperLike(wallpaperId: string, isLiked: boolean, userId: string): Promise<void> {
    try {
      if (isLiked) {
        // Add like
        const { error } = await supabase
          .from('user_likes')
          .insert([{ user_id: userId, wallpaper_id: wallpaperId }]);

        if (error) throw error;

        // Increment like count
        const { error: updateError } = await supabase
          .from('wallpapers')
          .update({ likes: supabase.rpc('increment') })
          .eq('id', wallpaperId);

        if (updateError) throw updateError;
      } else {
        // Remove like
        const { error } = await supabase
          .from('user_likes')
          .delete()
          .eq('user_id', userId)
          .eq('wallpaper_id', wallpaperId);

        if (error) throw error;

        // Decrement like count
        const { error: updateError } = await supabase
          .from('wallpapers')
          .update({ likes: supabase.rpc('decrement') })
          .eq('id', wallpaperId)
          .gt('likes', 0);

        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error updating wallpaper like:', error);
      throw error;
    }
  }

  // Increment wallpaper downloads
  static async incrementWallpaperDownloads(wallpaperId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('wallpapers')
        .update({ downloads: supabase.rpc('increment') })
        .eq('id', wallpaperId);

      if (error) throw error;
    } catch (error) {
      console.error('Error incrementing downloads:', error);
      throw error;
    }
  }

  // Like a wallpaper
  static async likeWallpaper(userId: string, wallpaperId: string) {
    // Check if like already exists
    const { data: existingLike } = await supabase
      .from('user_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('wallpaper_id', wallpaperId)
      .single();

    if (existingLike) {
      return; // Ya tiene like
    }

    // Insertar like
    const { error: insertError } = await supabase
      .from('user_likes')
      .insert({ user_id: userId, wallpaper_id: wallpaperId });

    if (insertError) throw insertError;

    // Incrementar contador en wallpapers usando RPC
    const { error: updateError } = await supabase.rpc('increment_likes', {
      wallpaper_id: wallpaperId
    });

    if (updateError) {
      // Si falla el RPC, incrementar manualmente
      const { data: currentWallpaper } = await supabase
        .from('wallpapers')
        .select('likes')
        .eq('id', wallpaperId)
        .single();

      if (currentWallpaper) {
        await supabase
          .from('wallpapers')
          .update({
            likes: (currentWallpaper.likes || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallpaperId);
      }
    }
  }

  // Quitar like de un wallpaper
  static async unlikeWallpaper(userId: string, wallpaperId: string) {
    const { error: deleteError } = await supabase
      .from('user_likes')
      .delete()
      .eq('user_id', userId)
      .eq('wallpaper_id', wallpaperId);

    if (deleteError) throw deleteError;

    // Decrementar contador usando RPC
    const { error: updateError } = await supabase.rpc('decrement_likes', {
      wallpaper_id: wallpaperId
    });

    if (updateError) {
      // Si falla el RPC, decrementar manualmente
      const { data: currentWallpaper } = await supabase
        .from('wallpapers')
        .select('likes')
        .eq('id', wallpaperId)
        .single();

      if (currentWallpaper) {
        await supabase
          .from('wallpapers')
          .update({
            likes: Math.max((currentWallpaper.likes || 0) - 1, 0),
            updated_at: new Date().toISOString()
          })
          .eq('id', wallpaperId);
      }
    }
  }

  // Registrar descarga
  static async recordDownload(userId: string, wallpaperId: string) {
    const { error: insertError } = await supabase
      .from('user_downloads')
      .insert({ user_id: userId, wallpaper_id: wallpaperId });

    if (insertError) throw insertError;

    // Incrementar contador de descargas usando RPC
    const { error: updateError } = await supabase.rpc('increment_downloads', {
      wallpaper_id: wallpaperId
    });

    if (updateError) {
      // Si falla el RPC, incrementar manualmente
      const { data: current } = await supabase
        .from('wallpapers')
        .select('downloads')
        .eq('id', wallpaperId)
        .single();

      if (current) {
        await supabase
          .from('wallpapers')
          .update({
            downloads: (current.downloads || 0) + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', wallpaperId);
      }
    }
  }

  // Obtener wallpapers por categoría
  static async getWallpapersByCategory(category: string, userId?: string): Promise<Wallpaper[]> {
    const { data: wallpapers, error } = await supabase
      .from('wallpapers')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!userId) {
      return wallpapers.map(w => ({ ...w, isLiked: false }));
    }

    // Obtener likes del usuario para esta categoría
    const wallpaperIds = wallpapers.map(w => w.id);
    const { data: userLikes } = await supabase
      .from('user_likes')
      .select('wallpaper_id')
      .eq('user_id', userId)
      .in('wallpaper_id', wallpaperIds);

    const likedIds = new Set(userLikes?.map(like => like.wallpaper_id) || []);

    return wallpapers.map(wallpaper => ({
      ...wallpaper,
      isLiked: likedIds.has(wallpaper.id)
    }));
  }

  // Buscar wallpapers
  static async searchWallpapers(query: string, userId?: string): Promise<Wallpaper[]> {
    const { data: wallpapers, error } = await supabase
      .from('wallpapers')
      .select('*')
      .or(`title.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!userId) {
      return wallpapers.map(w => ({ ...w, isLiked: false }));
    }

    // Obtener likes del usuario para los resultados de búsqueda
    const wallpaperIds = wallpapers.map(w => w.id);
    if (wallpaperIds.length === 0) return [];

    const { data: userLikes } = await supabase
      .from('user_likes')
      .select('wallpaper_id')
      .eq('user_id', userId)
      .in('wallpaper_id', wallpaperIds);

    const likedIds = new Set(userLikes?.map(like => like.wallpaper_id) || []);

    return wallpapers.map(wallpaper => ({
      ...wallpaper,
      isLiked: likedIds.has(wallpaper.id)
    }));
  }

  // Obtener estadísticas generales
  static async getStats() {
    try {
      const [
        { count: wallpaperCount },
        { count: downloadCount },
        { count: likeCount }
      ] = await Promise.all([
        supabase.from('wallpapers').select('*', { count: 'exact', head: true }),
        supabase.from('user_downloads').select('*', { count: 'exact', head: true }),
        supabase.from('user_likes').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalWallpapers: wallpaperCount || 0,
        totalDownloads: downloadCount || 0,
        totalLikes: likeCount || 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalWallpapers: 0,
        totalDownloads: 0,
        totalLikes: 0
      };
    }
  }

  // Obtener wallpapers más populares
  static async getPopularWallpapers(limit: number = 10, userId?: string): Promise<Wallpaper[]> {
    const { data: wallpapers, error } = await supabase
      .from('wallpapers')
      .select('*')
      .order('likes', { ascending: false })
      .order('downloads', { ascending: false })
      .limit(limit);

    if (error) throw error;

    if (!userId) {
      return wallpapers.map(w => ({ ...w, isLiked: false }));
    }

    // Obtener likes del usuario
    const wallpaperIds = wallpapers.map(w => w.id);
    const { data: userLikes } = await supabase
      .from('user_likes')
      .select('wallpaper_id')
      .eq('user_id', userId)
      .in('wallpaper_id', wallpaperIds);

    const likedIds = new Set(userLikes?.map(like => like.wallpaper_id) || []);

    return wallpapers.map(wallpaper => ({
      ...wallpaper,
      isLiked: likedIds.has(wallpaper.id)
    }));
  }

  // Obtener wallpapers favoritos del usuario
  static async getUserFavorites(userId: string): Promise<Wallpaper[]> {
    const { data, error } = await supabase
      .from('user_likes')
      .select(`
        wallpaper_id,
        wallpapers (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map((item: any) => ({
      ...item.wallpapers,
      isLiked: true
    }));
  }
}
