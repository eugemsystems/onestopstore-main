"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FiArrowLeft, FiSend } from "react-icons/fi";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { Button } from "@components/ui/button";
import {
  addTicketMessageAction,
  closeTicketAction,
  reopenTicketAction,
} from "@lib/actions/account-extras.actions";
import { notifyError, notifySuccess } from "@utils/toast";

const TicketDetailView = ({ ticket, error }) => {
  const router = useRouter();
  const params = useParams();
  const { showDateTimeFormat } = useUtilsFunction();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (error || !ticket) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
        {error || "Ticket not found"}
        <div className="mt-4">
          <Link href="/user/tickets" className="text-primary font-semibold text-sm">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const isClosed = ["closed", "resolved"].includes(ticket.status);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    const { error: err } = await addTicketMessageAction(params.id, message);
    setSending(false);
    if (err) {
      notifyError(err);
      return;
    }
    setMessage("");
    router.refresh();
  };

  const handleClose = async () => {
    const { error: err } = await closeTicketAction(params.id);
    if (err) return notifyError(err);
    notifySuccess("Ticket closed");
    router.refresh();
  };

  const handleReopen = async () => {
    const { error: err } = await reopenTicketAction(params.id);
    if (err) return notifyError(err);
    notifySuccess("Ticket reopened");
    router.refresh();
  };

  return (
    <div>
      <Link
        href="/user/tickets"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary mb-4"
      >
        <FiArrowLeft /> Back to Tickets
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 mb-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-lg text-foreground">{ticket.subject}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              #{ticket.ticket_number || ticket.id} • {showDateTimeFormat(ticket.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-muted capitalize">
              {ticket.priority}
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
              {String(ticket.status).replace("_", " ")}
            </span>
            {isClosed ? (
              <Button onClick={handleReopen} variant="outline" className="h-8 text-xs px-3">
                Reopen
              </Button>
            ) : (
              <Button onClick={handleClose} variant="outline" className="h-8 text-xs px-3">
                Close Ticket
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div className="rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-sm whitespace-pre-wrap text-foreground">{ticket.description}</p>
        </div>
        {(ticket.messages || []).map((m, i) => (
          <div
            key={i}
            className={`rounded-xl border p-4 ${
              m.is_admin || m.from_admin
                ? "bg-primary/5 border-primary/20 mr-8"
                : "bg-card border-border ml-8"
            }`}
          >
            <p className="text-xs font-semibold text-muted-foreground mb-1">
              {m.is_admin || m.from_admin ? "Support Team" : "You"} •{" "}
              {showDateTimeFormat(m.created_at)}
            </p>
            <p className="text-sm whitespace-pre-wrap text-foreground">{m.message}</p>
          </div>
        ))}
      </div>

      {!isClosed && (
        <form onSubmit={handleSend} className="flex gap-3">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <Button type="submit" variant="create" disabled={sending} className="self-end">
            <FiSend className="mr-1.5" /> {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      )}
    </div>
  );
};

export default TicketDetailView;
