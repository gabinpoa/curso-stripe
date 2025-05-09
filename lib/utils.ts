import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const instructorName = process.env.INSTRUCTOR_NAME || "Default Instructor";
export const siteName = process.env.SITE_NAME || "Default Site Name";
export const siteDescription =
  process.env.SITE_DESCRIPTION || "Default site description.";
export const subject = process.env.EMAIL_SUBJECT || "Default Subject";
