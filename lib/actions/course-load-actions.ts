"use server";

import { getCompletedLessons } from "../db/queries";

export async function getCompletedLessonsFromDb(courseId: string) {
  const completedLessons = await getCompletedLessons(courseId);
  return completedLessons;
}
