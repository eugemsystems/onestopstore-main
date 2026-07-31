"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import useUtilsFunction from "@hooks/useUtilsFunction";

const FeatureCategoryModernCard = ({ category, bgClass }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  const handleCategoryClick = (id, categoryName) => {
    const category_name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");
    const url = `/search?category=${category_name}&_id=${id}`;
    router.push(url);
  };

  const catName = showingTranslateValue(category?.name) || "Category";

  // Only use true product counts if available from the backend, DO NOT use children length as they are subcategories
  const itemQty = category?.products?.length || category?.productCount;
  const formattedCount = itemQty ? (itemQty < 10 ? `0${itemQty}` : itemQty) : null;

  return (
    <li className="group h-full list-none">
      <div 
        onClick={() => handleCategoryClick(category._id, showingTranslateValue(category?.name))}
        className={`flex flex-col items-center justify-center w-full h-[180px] rounded-2xl bg-gradient-to-b ${bgClass} to-white dark:to-background cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-4 border border-border/30`}
      >
        <div className="flex-grow flex items-center justify-center mb-2 drop-shadow-md transition-transform duration-300 group-hover:scale-110">
          <Image
            src={category?.icon || "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"}
            alt="category"
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <div className="text-center w-full mt-auto">
          <h3 className="text-[15px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-1 mb-1 group-hover:text-primary transition-colors">
            {catName}
          </h3>
          <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
            {formattedCount ? `${formattedCount} Product` : "\u00A0"}
          </p>
        </div>
      </div>
    </li>
  );
};

export default FeatureCategoryModernCard;
