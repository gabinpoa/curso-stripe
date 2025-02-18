import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const instructorName = 'Rafael Nascimento';
export const siteName = 'NomeSite';
export const subject = 'Lorem Ipsum';
