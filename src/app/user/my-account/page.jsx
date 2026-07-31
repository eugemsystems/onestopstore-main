import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

//internal imports

import { getUserServerSession } from "@lib/auth-server";
import { listAddressBook } from "@lib/actions/customer.actions";

// Force dynamic rendering - don't cache this page
export const dynamic = "force-dynamic";

const MyAccount = async () => {
  const userInfo = await getUserServerSession();
  // getShippingAddress(id) needs an id up front and returns null without
  // one — there's no "default address" concept there. The real address
  // book (same one checkout uses) is what actually has the saved addresses.
  const { addresses, error } = await listAddressBook();
  const defaultAddress = addresses?.[0] || null;

  const hasShippingAddress = !!defaultAddress;

  const address = defaultAddress
    ? {
        name: defaultAddress.title,
        contact: defaultAddress.phone
          ? `${defaultAddress.country_code ? `+${defaultAddress.country_code} ` : ""}${defaultAddress.phone}`
          : "",
        address: defaultAddress.street,
        country: defaultAddress.country?.name || "",
        city: defaultAddress.city || "",
        area: "",
        zipCode: defaultAddress.pincode || "",
      }
    : {};

  return (
    <div className="overflow-hidden">
      <div className="grid gap-4 mb-8 sm:grid-cols-2 grid-cols-1">
        {/* User Info Card */}
        <div className="flex h-full relative">
          <div className="flex items-center border border-border w-full rounded-xl p-5 relative bg-muted/30">
            <Link
              href="/user/update-profile"
              className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Edit
            </Link>
            <div className="flex items-center justify-center rounded-full text-xl text-center mr-4 bg-muted">
              {userInfo?.image &&
              (userInfo.image.startsWith("http://") ||
                userInfo.image.startsWith("https://")) ? (
                <img
                  src={userInfo.image}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-full bg-muted"
                  alt={userInfo?.name?.[0] || "U"}
                />
              ) : (
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-muted text-xl font-bold text-center mr-4">
                  {userInfo?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div>
              <h5 className="leading-none mb-2 text-base font-medium text-muted-foreground">
                {userInfo?.name}
              </h5>
              <p className="text-sm text-muted-foreground">{userInfo?.email}</p>
              <p className="text-sm text-muted-foreground">{userInfo?.phone}</p>
            </div>
          </div>
        </div>

        {/* Shipping Address Card */}
        {hasShippingAddress ? (
          <div className="flex h-full relative">
            <div className="flex items-center border border-border w-full rounded-xl p-5 relative bg-muted/30">
              <Link
                href={`/user/shipping-address/${defaultAddress?.id}`}
                className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Edit
              </Link>
              <div className="flex-grow">
                {error ? (
                  <h2 className="text-xl text-center my-10 mx-auto w-11/12 text-red-400">
                    {error}
                  </h2>
                ) : (
                  <>
                    <h5 className="leading-none mb-2 text-base font-medium text-muted-foreground">
                      {address?.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        (Default Shipping Address)
                      </span>
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {address?.contact}{" "}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address?.address}{" "}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address?.country}, {address?.city}, {address?.area} -
                      {address?.zipCode}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full relative">
            <Link
              href="/user/shipping-address"
              className="flex items-center bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg py-3 px-4 text-center relative transition-colors"
            >
              <Plus className="text-xl font-bold text-center mr-4" /> Add
              Default Shipping Address
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
