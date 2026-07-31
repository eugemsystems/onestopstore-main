"use client";

import { useState } from "react";
import { FiMapPin, FiPhone, FiPlus } from "react-icons/fi";

import MainModal from "@components/modal/MainModal";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { addAddressBookEntry } from "@lib/actions/customer.actions";
import { notifyError, notifySuccess } from "@utils/toast";

/**
 * Billing/shipping address picker for checkout.
 * Mirrors the legacy Checkout/DeliveryAddress.jsx + ShowAddress.jsx +
 * AddAddressForm.jsx: lists every saved address as a selectable card and
 * lets the user add a new one from a modal, restyled for the current theme.
 */
const AddressSelector = ({
  type, // "billing" | "shipping"
  title,
  addresses,
  countries,
  selectedId,
  onSelect,
  onAddressCreated,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    street: "",
    city: "",
    country_id: "",
    phone: "",
  });

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.street || !form.city || !form.country_id || !form.phone) {
      notifyError("Please fill in all address fields.");
      return;
    }
    setSaving(true);
    const { address, error } = await addAddressBookEntry({
      title: form.title,
      street: form.street,
      city: form.city,
      country_id: Number(form.country_id),
      phone: form.phone.replace(/\D/g, ""),
      country_code: "263",
    });
    setSaving(false);

    if (error || !address) {
      notifyError(error || "Could not save address");
      return;
    }

    notifySuccess("Address saved");
    onAddressCreated(address);
    onSelect(address.id);
    setModalOpen(false);
    setForm({ title: "", street: "", city: "", country_id: "", phone: "" });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-foreground">{title} Address</h4>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          <FiPlus /> Add New
        </button>
      </div>

      {addresses?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <label
                key={item.id}
                htmlFor={`address-${type}-${item.id}`}
                className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    id={`address-${type}-${item.id}`}
                    name={`${type}_address_id`}
                    checked={isSelected}
                    onChange={() => onSelect(item.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm">
                      {item.title}
                    </p>
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <FiMapPin className="mt-0.5 shrink-0" />
                      <span>
                        {item.street}, {item.city}
                        {item.country?.name ? `, ${item.country.name}` : ""}
                      </span>
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <FiPhone className="shrink-0" />
                      {item.country_code ? `+${item.country_code} ` : ""}
                      {item.phone}
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          No saved addresses yet — add one to continue.
        </div>
      )}

      <MainModal modalOpen={modalOpen} handleCloseModal={() => setModalOpen(false)}>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Add {title} Address
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Address Label
            </label>
            <Input
              value={form.title}
              onChange={handleChange("title")}
              placeholder="Home, Office, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Street Address
            </label>
            <Input
              value={form.street}
              onChange={handleChange("street")}
              placeholder="123 Boulevard Rd"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                City
              </label>
              <Input value={form.city} onChange={handleChange("city")} placeholder="Harare" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">
                Country
              </label>
              <select
                value={form.country_id}
                onChange={handleChange("country_id")}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">Select country</option>
                {countries?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">
              Phone Number
            </label>
            <Input value={form.phone} onChange={handleChange("phone")} placeholder="771234567" />
          </div>
          <Button type="submit" variant="create" disabled={saving} className="w-full h-11">
            {saving ? "Saving..." : "Save Address"}
          </Button>
        </form>
      </MainModal>
    </div>
  );
};

export default AddressSelector;
