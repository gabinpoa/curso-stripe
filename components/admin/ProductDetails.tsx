import Image from "next/image";
import { CartPandaProduct } from "./course-form-types";

type ProductDetailsProps = {
  product: CartPandaProduct;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="aspect-video relative rounded-lg overflow-hidden">
        {product.images.length > 0 ? (
          <Image
            src={product.images[0].src}
            alt={product.images[0].alt}
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
          <h3 className="text-lg font-medium">{product.title}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Product ID</p>
            <p className="text-sm text-muted-foreground">{product.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Price</p>
            <p className="text-sm text-muted-foreground">{product.price}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-sm text-muted-foreground">
              {product.active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
