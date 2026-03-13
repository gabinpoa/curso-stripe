import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Thumbnail } from "./fs/queries";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const instructorName = process.env.INSTRUCTOR_NAME || "Default Instructor";
export const siteName = process.env.SITE_NAME || "Default Site Name";
export const siteDescription =
  process.env.SITE_DESCRIPTION || "Default site description.";
export const subject = process.env.EMAIL_SUBJECT || "Default Subject";
export const FALLBACK_THUMBNAIL: Thumbnail = { origin: "names", path: "/placeholder.png" };
