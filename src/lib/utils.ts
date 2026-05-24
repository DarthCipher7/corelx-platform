import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getMediaType(url: string | undefined): "image" | "video" | "audio" | null {
  if (!url) return null;
  const lowercaseUrl = url.toLowerCase().split('?')[0];
  if (
    lowercaseUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp|tiff)$/) ||
    (lowercaseUrl.includes("/traces/") && (
      lowercaseUrl.endsWith(".jpg") || 
      lowercaseUrl.endsWith(".jpeg") || 
      lowercaseUrl.endsWith(".png") || 
      lowercaseUrl.endsWith(".gif") || 
      lowercaseUrl.endsWith(".webp")
    ))
  ) {
    return "image";
  }
  if (
    lowercaseUrl.match(/\.(mp4|webm|ogg|mov|mkv|3gp|avi|flv|wmv)$/) ||
    lowercaseUrl.includes("video")
  ) {
    return "video";
  }
  if (
    lowercaseUrl.match(/\.(mp3|wav|flac|aac|m4a|ogg|wma)$/) ||
    lowercaseUrl.includes("audio")
  ) {
    return "audio";
  }
  return "image"; // Default fallback
}

