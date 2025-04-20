"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { fetchStripeProduct, createCourse } from "@/lib/actions/course-actions";
import { MDXEditor } from "@/components/mdx-editor";
import { toast } from "sonner";
import Image from "next/image";
import { ContentType } from "@/lib/db/schema";

const courseFormSchema = z.object({
  productId: z.string().min(1, "Stripe Product ID is required"),
  libraryId: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

type StripeProduct = {
  id: string;
  name: string;
  description: string | null;
  defaultPriceId: string;
  thumbnail: string;
  active: boolean;
};

type Module = {
  id: string;
  name: string;
  description: string;
  order: number;
  isExtraContent: boolean;
  contentType: ContentType;
  collectionId?: string;
  lessons: Lesson[];
};

type Lesson = {
  id: string;
  name: string;
  description: string;
  contentType: ContentType;
  content: string;
  order: number;
};

type BunnyCollection = {
  guid: string;
  name: string;
  videoCount: number;
};

export function CourseCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [stripeProduct, setStripeProduct] = useState<StripeProduct | null>(
    null
  );
  const [modules, setModules] = useState<Module[]>([]);
  const [bunnyCollections, setBunnyCollections] = useState<BunnyCollection[]>(
    []
  );
  const [libraryId, setLibraryId] = useState("");

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      productId: "",
      libraryId: "",
    },
  });

  const handleFetchProduct = async (values: CourseFormValues) => {
    try {
      setIsLoading(true);
      const product = await fetchStripeProduct(values.productId);
      setStripeProduct(product);
      setLibraryId(values.libraryId || "");

      if (values.libraryId) {
        const collections = await fetchBunnyCollections(values.libraryId);
        setBunnyCollections(collections);
      }

      toast.success("Product fetched successfully", {
        description: `Found: ${product.name}`,
      });
    } catch (error) {
      toast.error("Error fetching product", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBunnyCollections = async (libraryId: string) => {
    try {
      const response = await fetch(
        `/api/bunny/collections?libraryId=${libraryId}`
      );
      if (!response.ok) throw new Error("Failed to fetch collections");
      return await response.json();
    } catch (error) {
      toast.error("Error fetching collections", {
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
      return [];
    }
  };

  const addModule = () => {
    const newModule: Module = {
      id: `temp-${Date.now()}`,
      name: "",
      description: "",
      order: modules.length + 1,
      isExtraContent: false,
      contentType: ContentType.MDX,
      collectionId: undefined,
      lessons: [],
    };
    setModules([...modules, newModule]);
  };

  const removeModule = (index: number) => {
    const updatedModules = [...modules];
    updatedModules.splice(index, 1);
    // Update order for remaining modules
    updatedModules.forEach((module, idx) => {
      module.order = idx + 1;
    });
    setModules(updatedModules);
  };

  const updateModule = (index: number, data: Partial<Module>) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], ...data };
    setModules(updatedModules);
  };

  const addLesson = (moduleIndex: number) => {
    const updatedModules = [...modules];
    const module_ = updatedModules[moduleIndex];
    const newLesson: Lesson = {
      id: `temp-${Date.now()}`,
      name: "",
      description: "",
      contentType: ContentType.MDX,
      content: "",
      order: module_.lessons.length + 1,
    };
    module_.lessons.push(newLesson);
    setModules(updatedModules);
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons.splice(lessonIndex, 1);
    // Update order for remaining lessons
    updatedModules[moduleIndex].lessons.forEach((lesson, idx) => {
      lesson.order = idx + 1;
    });
    setModules(updatedModules);
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    data: Partial<Lesson>
  ) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].lessons[lessonIndex] = {
      ...updatedModules[moduleIndex].lessons[lessonIndex],
      ...data,
    };
    setModules(updatedModules);
  };

  const handleSaveCourse = async () => {
    if (!stripeProduct) {
      toast.error("Please fetch a product first");
      return;
    }

    // Validate modules
    for (const courseModule of modules) {
      if (!courseModule.name.trim()) {
        toast.error("All modules must have a name");
        return;
      }

      if (
        courseModule.contentType === ContentType.VIDEO &&
        !courseModule.collectionId
      ) {
        toast.error("All video modules must have a collection selected");
        return;
      }

      if (courseModule.contentType === ContentType.MDX) {
        for (const lesson of courseModule.lessons) {
          if (!lesson.name.trim() || !lesson.content.trim()) {
            toast.error("All MDX lessons must have a name and content");
            return;
          }
        }
      }
    }

    try {
      setIsSaving(true);
      await createCourse({
        productId: stripeProduct.id,
        libraryId,
        modules: modules.map((module) => ({
          name: module.name,
          description: module.description,
          order: module.order,
          isExtraContent: module.isExtraContent,
          contentType: module.contentType,
          collectionId: module.collectionId || "",
          lessons: module.lessons.map((lesson) => ({
            name: lesson.name,
            description: lesson.description,
            contentType: lesson.contentType,
            content: lesson.content,
            order: lesson.order,
          })),
        })),
      });

      toast.success("Course created successfully", {
        description: "Your course has been saved to the database",
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleFetchProduct)}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Stripe Product ID</Label>
                <Input
                  id="productId"
                  placeholder="prod_..."
                  {...form.register("productId")}
                />
                {form.formState.errors.productId && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.productId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="libraryId">
                  BunnyNet Library ID (Optional)
                </Label>
                <Input
                  id="libraryId"
                  placeholder="12345"
                  {...form.register("libraryId")}
                />
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Product
            </Button>
          </form>
        </CardContent>
      </Card>

      {stripeProduct && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  {stripeProduct.thumbnail ? (
                    <Image
                      src={stripeProduct.thumbnail || "/placeholder.svg"}
                      alt={stripeProduct.name}
                      width={600}
                      height={300}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      No thumbnail
                    </div>
                  )}
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {stripeProduct.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {stripeProduct.description || "No description"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Product ID</p>
                      <p className="text-sm text-muted-foreground">
                        {stripeProduct.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Price ID</p>
                      <p className="text-sm text-muted-foreground">
                        {stripeProduct.defaultPriceId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-muted-foreground">
                        {stripeProduct.active ? "Active" : "Inactive"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Course Modules</CardTitle>
              <Button onClick={addModule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {modules.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No modules added yet. Click &quot;Add Module&quot; to get
                    started.
                  </p>
                )}

                {modules.map((module, moduleIndex) => (
                  <Card key={module.id} className="border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                            {module.order}
                          </span>
                          <Input
                            placeholder="Module Name"
                            value={module.name}
                            onChange={(e) =>
                              updateModule(moduleIndex, {
                                name: e.target.value,
                              })
                            }
                            className="max-w-md font-medium"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeModule(moduleIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`module-${moduleIndex}-description`}>
                          Description
                        </Label>
                        <Textarea
                          id={`module-${moduleIndex}-description`}
                          placeholder="Module description"
                          value={module.description}
                          onChange={(e) =>
                            updateModule(moduleIndex, {
                              description: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`module-${moduleIndex}-extra`}
                          checked={module.isExtraContent}
                          onCheckedChange={(checked) =>
                            updateModule(moduleIndex, {
                              isExtraContent: checked,
                            })
                          }
                        />
                        <Label htmlFor={`module-${moduleIndex}-extra`}>
                          Extra Content
                        </Label>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`module-${moduleIndex}-type`}>
                          Content Type
                        </Label>
                        <Select
                          value={module.contentType}
                          onValueChange={(value) =>
                            updateModule(moduleIndex, {
                              contentType: value as ContentType,
                              lessons:
                                value === ContentType.MDX ? module.lessons : [],
                            })
                          }
                        >
                          <SelectTrigger id={`module-${moduleIndex}-type`}>
                            <SelectValue placeholder="Select content type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ContentType.VIDEO}>
                              BunnyNet Videos
                            </SelectItem>
                            <SelectItem value={ContentType.MDX}>
                              MDX Content
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {module.contentType === ContentType.VIDEO && (
                        <div className="space-y-2">
                          <Label htmlFor={`module-${moduleIndex}-collection`}>
                            Video Collection
                          </Label>
                          <Select
                            value={module.collectionId}
                            onValueChange={(value) =>
                              updateModule(moduleIndex, { collectionId: value })
                            }
                          >
                            <SelectTrigger
                              id={`module-${moduleIndex}-collection`}
                            >
                              <SelectValue placeholder="Select a collection" />
                            </SelectTrigger>
                            <SelectContent>
                              {bunnyCollections.map((collection) => (
                                <SelectItem
                                  key={collection.guid}
                                  value={collection.guid}
                                >
                                  {collection.name} ({collection.videoCount}{" "}
                                  videos)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {module.contentType === ContentType.MDX && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium">Lessons</h4>
                            <Button
                              onClick={() => addLesson(moduleIndex)}
                              size="sm"
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Lesson
                            </Button>
                          </div>

                          {module.lessons.length === 0 && (
                            <p className="text-center text-muted-foreground py-2 text-sm">
                              No lessons added yet. Click &quot;Add Lesson&quot;
                              to get started.
                            </p>
                          )}

                          {module.lessons.map((lesson, lessonIndex) => (
                            <Card key={lesson.id} className="border-muted">
                              <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-muted text-muted-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium">
                                      {lesson.order}
                                    </span>
                                    <Input
                                      placeholder="Lesson Name"
                                      value={lesson.name}
                                      onChange={(e) =>
                                        updateLesson(moduleIndex, lessonIndex, {
                                          name: e.target.value,
                                        })
                                      }
                                      className="max-w-md"
                                    />
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeLesson(moduleIndex, lessonIndex)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`lesson-${moduleIndex}-${lessonIndex}-description`}
                                  >
                                    Description
                                  </Label>
                                  <Textarea
                                    id={`lesson-${moduleIndex}-${lessonIndex}-description`}
                                    placeholder="Lesson description"
                                    value={lesson.description}
                                    onChange={(e) =>
                                      updateLesson(moduleIndex, lessonIndex, {
                                        description: e.target.value,
                                      })
                                    }
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label
                                    htmlFor={`lesson-${moduleIndex}-${lessonIndex}-content`}
                                  >
                                    Content (MDX)
                                  </Label>
                                  <MDXEditor
                                    value={lesson.content}
                                    onChange={(value) =>
                                      updateLesson(moduleIndex, lessonIndex, {
                                        content: value,
                                      })
                                    }
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveCourse} disabled={isSaving} size="lg">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Course
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
