import { getWishlistProductsAction } from "@lib/actions/wishlist-compare.actions";
import ProductCard from "@components/product/ProductCard";
import { FiHeart } from "react-icons/fi";

export const metadata = { title: "My Wishlist" };

const WishlistPage = async () => {
  const { products, error } = await getWishlistProductsAction();

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-10 sm:px-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">My Wishlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Products you've saved for later.
        </p>
      </div>

      {error === "Unauthorized" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <FiHeart size={40} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Please log in to view your wishlist.
          </p>
        </div>
      ) : products?.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <FiHeart size={40} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Your wishlist is empty — tap the heart icon on any product to save it here.
          </p>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
