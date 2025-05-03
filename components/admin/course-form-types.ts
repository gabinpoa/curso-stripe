import { z } from "zod";
import { ContentType } from "@/lib/db/schema";
import { Image as CartPandaImage } from "@/lib/cartpanda";

export const courseFormSchema = z.object({
  productId: z.string().min(1, "CartPanda Product ID is required"),
  libraryId: z.string().optional(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export type CartPandaProduct = {
  id: string;
  title: string;
  price: number;
  images: CartPandaImage[];
  active: boolean;
};

export type Module = {
  id: string;
  title: string;
  description: string;
  order: number;
  isExtraContent: boolean;
  contentType: ContentType;
  collectionId?: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  content: string;
  order: number;
};

export type BunnyCollection = {
  guid: string;
  name: string;
  videoCount: number;
};