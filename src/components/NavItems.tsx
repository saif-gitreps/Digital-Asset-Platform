"use client";

import { PRODUCT_CATEGORIES } from "@/config";
import NavItem from "./NavItem";
import { useEffect, useRef, useState } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const NavItems = () => {
   const [activeIndex, setActiveIndex] = useState<null | number>(null);

   useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Escape") setActiveIndex(null);
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => document.removeEventListener("keydown", handleKeyDown);
   }, []);

   const isAnyOpen = activeIndex !== null;

   const navRef = useRef<HTMLDivElement | null>(null);

   useOnClickOutside(navRef, () => setActiveIndex(null));

   return (
      <div className="flex gap-4 h-full" ref={navRef}>
         {PRODUCT_CATEGORIES.map((category, index) => {
            const handleOpen = () => {
               if (activeIndex === index) {
                  setActiveIndex(null);
               } else {
                  setActiveIndex(index);
               }
            };

            const isOpen = index === activeIndex;

            return (
               <NavItem
                  category={category}
                  handleOpen={handleOpen}
                  isOpen={isOpen}
                  close={() => setActiveIndex(null)}
                  key={category.value}
                  isAnyOpen={isAnyOpen}
               />
            );
         })}
      </div>
   );
};

export default NavItems;
