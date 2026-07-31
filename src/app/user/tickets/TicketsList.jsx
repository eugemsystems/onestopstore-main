"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FiPlus, FiMessageSquare } from "react-icons/fi";
import MainModal from "@components/modal/MainModal";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { createTicketAction } from "@lib/actions/account-extras.actions";
import { notifyError, notifySuccess } from "@utils/toast";

const statusBadge = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "open") return "bg-blue-50 text-blue-600";
  if (s === "in_progress") return "bg-indigo-50 text-indigo-600";
  if (["waiting_customer", "waiting_admin"].includes(s)) return "bg-amber-50 text-amber-600";
  if (s === "resolved") return "bg-emerald-50 text-emerald-600";
  return "bg-muted text-muted-foreground";
};

const priorityBadge = (priority) => {
  const p = String(priority || "").toLowerCase();
  if (p === "low") return "bg-emerald-50 text-emerald-600";
  if (p === "medium") return "bg-blue-50 text-blue-600";
  if (p === "high") return "bg-amber-50 text-amber-600";
  if (p === "urgent") return "bg-red-50 text-red-600";
  return "bg-muted text-muted-foreground";
};

const TicketsList = ({ data, error }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showDateFormat } = useUtilsFunction();
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
  });

  const tickets = data?.tickets?.data || [];

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page);
    router.push(`/user/tickets?${params.toString()}`);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.description) {
      notifyError("Please fill in subject and description");
      return;
    }
    setSaving(true);
    const { error: err } = await createTicketAction(form);
    setSaving(false);
    if (err) {
      notifyError(err);
      return;
    }
    notifySuccess("Ticket created successfully");
    setModalOpen(false);
    setForm({ subject: "", category: "general", priority: "medium", description: "" });
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold">Support Tickets</h2>
        <Button onClick={() => setModalOpen(true)} variant="create">
          <FiPlus className="mr-1.5" /> New Ticket
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          {error}
        </div>
      ) : tickets.length > 0 ? (
        <div className="space-y-3">
          {tickets.map((t) => (
            <Link
              key={t.id}
              href={`/user/tickets/${t.id}`}
              className="block rounded-xl border border-border bg-card p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    #{t.ticket_number || t.id} • {showDateFormat(t.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${priorityBadge(t.priority)}`}>
                    {t.priority}
                  </span>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge(t.status)}`}>
                    {String(t.status).replace("_", " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-muted-foreground">
          <FiMessageSquare className="mx-auto mb-3 text-2xl" />
          No support tickets yet. Create one if you need help.
        </div>
      )}

      {data?.tickets?.last_page > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.tickets.last_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goToPage(p)}
              className={`h-8 w-8 rounded-lg text-sm font-medium ${
                p === data.tickets.current_page
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <MainModal modalOpen={modalOpen} handleCloseModal={() => setModalOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">Create Support Ticket</h3>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Subject</label>
            <Input
              value={form.subject}
              onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Brief description of your issue"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing & Payment</option>
                <option value="account">Account Management</option>
                <option value="order">Order Related</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Description</label>
            <textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Please provide detailed information about your issue..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button type="submit" variant="create" disabled={saving} className="w-full h-11">
            {saving ? "Creating..." : "Create Ticket"}
          </Button>
        </form>
      </MainModal>
    </div>
  );
};

export default TicketsList;
