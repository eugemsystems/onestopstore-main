"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiCheck, FiUploadCloud, FiShield, FiCalendar } from "react-icons/fi";
import MainModal from "@components/modal/MainModal";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { notifyError, notifySuccess } from "@utils/toast";
import {
  applyForLaybyAction,
  submitLaybyDocumentAction,
} from "@lib/actions/layby.actions";

/**
 * Two-step layby application flow — ports the legacy LaybyModal.jsx onto
 * this app's Tailwind modal shell (MainModal) instead of reactstrap.
 * Step 1: pick a duration, agree to terms, submit the application.
 * Step 2: upload an ID document to complete it.
 */
const LaybyApplyModal = ({
  open,
  onClose,
  product,
  matchedVariant,
  eligibilityData,
  currentPrice,
}) => {
  const router = useRouter();
  const { formatPrice } = useUtilsFunction();

  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [duplicateApp, setDuplicateApp] = useState(null);

  const [docType, setDocType] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const durations = eligibilityData?.available_durations || [];

  useEffect(() => {
    if (open) {
      setStep(1);
      setAgreed(false);
      setSubmitting(false);
      setApplicationId(null);
      setDuplicateApp(null);
      setDuration(durations[0] ?? null);
      setDocType("");
      setDocNumber("");
      setFile(null);
      setFilePreview(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  }, [open]);

  if (!open) return null;

  const calcFor = (dur) => {
    if (!eligibilityData || !dur) return null;
    const deposit = currentPrice * (eligibilityData.deposit_percentage / 100);
    const monthly = (currentPrice - deposit) / dur;
    return {
      deposit,
      monthly,
      total: deposit + monthly * dur,
    };
  };
  const calc = calcFor(duration);

  const handleSubmitApplication = async () => {
    if (!agreed) return notifyError("Please accept the layby terms first");
    if (!duration) return notifyError("Please select a payment duration");

    setSubmitting(true);
    const attrIds = (matchedVariant?.attributeValueIds || []).slice();
    const { data, error, existingApplication } = await applyForLaybyAction({
      productId: product.id,
      durationMonths: duration,
      variationId: matchedVariant?.id || null,
      selectedAttributeIds: attrIds,
      variationDisplayName: matchedVariant?.name || null,
    });
    setSubmitting(false);

    if (existingApplication) {
      setDuplicateApp(existingApplication);
      return;
    }
    if (error) {
      return notifyError(error || "Failed to submit application");
    }
    if (data?.success) {
      setApplicationId(data.application?.id);
      setStep(2);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) return notifyError("File must be under 20 MB");
    if (!["image/jpeg", "image/jpg", "image/png", "application/pdf"].includes(f.type)) {
      return notifyError("Only JPG, PNG or PDF allowed");
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(null);
    }
  };

  const handleSaveDocument = async () => {
    if (!file || !docType || !docNumber) {
      return notifyError("Please fill in document type, number, and file");
    }
    setSaving(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("applicationId", applicationId);
    formData.append("docType", docType);
    formData.append("docNumber", docNumber);

    const { error } = await submitLaybyDocumentAction(formData);
    setSaving(false);
    if (error) return notifyError(error);

    notifySuccess("Layby application complete! We'll review and notify you.");
    onClose();
    router.push("/user/laybys");
  };

  const handleSkipToAccount = () => {
    onClose();
    router.push("/user/laybys");
  };

  return (
    <MainModal modalOpen={open} handleCloseModal={onClose}>
      <div className="w-full min-w-0">
        <div className="mb-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-primary">
            {step === 1 ? "Layby Application" : "ID Verification"}
          </div>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            {step === 1 ? "Buy now, pay in instalments" : "Upload your ID document"}
          </h2>
        </div>

        {/* Step indicator */}
        <div className="mb-6 flex items-center gap-2">
          {[
            { n: 1, label: "Details" },
            { n: 2, label: "Document" },
          ].map(({ n, label }, idx) => (
            <div key={n} className="flex items-center gap-2">
              {idx > 0 && (
                <div className={`h-0.5 w-8 ${step > 1 ? "bg-primary" : "bg-border"}`} />
              )}
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  step > n
                    ? "bg-green-500 text-white"
                    : step === n
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step > n ? <FiCheck size={12} /> : n}
              </div>
              <span
                className={`text-xs font-semibold ${step === n ? "text-primary" : "text-muted-foreground"}`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {step === 1 ? (
          <>
            {duplicateApp && (
              <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
                <div className="mb-1 text-sm font-bold text-red-700 dark:text-red-400">
                  You already have an active application
                </div>
                <p className="mb-3 text-xs text-red-600 dark:text-red-300">
                  Status: <strong>{duplicateApp.status}</strong>
                  {duplicateApp.reference_number ? ` — ref ${duplicateApp.reference_number}` : ""}.
                  You can&apos;t submit another until it&apos;s resolved.
                </p>
                <a
                  href={`/user/laybys/${duplicateApp.id}`}
                  className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                  View my application →
                </a>
              </div>
            )}

            <div className="mb-5 flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              {product?.image?.[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.image[0]}
                  alt={product.title?.en}
                  className="h-16 w-16 shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-foreground">
                  {product?.title?.en}
                </div>
                {matchedVariant && (
                  <div className="text-xs font-medium text-primary">{matchedVariant.name}</div>
                )}
                <div className="text-lg font-extrabold text-foreground">
                  {formatPrice(currentPrice)}
                </div>
              </div>
            </div>

            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Payment duration
            </div>
            <div className="mb-5 space-y-2">
              {durations.map((dur) => {
                const c = calcFor(dur);
                const selected = duration === dur;
                if (!c) return null;
                return (
                  <button
                    type="button"
                    key={dur}
                    onClick={() => setDuration(dur)}
                    className={`flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                          selected ? "border-primary bg-primary" : "border-muted-foreground"
                        }`}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      <div>
                        <div className="text-sm font-bold text-foreground">{dur} months</div>
                        <div className="text-xs text-muted-foreground">
                          {formatPrice(c.deposit)} deposit
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-sm font-extrabold ${selected ? "text-primary" : "text-foreground"}`}
                      >
                        {formatPrice(c.monthly)}
                      </div>
                      <div className="text-[10px] text-muted-foreground">/month</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {calc && (
              <div className="mb-5 rounded-xl bg-foreground p-4 text-background">
                <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-background/50">
                  Payment breakdown
                </div>
                <div className="flex items-center justify-between border-b border-background/10 py-1.5 text-xs">
                  <span className="text-background/70">
                    Deposit ({eligibilityData.deposit_percentage}%)
                  </span>
                  <span className="font-bold">{formatPrice(calc.deposit)}</span>
                </div>
                <div className="flex items-center justify-between border-b border-background/10 py-1.5 text-xs">
                  <span className="text-background/70">Monthly × {duration}</span>
                  <span className="font-bold">{formatPrice(calc.monthly)}</span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold">Total</span>
                  <span className="text-lg font-extrabold text-green-400">
                    {formatPrice(calc.total)}
                  </span>
                </div>
              </div>
            )}

            <label className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
              />
              <span className="text-xs text-muted-foreground">
                I agree that layby is available for products over the eligibility threshold,
                requires a deposit, has no interest, and that the product remains store property
                until fully paid.
              </span>
            </label>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitApplication}
                disabled={!agreed || !duration || submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiCalendar size={15} />
                {submitting ? "Submitting…" : "Save & continue"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-green-600 p-4 text-white">
              <FiCheck size={20} className="mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-bold">Application saved!</div>
                <div className="text-xs opacity-90">
                  Upload your ID document to complete the process, or skip and do it later from
                  My Laybys.
                </div>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  ID type
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select…</option>
                  <option value="passport">Passport</option>
                  <option value="id_card">National ID Card</option>
                  <option value="drivers_license">Driver&apos;s License</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                  Document number
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  placeholder="Enter number"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            <label className="mb-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-6 text-center">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <FiUploadCloud size={28} className="text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {file ? file.name : "Click to upload or drag & drop"}
              </span>
              <span className="text-xs text-muted-foreground">JPG, PNG or PDF · Max 20 MB</span>
              {filePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={filePreview}
                  alt="Preview"
                  className="mt-2 max-h-24 rounded-lg border border-border object-contain"
                />
              )}
            </label>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkipToAccount}
                disabled={saving}
                className="text-xs font-medium text-muted-foreground underline"
              >
                Upload later →
              </button>
              <button
                type="button"
                onClick={handleSaveDocument}
                disabled={saving || !file || !docType || !docNumber}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiShield size={15} />
                {saving ? "Saving…" : "Complete application"}
              </button>
            </div>
          </>
        )}
      </div>
    </MainModal>
  );
};

export default LaybyApplyModal;
