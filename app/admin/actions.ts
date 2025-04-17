"use server";

import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { lessons, modules, NewModule, NewModuleLesson } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function seedCourse(data: {
  productId: string;
  libraryId: string;
  modules: {
    collectionId: string;
    isExtraContent: boolean;
  }[];
}) {
  "use server";
  const user = await getUser();
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  const { productId, libraryId, modules: moduleData } = data;

  for (const [moduleOrder, moduleInfo] of moduleData.entries()) {
    const { collectionId, isExtraContent } = moduleInfo;

    const collectionRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/collections/${collectionId}`,
      {
        headers: {
          Accept: "application/json",
          AccessKey: process.env.BUNNY_ACCESS_KEY!,
        },
      }
    );
    const collection = await collectionRes.json();

    const module_: NewModule = {
      name: collection.name,
      productId,
      order: moduleOrder + 1,
      isExtraContent,
    };

    await db.insert(modules).values(module_);
    const createdModule = await db
      .select()
      .from(modules)
      .where(eq(modules.name, module_.name));

    const moduleId = createdModule[0].id;

    const videosFromCollectionRes = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/videos?page=1&itemsPerPage=100&collection=${collectionId}&orderBy=date`,
      {
        headers: {
          Accept: "application/json",
          AccessKey: process.env.BUNNY_ACCESS_KEY!,
        },
      }
    );
    const videosFromCollection = await videosFromCollectionRes.json();
    const lessons_: NewModuleLesson[] = [];
    let lessonOrder = 1;

    for (const video of videosFromCollection.items) {
      const lesson: NewModuleLesson = {
        moduleId,
        name: video.title.split(".mp4")[0],
        description: video.description || null,
        contentType: "VIDEO",
        content: `https://iframe.mediadelivery.net/embed/${video.videoLibraryId}/${video.guid}`,
        order: lessonOrder,
      };
      lessons_.push(lesson);
      lessonOrder++;
    }

    await db.insert(lessons).values(lessons_);
  }
}
