"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiPhone } from "react-icons/fi";
import MainModal from "@components/modal/MainModal";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import {
  addAddressBookEntry,
  updateAddressBookEntry,
  deleteAddressBookEntry,
} from "@lib/actions/customer.actions";
import { notifyError, notifySuccess } from "@utils/toast";

const emptyForm = { title: "", street: "", city: "", country_id: "", phone: "" };

const AddressBookView = ({ addresses, countries, error }) => {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (address) => {
    setEditing(address);
    setForm({
      title: address.title || "",
      street: address.street || "",
      city: address.city || "",
      country_id: address.country?.id ? String(address.country.id) : "",
      phone: address.phone ? String(address.phone) : "",
    });
    setModalOpen(true);
  };

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title || !form.street || !form.city || !form.country_id || !form.phone) {
      notifyError("Please fill in all address fields.");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title,
      street: form.street,
      city: form.city,
      country_id: Number(form.country_id),
      phone: form.phone.replace(/\D/g, ""),
      country_code: "263",
    };
    const { error: err } = editing
      ? await updateAddressBookEntry(editing.id, payload)
      : await addAddressBookEntry(payload);
    setSaving(false);

    if (err) {
      notifyError(err);
      return;
    }
    notifySuccess(editing ? "Address updated" : "Address saved");
    setModalOpen(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const { error: err } = await deleteAddressBookEntry(deleteTarget.id);
    setDeleting(false);
    if (err) {
      notifyError(err);
      return;
    }
    notifySuccess("Address removed");
    setDeleteTarget(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">My Addresses</h2>
        <Button onClick={openAdd} variant="create">
          <FiPlus className="mr-1.5" /> Add New
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {error}
        </div>
      ) : addresses?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="font-semibold text-foreground">{address.title}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(address)}
                    className="text-muted-foreground hover:text-primary"
                    aria-label="Edit address"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(address)}
                    className="text-muted-foreground hover:text-red-500"
                    aria-label="Remove address"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="flex items-start gap-2 text-sm text-muted-foreground mb-1.5">
                <FiMapPin className="mt-0.5 shrink-0" />
                <span>
                  {address.street}, {address.city}
                  {address.country?.name ? `, ${address.country.name}` : ""}
                </span>
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <FiPhone className="shrink-0" />
                {address.country_code ? `+${address.country_code} ` : ""}
                {address.phone}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          No saved addresses yet — add one to speed up checkout.
        </div>
      )}

      <MainModal modalOpen={modalOpen} handleCloseModal={() => setModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">{editing ? "Edit Address" : "Add New Address"}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Address Label</label>
            <Input value={form.title} onChange={handleChange("title")} placeholder="Home, Office, etc." />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Street Address</label>
            <Input value={form.street} onChange={handleChange("street")} placeholder="123 Boulevard Rd" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">City</label>
              <Input value={form.city} onChange={handleChange("city")} placeholder="Harare" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Country</label>
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
            <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
            <Input value={form.phone} onChange={handleChange("phone")} placeholder="771234567" />
          </div>
          <Button type="submit" variant="create" disabled={saving} className="w-full h-11">
            {saving ? "Saving..." : "Save Address"}
          </Button>
        </form>
      </MainModal>

      <MainModal modalOpen={!!deleteTarget} handleCloseModal={() => setDeleteTarget(null)}>
        <h3 className="text-lg font-semibold mb-2">Remove Address</h3>
        <p className="text-sm text-muted-foreground mb-5">
          Are you sure you want to remove "{deleteTarget?.title}"? This can't be undone.
        </p>
        <div className="flex gap-3">
          <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
            {deleting ? "Removing..." : "Remove"}
          </Button>
          <Button onClick={() => setDeleteTarget(null)} variant="outline" disabled={deleting}>
            Cancel
          </Button>
        </div>
      </MainModal>
    </div>
  );
};

export default AddressBookView;
