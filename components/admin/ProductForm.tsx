import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CourseFormValues, courseFormSchema } from "./course-form-types";

type ProductFormProps = {
  isLoading: boolean;
  onSubmit: (values: CourseFormValues) => void;
};

export function ProductForm({ isLoading, onSubmit }: ProductFormProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      productId: "",
      libraryId: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="productId">CartPanda Product ID</Label>
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
          <Label htmlFor="libraryId">BunnyNet Library ID (Optional)</Label>
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
  );
}
