'use server';
import { revalidatePath } from 'next/cache';
import { createClient, supabaseEnabled } from './supabase/server';

async function requireUser() {
  if (!supabaseEnabled) throw new Error('Sign in required (Supabase not configured).');
  const sb = createClient()!;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) throw new Error('Sign in required.');
  return { sb, userId: user.id };
}

// ---------- Likes ----------
export async function toggleLike(storyId: string, currentlyLiked: boolean) {
  try {
    const { sb, userId } = await requireUser();
    if (currentlyLiked) {
      await sb.from('likes').delete().eq('story_id', storyId).eq('user_id', userId);
    } else {
      await sb.from('likes').insert({ story_id: storyId, user_id: userId });
    }
    revalidatePath('/feed');
    return { ok: true, liked: !currentlyLiked };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Bookmarks ----------
export async function toggleBookmark(storyId: string, currentlySaved: boolean) {
  try {
    const { sb, userId } = await requireUser();
    if (currentlySaved) {
      await sb.from('bookmarks').delete().eq('story_id', storyId).eq('user_id', userId);
    } else {
      await sb.from('bookmarks').insert({ story_id: storyId, user_id: userId });
    }
    return { ok: true, saved: !currentlySaved };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Follows ----------
export async function toggleFollow(targetId: string, currentlyFollowing: boolean) {
  try {
    const { sb, userId } = await requireUser();
    if (userId === targetId) return { ok: false, error: "Can't follow yourself." };
    if (currentlyFollowing) {
      await sb.from('follows').delete().eq('follower_id', userId).eq('following_id', targetId);
    } else {
      await sb.from('follows').insert({ follower_id: userId, following_id: targetId });
      await sb.from('notifications').insert({
        user_id: targetId, kind: 'follow', payload: { from: userId },
      });
    }
    return { ok: true, following: !currentlyFollowing };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Comments ----------
export async function addComment(storyId: string, body: string) {
  try {
    if (!body.trim()) return { ok: false, error: 'Comment is empty.' };
    const { sb, userId } = await requireUser();
    const { data: story } = await sb.from('stories').select('author_id').eq('id', storyId).single();
    const { data: comment, error } = await sb
      .from('comments')
      .insert({ story_id: storyId, author_id: userId, body: body.trim() })
      .select('*, author:profiles!comments_author_id_fkey(*)')
      .single();
    if (error) throw error;
    if (story && story.author_id !== userId) {
      const { data: storyMeta } = await sb.from('stories').select('slug').eq('id', storyId).single();
      await sb.from('notifications').insert({
        user_id: story.author_id, kind: 'comment',
        payload: { from: userId, story_id: storyId, story_slug: storyMeta?.slug, comment_id: comment.id },
      });
    }
    return { ok: true, comment };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function deleteComment(commentId: string) {
  try {
    const { sb } = await requireUser();
    await sb.from('comments').delete().eq('id', commentId);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Stories ----------
function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80) + '-' + Math.random().toString(36).slice(2, 7);
}

export async function publishStory(input: {
  title: string; subtitle?: string; body: string;
  type: 'text' | 'audio' | 'both'; tags?: string[]; coverSeed?: number;
}) {
  try {
    const { sb, userId } = await requireUser();
    if (!input.title.trim()) return { ok: false, error: 'Title is required.' };
    if (!input.body.trim()) return { ok: false, error: 'Story body is required.' };
    const words = input.body.split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 220));
    const excerpt = input.body.split(/\n\n/)[0].slice(0, 220);
    const { data, error } = await sb.from('stories').insert({
      slug: slugify(input.title),
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() || null,
      body: input.body,
      excerpt,
      type: input.type,
      tags: input.tags || [],
      cover_seed: input.coverSeed ?? Math.floor(Math.random() * 9),
      mins,
      author_id: userId,
      status: 'published',
      published_at: new Date().toISOString(),
    }).select('slug').single();
    if (error) throw error;
    revalidatePath('/feed');
    revalidatePath('/books');
    return { ok: true, slug: data.slug };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

export async function saveDraft(input: {
  id?: string; title: string; subtitle?: string; body: string;
  type: 'text' | 'audio' | 'both';
}) {
  try {
    const { sb, userId } = await requireUser();
    if (input.id) {
      await sb.from('stories').update({
        title: input.title, subtitle: input.subtitle || null, body: input.body, type: input.type,
      }).eq('id', input.id).eq('author_id', userId);
      return { ok: true, id: input.id };
    }
    const { data, error } = await sb.from('stories').insert({
      slug: slugify(input.title || 'untitled'),
      title: input.title || 'Untitled',
      subtitle: input.subtitle || null,
      body: input.body,
      excerpt: input.body.slice(0, 220),
      type: input.type, mins: 1, author_id: userId, status: 'draft',
    }).select('id').single();
    if (error) throw error;
    return { ok: true, id: data.id };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Profile ----------
export async function updateProfile(input: { display_name: string; bio?: string; avatar_seed?: number }) {
  try {
    const { sb, userId } = await requireUser();
    await sb.from('profiles').update({
      display_name: input.display_name,
      bio: input.bio || null,
      avatar_seed: input.avatar_seed ?? 0,
    }).eq('id', userId);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}

// ---------- Notifications ----------
export async function markNotificationsRead() {
  try {
    const { sb, userId } = await requireUser();
    await sb.from('notifications').update({ read_at: new Date().toISOString() })
      .eq('user_id', userId).is('read_at', null);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
