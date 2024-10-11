"use client";

import { Product } from "@/payload-types";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { PRODUCT_CATEGORIES } from "@/config";
import ImageSlider from "./ImageSlider";

interface ProductListingProps {
   product: Product | null;
}

const ProductListing = ({ product }: ProductListingProps) => {
   const ProductPlaceholder = () => {
      return (
         <div className="flex flex-col w-full">
            <div className="relative bg-zince-100 aspect-square w-full overflow-hidden rounded-xl">
               <Skeleton className="h-full w-full" />
            </div>
            <Skeleton className="mt-4 w-2/3 h-4 rounded-lg" />
            <Skeleton className="mt-2 w-16 h-4 rounded-lg" />
            <Skeleton className="mt-4 w-12 h-4 rounded-lg" />
         </div>
      );
   };

   if (!product) return <ProductPlaceholder />;

   const label = PRODUCT_CATEGORIES.find(
      ({ value }) => value === product.category
   )?.label;

   const validUrls = product.images
      .map(({ image }) => (typeof image === "string" ? image : image.url))
      .filter(Boolean) as string[];

   if (product) {
      return (
         <Link
            className="h-full w-full cursor-pointer group/main visible animate-in fade-in-5"
            href={`/product/${product.id}`}
         >
            <div className="flex flex-col w-full">
               <ImageSlider urls={validUrls} />

               <h3 className="mt-4 font-bold text-sm tex t-gray-700">{product.name}</h3>

               <p className="mt-1 font-medium text-sm text-gray-700">{label}</p>

               <p className="mt-1 font-bold text-gray-700">
                  {formatPrice(product.price)}
               </p>
            </div>
         </Link>
      );
   }
};

export default ProductListing;
