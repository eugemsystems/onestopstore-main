import Image from "next/image";

//internal import
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";
import { getShowingCategory } from "@services/CategoryService";
import CategoryNavigateButton from "@components/category/CategoryNavigateButton";

const FeatureCategory = async () => {
  const { categories, error } = await getShowingCategory();

  return (
    <>
      {error ? (
        <CMSkeletonTwo count={10} height={20} error={error} loading={false} />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 gap-3">
          {categories[0]?.children?.map((category, i) => (
            <li className="group" key={i + 1}>
              <div className="flex w-full h-full rounded-xl border border-border bg-card p-4 cursor-pointer transition duration-200 ease-linear transform group-hover:shadow-md group-hover:border-primary/40">
                <div className="flex items-center">
                  <div>
                    {category.icon ? (
                      <Image
                        src={category?.icon}
                        alt="category"
                        width={35}
                        height={35}
                      />
                    ) : (
                      <Image
                        src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                        alt="category"
                        width={35}
                        height={35}
                      />
                    )}
                  </div>

                  <CategoryNavigateButton
                    category={{
                      ...category,
                      name: category.name,
                      description: category.description,
                    }}
                    // showingTranslateValue={showingTranslateValue}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default FeatureCategory;
