import { FiList } from "react-icons/fi";

/**
 * "Product Info" tab — renders the raw specifications HTML table Laravel
 * returns on the detail endpoint (`product.raines.specifications`).
 */
const ProductInfoTab = ({ product }) => {
  const specifications = product?.raines?.specifications;

  if (!specifications) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <FiList size={40} className="text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          No product information available.
        </p>
      </div>
    );
  }

  return (
    <div
      className="max-w-full overflow-x-auto text-sm text-muted-foreground [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-foreground [&_tr:nth-child(even)]:bg-muted/30"
      dangerouslySetInnerHTML={{ __html: specifications }}
    />
  );
};

export default ProductInfoTab;
