"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { useCart } from "@/hooks/use-carts";
import { Product } from "@/payload-types";

const AddToCartButton = ({ product }: { product: Product }) => {
   const [isSuccess, setIsSuccess] = useState<boolean>(false);
   const { addItem } = useCart();

   useEffect(() => {
      const timeout = setTimeout(() => {
         setIsSuccess(false);
      }, 2000);

      return () => clearTimeout(timeout);
   }, [isSuccess]);

   return (
      <Button
         onClick={() => {
            addItem(product);
            setIsSuccess(true);
         }}
         size="lg"
         className="w-full"
      >
         {isSuccess ? "Added" : "Add to Cart!"}
      </Button>
   );
};

export default AddToCartButton;
