export const PRODUCT_CATEGORIES = [
   {
      label: "UI Kits",
      value: "ui_kits" as const,
      featured: [
         {
            name: "Editors picks",
            href: "#",
            imageSrc: "/nav/ui-kits/mixed.jpg",
         },
         {
            name: "New releases",
            href: "#",
            imageSrc: "/nav/ui-kits/blue.jpg",
         },
         {
            name: "Best sellers",
            href: "#",
            imageSrc: "/nav/ui-kits/purple.jpg",
         },
      ],
   },
   {
      label: "Icons",
      value: "icons" as const,
      featured: [
         {
            name: "Favorite Icon Picks",
            href: "#",
            imageSrc: "/nav/icons/picks.jpg",
         },
         {
            name: "New releases",
            href: "#",
            imageSrc: "/nav/icons/new.jpg",
         },
         {
            name: "Best sellers",
            href: "#",
            imageSrc: "/nav/icons/bestsellers.jpg",
         },
      ],
   },
];
