"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FiMessageCircle, FiUser, FiClock } from "react-icons/fi";
import MainModal from "@components/modal/MainModal";
import { notifyError, notifySuccess } from "@utils/toast";
import {
  getProductQnAAction,
  submitProductQuestionAction,
} from "@lib/actions/qna.actions";

const timeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const AskQuestionModal = ({ open, onClose, productId, onSubmitted }) => {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!question.trim()) return notifyError("Please enter your question");
    setSubmitting(true);
    const { success, error } = await submitProductQuestionAction(productId, question.trim());
    setSubmitting(false);
    if (!success) return notifyError(error || "Failed to submit question");
    notifySuccess("Question submitted successfully!");
    setQuestion("");
    onSubmitted();
    onClose();
  };

  return (
    <MainModal modalOpen={open} handleCloseModal={onClose}>
      <h3 className="mb-4 text-base font-bold text-foreground">Ask a Question</h3>
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What would you like to know about this product?"
        rows={4}
        className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="mt-4 flex justify-end gap-3">
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
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit Question"}
        </button>
      </div>
    </MainModal>
  );
};

const QnACard = ({ qna }) => (
  <div className="mb-4 overflow-hidden rounded-xl border border-border">
    <div className="flex items-start gap-3 bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/25 text-xs font-bold text-white">
        Q
      </span>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-3 text-[11px] text-white/80">
          <span className="flex items-center gap-1">
            <FiUser size={11} /> {qna.user.name}
          </span>
          <span className="flex items-center gap-1">
            <FiClock size={11} /> {timeAgo(qna.createdAt)}
          </span>
        </div>
        <p className="text-sm font-medium text-white">{qna.question}</p>
      </div>
    </div>

    {qna.answer ? (
      <div className="bg-emerald-500/10">
        <div className="flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-emerald-700 px-4 py-1.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-[11px] font-bold text-white">
            A
          </span>
          <span className="text-[11px] text-white/90">Store Reply</span>
        </div>
        <div className="px-4 py-3 text-sm text-foreground">{qna.answer}</div>
      </div>
    ) : (
      <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-400">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
        Awaiting response
      </div>
    )}
  </div>
);

const ProductQnA = ({ product }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [qna, setQna] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { qna: list } = await getProductQnAAction(product.id);
    setQna(list || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const handleAskClick = () => {
    if (!session?.user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setModalOpen(true);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FiMessageCircle className="text-primary" size={18} />
          <div>
            <h3 className="text-sm font-bold text-foreground">Questions &amp; Answers</h3>
            {qna.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {qna.length} question{qna.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAskClick}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <FiMessageCircle size={13} />
          Ask a Question
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : qna.length > 0 ? (
        qna.map((item) => <QnACard key={item._id} qna={item} />)
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <FiMessageCircle size={40} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No questions yet — be the first to ask!
          </p>
        </div>
      )}

      <AskQuestionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        productId={product.id}
        onSubmitted={load}
      />
    </div>
  );
};

export default ProductQnA;
