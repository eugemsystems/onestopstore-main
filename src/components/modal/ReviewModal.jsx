import React, { useEffect, useState } from "react";
import { Star, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "@utils/toast";
import { addReview, updateReview } from "@services/ReviewServices";
import MainModal from "./MainModal";
import { Button } from "@components/ui/button";
import Uploader from "@components/image-uploader/Uploader";

const ReviewModal = ({ title, edit, isOpen, onClose, product }) => {
  const [hover, setHover] = useState(null);
  const [isLoading, setIsLoading] = useState();
  const [imageUrl, setImageUrl] = useState([]);
  const [rating, setRating] = useState(product?.review?.rating || 0);

  const {
    reset,
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // console.log("product", product, rating);

  const submitReview = async (data) => {
    if (rating <= 0) return notifyError("Minimum one rating is required!");
    try {
      setIsLoading(true);
      const updatedData = {
        ...data,
        rating,
        product: product._id,
        images: imageUrl,
      };
      if (edit) {
        updatedData.reviewId = product.review._id; // must be review _id
      }

      const res = edit
        ? await updateReview(updatedData)
        : await addReview(updatedData);
      // console.log("Review submitted:", res, "updatedData", updatedData);
      if (res.error) {
        setIsLoading(false);
        return notifyError(res.error);
      }
      notifySuccess("Review submitted successfully!");

      // Reset form and close modal
      reset();
      onClose();

      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      // console.error("Submit failed", err);
    }
  };

  useEffect(() => {
    setRating(product?.review?.rating || 0);
    setValue("comment", product?.review?.comment || "");
  }, [product]);

  // console.log("title", product.title);

  return (
    <MainModal
      modalOpen={isOpen}
      bottomCloseBtn={true}
      handleCloseModal={onClose}
    >
      <div className="flex items-center justify-center">
        <div className="relative bg-background rounded-lg w-full max-w-4xl z-50">
          <h1 className="text-base font-semibold mb-4">{`Review for ${title}`}</h1>
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => {
              const starValue = i + 1;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(starValue)}
                  onMouseEnter={() => setHover(starValue)}
                  onMouseLeave={() => setHover(null)}
                >
                  <Star
                    size={24}
                    fill={starValue <= (hover || rating) ? "#facc15" : "none"}
                    stroke={
                      starValue <= (hover || rating) ? "#facc15" : "#9ca3af"
                    }
                  />
                </button>
              );
            })}
          </div>

          <div>
            <div className="mt-1 flex items-center">
              <Uploader
                multiple
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
              />
            </div>
            {/* <ErrorTwo errors={state?.errors?.image} /> */}
          </div>

          <form onSubmit={handleSubmit(submitReview)}>
            <textarea
              {...register("comment", { required: false })}
              placeholder="Write your thoughts..."
              className="w-full border-1 focus:ring-0 placeholder:text-sm text-sm focus:outline-none ring-0 border-border rounded p-2 min-h-[80px]"
            />
            {errors.comment && (
              <p className="text-sm text-red-500 mt-1">Comment is required.</p>
            )}

            <Button
              type="submit"
              variant="create"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full mt-4"
              // className="mt-3 w-full bg-sky-500 hover:bg-sky-600 text-white py-2 rounded"
            >
              {isLoading ? "Processing..." : "Submit Review"}
            </Button>
          </form>
        </div>
      </div>
    </MainModal>
  );
};

export default ReviewModal;
