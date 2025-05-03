"use client";

import { useState } from "react";
import { ProductForm } from "./ProductForm";
import { ProductDetails } from "./ProductDetails";
import { ModulesManager } from "./ModulesManager";
import { CartPandaProduct, Module } from "./course-form-types";
import { toast } from "sonner";
import { ContentType } from "@/lib/db/schema";
import { cartpanda } from "@/lib/cartpanda/instance";

export function CourseCreationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [cartPandaProduct, setCartPandaProduct] =
    useState<CartPandaProduct | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  const handleFetchProduct = async (values: { productId: string }) => {
    try {
      setIsLoading(true);
      const product = await cartpanda.getProduct(values.productId);
      setCartPandaProduct({
        id: product.id.toString(),
        title: product.title,
        price: product.price,
        images: product.images,
        active: product.active === 1,
      });
      toast.success("Product fetched successfully");
    } catch {
      toast.error("Failed to fetch product");
    } finally {
      setIsLoading(false);
    }
  };

  const addModule = () => {
    setModules((prevState) => [
      ...prevState,
      {
        id: `temp-${Date.now()}`,
        title: "",
        description: "",
        order: prevState.length + 1,
        isExtraContent: false,
        contentType: "MDX" as ContentType,
        lessons: [],
      },
    ]);
  };

  const updateModule = (index: number, data: Partial<Module>) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], ...data };
    setModules(updatedModules);
  };

  const removeModule = (index: number) => {
    const updatedModules = [...modules];
    updatedModules.splice(index, 1);
    setModules(updatedModules);
  };

  return (
    <div className="space-y-8">
      <ProductForm isLoading={isLoading} onSubmit={handleFetchProduct} />
      {cartPandaProduct && <ProductDetails product={cartPandaProduct} />}
      <ModulesManager
        modules={modules}
        onAddModule={addModule}
        onUpdateModule={updateModule}
        onRemoveModule={removeModule}
      />
    </div>
  );
}
