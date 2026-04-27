export type StoryType = 'text' | 'audio' | 'both';

export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_seed: number;
  role: 'reader' | 'writer' | 'admin';
  created_at: string;
};

export type Story = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  body: string | null;
  type: StoryType;
  audio_url: string | null;
  cover_seed: number;
  mins: number;
  plays: number;
  likes: number;
  status: 'draft' | 'published' | 'archived';
  author_id: string;
  author?: Profile;
  tags: string[];
  created_at: string;
  published_at: string | null;
};

export type Comment = {
  id: string;
  story_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: Profile;
};

export type Contest = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string;
  prize: string;
  status: 'upcoming' | 'open' | 'judging' | 'closed';
};
