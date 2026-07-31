import Link from "next/link";
import React from "react";

const AddressCard = ({ address }) => {
  // console.log("address", address);
  return (
    <div className="flex h-full relative">
      <div className="flex items-center border border-border w-full rounded-xl p-5 relative bg-muted/30">
        <Link
          href={`/user/shipping-address/${address?._id}`}
          className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Edit
        </Link>
        <div className="flex-grow">
          <h5 className="leading-none mb-2 text-base font-medium text-muted-foreground">
            {address?.name}
          </h5>
          <p className="text-sm text-muted-foreground">{address?.phone} </p>
          <p className="text-sm text-muted-foreground">{address?.address} </p>
          <p className="text-sm text-muted-foreground">
            {address?.country}, {address?.city}, {address?.area}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
