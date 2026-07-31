import { getCompareProductsAction } from "@lib/actions/wishlist-compare.actions";
import CompareTable from "@components/compare/CompareTable";
import { FiRepeat } from "react-icons/fi";

export const metadata = { title: "Compare Products" };

const ComparePage = async () => {
  const { products, error } = await getCompareProductsAction();

  return (
    <div className="mx-auto max-w-screen-2xl px-3 py-10 sm:px-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Compare Products</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          See your saved products side by side.
        </p>
      </div>

      {error === "Unauthorized" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-20 text-center">
          <FiRepeat size={40} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Please log in to view your compare list.
          </p>
        </div>
      ) : (
        <CompareTable products={products} />
      )}
    </div>
  );
};

export default ComparePage;
