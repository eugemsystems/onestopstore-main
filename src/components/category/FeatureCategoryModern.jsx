import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";
import { getShowingCategory } from "@services/CategoryService";
import FeatureCategorySlider from "./FeatureCategorySlider";

const FeatureCategoryModern = async () => {
  const { categories, error } = await getShowingCategory();

  const backgroundColors = [
    "from-[#eef2ff]", // blue
    "from-[#e0f2fe]", // sky
    "from-[#f3e8ff]", // purple
    "from-[#ffe4e6]", // rose
    "from-[#dcfce7]", // green
    "from-[#fef9c3]", // yellow
    "from-[#fce7f3]", // pink
    "from-[#ffedd5]", // orange
  ];

  return (
    <>
      {error ? (
        <CMSkeletonTwo count={6} height={180} error={error} loading={false} />
      ) : (
        <FeatureCategorySlider 
          categories={categories[0]?.children} 
          backgroundColors={backgroundColors} 
        />
      )}
    </>
  );
};

export default FeatureCategoryModern;
