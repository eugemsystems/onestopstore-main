"use client";

import { useState } from "react";
import MainModal from "@components/modal/MainModal";
import { notifyError, notifySuccess } from "@utils/toast";
import { submitReturnRequestAction } from "@lib/actions/account-extras.actions";

// Same reason taxonomy as the legacy frontend's ReturnModal.
const REASONS = {
  "Product no longer wanted": [
    "Product arrived too late",
    "Found a better price",
    "Unwanted gift",
    "I purchased the wrong product or quantity",
    "Changed my mind",
  ],
  "Wrong product delivered": [
    "Wrong size or colour",
    "Completely wrong product",
    "Incorrect brand of product received",
  ],
  "Product delivered in a poor or damaged condition": [
    "Product is dirty/dusty",
    "Product and delivery box damaged",
    "Product damaged but delivery box undamaged",
    "Product appears used",
    "Product expired",
  ],
  "Missing parts or accessories": [],
  "Product is defective or does not work": [],
  "Description on website not accurate": [],
};

const ReturnRequestModal = ({ open, onClose, orderId, item, onSubmitted }) => {
  const [returnReason, setReturnReason] = useState("");
  const [subReason, setSubReason] = useState("");
  const [description, setDescription] = useState("");
  const [preferredOutcome, setPreferredOutcome] = useState("");
  const [notUsed, setNotUsed] = useState(false);
  const [inOriginal, setInOriginal] = useState(false);
  const [includeAll, setIncludeAll] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setReturnReason("");
    setSubReason("");
    setDescription("");
    setPreferredOutcome("");
    setNotUsed(false);
    setInOriginal(false);
    setIncludeAll(false);
    setErrors({});
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = () => {
    const e = {};
    if (!returnReason) e.returnReason = "Required";
    if (REASONS[returnReason]?.length > 0 && !subReason) e.subReason = "Required";
    if (!preferredOutcome) e.preferredOutcome = "Required";
    if (!description.trim()) e.description = "Required";
    if (!notUsed) e.notUsed = "Required";
    if (!inOriginal) e.inOriginal = "Required";
    if (!includeAll) e.includeAll = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const { data, error } = await submitReturnRequestAction({
      order_id: orderId,
      product_id: item?.productId,
      return_reason: returnReason,
      sub_reason: subReason || null,
      description,
      preferred_outcome: preferredOutcome,
      product_not_used: notUsed,
      in_original_packaging: inOriginal,
      include_all_accessories: includeAll,
    });
    setSubmitting(false);

    if (error) {
      notifyError(error);
      return;
    }
    notifySuccess("Your return request was submitted successfully.");
    onSubmitted?.(item?.productId);
    handleClose();
  };

  if (!open) return null;

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

  return (
    <MainModal modalOpen={open} handleCloseModal={handleClose}>
      <h3 className="text-lg font-bold text-foreground mb-4">Return Product</h3>
      <p className="text-sm font-medium text-muted-foreground mb-4">1 x {item?.title}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Return Reason *
          </label>
          <select
            value={returnReason}
            onChange={(e) => {
              setReturnReason(e.target.value);
              setSubReason("");
            }}
            className={inputClass}
          >
            <option value="">Select a reason</option>
            {Object.keys(REASONS).map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
          {errors.returnReason && (
            <p className="text-xs text-red-500 mt-1">{errors.returnReason}</p>
          )}
        </div>

        {REASONS[returnReason]?.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Detailed Reason *
            </label>
            <select
              value={subReason}
              onChange={(e) => setSubReason(e.target.value)}
              className={inputClass}
            >
              <option value="">Select a detailed reason</option>
              {REASONS[returnReason].map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            {errors.subReason && (
              <p className="text-xs text-red-500 mt-1">{errors.subReason}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Describe the problem *
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
          {errors.description && (
            <p className="text-xs text-red-500 mt-1">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Preferred Outcome *
          </label>
          <select
            value={preferredOutcome}
            onChange={(e) => setPreferredOutcome(e.target.value)}
            className={inputClass}
          >
            <option value=""></option>
            <option value="refund">Refund to original payment method</option>
            <option value="replacement">Replace item</option>
            <option value="credit">Credit my account wallet</option>
          </select>
          {errors.preferredOutcome && (
            <p className="text-xs text-red-500 mt-1">{errors.preferredOutcome}</p>
          )}
        </div>

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={notUsed}
            onChange={() => setNotUsed((v) => !v)}
            className="mt-0.5"
          />
          <span>* The product was not used</span>
        </label>
        {errors.notUsed && <p className="text-xs text-red-500 -mt-2">{errors.notUsed}</p>}

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={inOriginal}
            onChange={() => setInOriginal((v) => !v)}
            className="mt-0.5"
          />
          <span>* The product is in its original, undamaged condition with all tags attached</span>
        </label>
        {errors.inOriginal && <p className="text-xs text-red-500 -mt-2">{errors.inOriginal}</p>}

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={includeAll}
            onChange={() => setIncludeAll((v) => !v)}
            className="mt-0.5"
          />
          <span>* I will return the product in its original packaging and include all parts/accessories received</span>
        </label>
        {errors.includeAll && <p className="text-xs text-red-500 -mt-2">{errors.includeAll}</p>}

        <p className="text-xs text-muted-foreground">
          Please note: when we receive your product, we will inspect it. Only unused products in their original
          packaging will be accepted, else the product may be returned to you.
        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-lg bg-primary text-primary-foreground font-semibold py-2.5 text-sm disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Return Request"}
        </button>
      </div>
    </MainModal>
  );
};

export default ReturnRequestModal;
