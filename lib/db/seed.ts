import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import readline from "readline";
import {
  modules,
  lessons,
  type NewModule,
  type NewModuleLesson,
} from "./schema";

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function seed() {
  while (
    (await askQuestion(
      "Do you want to add a course? (leave empty for yes): "
    )) === ""
  ) {
    const productId = await askQuestion("Enter product ID: ");
    const libraryId = await askQuestion("Enter library ID: ");

    let moduleOrder = 1;
    while (
      (await askQuestion(
        "Do you want to add a module? (leave empty for yes): "
      )) === ""
    ) {
      const collectionId = await askQuestion("Enter module collection ID: ");
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
        productId: productId,
        order: moduleOrder,
        isExtraContent:
          (await askQuestion(
            "Is this module extra content? (leave empty for yes): "
          )) === "",
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
          moduleId: moduleId,
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

      moduleOrder++;
    }

    console.log(`Course added successfully!`);
  }
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
