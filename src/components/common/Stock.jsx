import { Badge } from "@components/ui/badge";

const Stock = ({ stock, card }) => {
  return (
    <>
     {stock <= 0 ? (
        <span className="text-red-700 inline-flex items-center justify-center text-xs">
          Stock out
        </span>
      ) : (
        <>
          <span
            className={`${
              card
                ? "text-xs text-muted-foreground"
                : "inline-flex items-center justify-center text-xs text-muted-foreground"
            }`}
          >
            In stock:
            <span className="text-green-600 pl-1 font-normal">{stock} </span>
          </span>
        </>
      )}
    </>
  );
};

export default Stock;
