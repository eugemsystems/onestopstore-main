"use client";

import { useState } from "react";
import { FiShield, FiRefreshCw, FiInfo, FiX } from "react-icons/fi";

const InfoModal = ({ icon, title, children, onClose }) => (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4"
    role="presentation"
    onClick={onClose}
  >
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-background shadow-2xl"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{icon}</span>
          <h3 className="text-sm font-bold text-foreground">{title}</h3>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <FiX size={16} />
        </button>
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-5 text-sm leading-6 text-muted-foreground">
        {children}
      </div>
    </div>
  </div>
);

/**
 * Warranty + Return Policy cards for the product detail page — ports the
 * legacy frontend's clickable "warranty-card"/"return-card" pair (product
 * fields `warranty` and `return_policy_text`, detail-endpoint only) with a
 * fresh visual treatment for this storefront.
 */
const WarrantyReturnCards = ({ product }) => {
  const [openModal, setOpenModal] = useState(null); // "warranty" | "return" | null
  const warranty = product?.raines?.warranty;
  const returnPolicy = product?.raines?.returnPolicyText;

  if (!warranty && !returnPolicy) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {warranty && (
          <button
            type="button"
            onClick={() => setOpenModal("warranty")}
            className="group relative flex items-start gap-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-3.5 text-left shadow-md shadow-emerald-900/20 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <FiShield size={17} className="text-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white/80">
                Warranty
                <FiInfo size={10} />
              </span>
              <span className="block truncate text-xs font-semibold text-white">
                {warranty}
              </span>
            </span>
          </button>
        )}

        {returnPolicy && (
          <button
            type="button"
            onClick={() => setOpenModal("return")}
            className="group relative flex items-start gap-2.5 overflow-hidden rounded-xl bg-gradient-to-br from-sky-600 to-sky-800 p-3.5 text-left shadow-md shadow-sky-900/20 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <FiRefreshCw size={17} className="text-white" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-white/80">
                Return Policy
                <FiInfo size={10} />
              </span>
              <span className="block truncate text-xs font-semibold text-white">
                {returnPolicy}
              </span>
            </span>
          </button>
        )}
      </div>

      {openModal === "warranty" && (
        <InfoModal icon="🛡️" title="Warranty Information" onClose={() => setOpenModal(null)}>
          <div className="mb-3 rounded-lg bg-emerald-500/10 p-3.5">
            <div className="mb-1.5 font-semibold text-foreground">Product Warranty</div>
            <div>{warranty}</div>
          </div>
          <div className="rounded-lg bg-amber-500/10 p-3.5 text-xs">
            Limited warranty, with certain exclusions, as defined by the manufacturer. Please
            consult the manufacturer for further details.
          </div>
        </InfoModal>
      )}

      {openModal === "return" && (
        <InfoModal icon="↩️" title="Return Policy Details" onClose={() => setOpenModal(null)}>
          <div className="mb-3 rounded-lg bg-sky-500/10 p-3.5">
            <div className="mb-1.5 font-semibold text-foreground">Our Return Policy</div>
            <div>{returnPolicy}</div>
          </div>
          <p className="mb-3">
            <strong className="text-foreground">Returns:</strong> if you&apos;re not completely
            satisfied, simply return the item to us in its original condition and packaging
            within 7 days of receipt.
          </p>
          <div className="rounded-lg bg-amber-500/10 p-3.5 text-xs">
            <div className="mb-1.5 font-semibold text-foreground">
              When does this policy not apply?
            </div>
            <ul className="list-disc space-y-1 pl-4">
              <li>Older than 7 days</li>
              <li>Unsealed, used, or missing any accessories</li>
              <li>Digital products, eBooks, gaming codes</li>
            </ul>
          </div>
        </InfoModal>
      )}
    </>
  );
};

export default WarrantyReturnCards;
