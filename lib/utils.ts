import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const instructorName = "Rafael Nascimento";
export const siteName = "Zênite Academy";
export const siteDescription =
  "A plataforma de aprendizado online para impulsionar sua carreira com cursos de alta qualidade.";
export const subject = "Online Learning";
