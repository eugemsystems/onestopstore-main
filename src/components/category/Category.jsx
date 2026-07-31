"use client";

//internal import
import CategoryCard from "@components/category/CategoryCard";
import useUtilsFunction from "@hooks/useUtilsFunction";

const Category = ({ categories, categoryError, onClose }) => {
  const { showingTranslateValue } = useUtilsFunction();
  return (
    <div className="flex flex-col w-full h-full cursor-pointer scrollbar-hide">
      <div className="w-full max-h-full">
        {categoryError ? (
          <p className="flex justify-center align-middle items-center m-auto text-xl text-red-500">
            <span> {categoryError}</span>
          </p>
        ) : (
          <div className="relative py-2">
            {categories[0]?.children?.map((category) => (
              <CategoryCard
                key={category._id}
                id={category._id}
                icon={category.icon}
                onClose={onClose}
                nested={category.children}
                title={showingTranslateValue(category?.name)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
