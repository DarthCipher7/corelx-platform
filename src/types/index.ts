export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role: string;
  bio: string;
  skills: string[];
  followers: number;
  following: number;
  projects: number;
  verified: boolean;
  online: boolean;
  coverGradient: string;
  location: string;
  joinedYear: number;
  socialLinks: {
    github?: string;
    twitter?: string;
    dribbble?: string;
    linkedin?: string;
  };
  college?: {
    id: string;
    name: string;
    short_name?: string;
    hub_type?: 'college' | 'society' | 'corporate';
  } | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  tags: string[];
  likes: number;
  views: number;
  creator: Pick<Creator, "id" | "name" | "handle" | "avatar" | "verified">;
  featured: boolean;
  createdAt: string;
  gradient: string;
}

export type CollabStatus = "open" | "has_responses" | "closed" | "expired";

export interface CollabRequest {
  id: string;
  title: string;
  description: string;
  skills: string[];
  type: "paid" | "collab" | "open-source";
  budget?: string;
  creator: Pick<Creator, "id" | "name" | "handle" | "avatar" | "verified">;
  deadline?: string;
  applicants: number;
  collab_status?: CollabStatus;
  closed_at?: string;
  response_count?: number;
}

export interface Notification {
  id: string;
  type: "follow" | "like" | "collab" | "mention" | "message";
  message: string;
  actor: Pick<Creator, "id" | "name" | "avatar">;
  read: boolean;
  createdAt: string;
}

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

export interface FeedPostData {
  id: string;
  type: "work_post" | "collab_call" | "trending_creator_spotlight";
  creator: Pick<Creator, "id" | "name" | "handle" | "avatar" | "verified" | "role" | "college">;
  timestamp: string;
  title?: string;
  caption: string;
  mediaUrl?: string;
  tags: string[];
  saves: number;
  views?: number;
  category?: string;
  bug_details?: {
    title: string;
    severity: "critical" | "high" | "medium" | "low";
    platforms: string[];
    steps: string[];
    stackTrace?: string;
    screenshotUrl?: string;
  };
}


export interface Flare {
  id: string;
  user_id: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  tags: string[];
  duration_seconds?: number;
  created_at: string;
  spark_count?: number;
  views?: number;
  users?: {
    display_name?: string;
    handle: string;
    avatar_url?: string;
  };
}

// ── Campus Layer Types ──────────────────────────────────────────

export type TrustTier = 'open' | 'checked' | 'guarded';
export type EventCategory = 'sports' | 'music' | 'academic' | 'social' | 'misc' | 'hackathon';
export type RsvpStatus = 'none' | 'pending' | 'attending' | 'declined' | 'waitlist';
export type PodType = 'hackathon' | 'class' | 'club' | 'project' | 'meetup' | 'sports' | 'gaming' | 'tournament';

export interface CollegeInfo {
  id: string;
  name: string;
  short_name?: string;
  email_domain: string;
  city?: string;
  country?: string;
  hub_type?: 'college' | 'society' | 'corporate';
}


export interface CampusEvent {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  trust_tier: TrustTier;
  location_name?: string;
  starts_at: string;
  ends_at: string;
  expires_at: string;
  min_headcount?: number;
  max_headcount?: number;
  current_headcount?: number;
  is_active: boolean;
  require_mutual?: boolean;
  require_face?: boolean;
  organiser_id: string;
  college_id?: string;
  created_at: string;
  organiser?: {
    handle: string;
    display_name: string;
    avatar_url?: string;
  };
  rsvp_status?: RsvpStatus;
}

export type PodStatus = 'active' | 'archived' | 'deleted';
export type PodRole = 'creator' | 'admin' | 'member';

export interface Pod {
  id: string;
  name: string;
  pod_type: PodType;
  description?: string;
  visibility: 'open' | 'invite';
  max_members?: number;
  role_tags: string[];
  is_active: boolean;
  creator_id: string;
  college_id?: string;
  created_at: string;
  creator?: {
    handle: string;
    display_name: string;
    avatar_url?: string;
  };
  member_count?: number;
  is_member?: boolean;
  pod_status?: PodStatus;
  archived_at?: string;
  auto_purge_at?: string;
  role?: PodRole;
}

export interface PodMessage {
  id: string;
  pod_id: string;
  sender_id: string;
  content: string;
  is_pinned: boolean;
  is_system: boolean;
  created_at: string;
  sender?: {
    handle: string;
    display_name: string;
    avatar_url?: string;
  };
}
