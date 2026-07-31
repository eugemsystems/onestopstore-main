import { getUserPurchasedProducts } from "@lib/actions/review.actions";
import MyReviewsScreen from "./MyReviews";

const MyReviews = async ({ searchParams }) => {
  const { page } = await searchParams;

  const { reviews, error } = await getUserPurchasedProducts({
    page: Number(page || 1),
    limit: 30,
  });

  // console.log("reviews", reviews, "error", error);

  return (
    <div className="overflow-hidden">
      <MyReviewsScreen error={error} reviews={reviews} />
    </div>
  );
};

export default MyReviews;
