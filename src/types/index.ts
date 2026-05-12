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
  creator: Pick<Creator, "id" | "name" | "handle" | "avatar" | "verified" | "role">;
  timestamp: string;
  title?: string;
  caption: string;
  mediaUrl?: string;
  tags: string[];
  saves: number;
}
