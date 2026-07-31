"use client";

import { useRouter } from "next/navigation";
import { IoChevronForwardSharp } from "react-icons/io5";

//internal import

import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryNavigateButton = ({ category }) => {
  const router = useRouter();
  const { showingTranslateValue } = useUtilsFunction();

  // console.log("category", category);

  // Laravel filters by the category's real `slug` (e.g. "wine-25202") —
  // NOT a client-derived slug of the display name, which almost never
  // matches and silently returns zero results.
  const handleCategoryClick = (id, slug) => {
    router.push(`/search?category=${slug}&_id=${id}`);
  };

  return (
    <>
      <div className="pl-4">
        <h3
          onClick={() => handleCategoryClick(category._id, category?.slug)}
          className="text-sm text-muted-foreground dark:text-muted-foreground hover:text-orange-400 font-medium leading-tight line-clamp-1  group-hover"
        >
          {showingTranslateValue(category?.name)}
        </h3>
        <ul className="pt-1 mt-1">
          {category?.children?.slice(0, 3).map((child) => (
            <li key={child._id} className="pt-1">
              <a
                onClick={() => handleCategoryClick(child._id, child?.slug)}
                className="flex hover:translate-x-2 transition-transform duration-300 items-center  text-xs text-muted-foreground cursor-pointer"
              >
                <span className="text-xs text-muted-foreground ">
                  <IoChevronForwardSharp />
                </span>
                {showingTranslateValue(child?.name)}
                {/* {console.log(
                  "showingTranslateValue(child?.name)",
                  showingTranslateValue(child?.name),
                  child?.name
                )} */}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default CategoryNavigateButton;
