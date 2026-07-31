import { listAddressBook, listAddressCountries } from "@lib/actions/customer.actions";
import AddressBookView from "./AddressBookView";

export const metadata = {
  title: "My Addresses",
  description: "Manage your saved shipping and billing addresses.",
};

const ShippingAddressPage = async () => {
  const [{ addresses, error }, { countries }] = await Promise.all([
    listAddressBook(),
    listAddressCountries(),
  ]);

  return (
    <div className="overflow-hidden">
      <AddressBookView addresses={addresses} countries={countries} error={error} />
    </div>
  );
};

export default ShippingAddressPage;
