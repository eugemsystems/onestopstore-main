"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCurrency } from "@context/CurrencyContext";

const WA_API_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/whatsapp-agents`;

const WhatsAppIcon = ({ size = 20, color = "#fff" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill={color} viewBox="0 0 16 16">
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

function AgentAvatar({ agent, size = 52 }) {
  const initial = (agent.name || "?").charAt(0).toUpperCase();
  if (agent.profile_picture_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={agent.profile_picture_url}
        alt={agent.name}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "2px solid #25D366",
          flexShrink: 0,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #25D366, #128C7E)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.4,
        flexShrink: 0,
        border: "2px solid #25D366",
      }}
    >
      {initial}
    </div>
  );
}

function AvailabilityBadge({ isAvailable }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        fontWeight: 600,
        padding: "2px 8px",
        borderRadius: 12,
        background: isAvailable ? "#dcfce7" : "#f1f5f9",
        color: isAvailable ? "#15803d" : "#64748b",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: isAvailable ? "#22c55e" : "#94a3b8",
          display: "inline-block",
          animation: isAvailable ? "waPulse 1.8s ease-in-out infinite" : "none",
        }}
      />
      {isAvailable ? "Available" : "Offline"}
    </span>
  );
}

function AgentCard({ agent, prefilledMessage }) {
  const waNumber = (agent.whatsapp_number || "").replace(/\D/g, "");
  const defaultGreeting = `Hi ${agent.name}! `;
  const message = prefilledMessage
    ? `${defaultGreeting}${prefilledMessage}`
    : `${defaultGreeting}I would like to chat with you.`;
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  const handleChat = () => {
    if (waNumber) window.open(waLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        background: "#fff",
        border: "1px solid #e8f5e9",
        transition: "box-shadow 0.2s, transform 0.2s",
      }}
    >
      <AgentAvatar agent={agent} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#111",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {agent.name}
        </div>
        {(agent.job_title || (agent.branch && agent.branch !== "None")) && (
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
            {[agent.branch && agent.branch !== "None" ? agent.branch : null, agent.job_title]
              .filter(Boolean)
              .join(" ")}
          </div>
        )}
        <AvailabilityBadge isAvailable={agent.is_available_now} />
      </div>
      <button
        onClick={handleChat}
        aria-label={`Chat with ${agent.name} on WhatsApp`}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "7px 14px",
          background: "linear-gradient(135deg, #25D366, #128C7E)",
          color: "#fff",
          border: "none",
          borderRadius: 20,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 13,
          whiteSpace: "nowrap",
        }}
      >
        <WhatsAppIcon size={15} />
        Chat
      </button>
    </div>
  );
}

// Currency → country branch mapping (mirrors the legacy widget)
const CURRENCY_BRANCHES = {
  USD: ["Harare", "Mutare", "Bulawayo"],
  ZMW: ["Zambia"],
  ZAR: ["South Africa", "SA", "Johannesburg", "Cape Town", "Durban"],
};

export default function WhatsappChatWidget() {
  const { selectedCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [prefilledMessage, setPrefilledMessage] = useState("");
  const panelRef = useRef(null);

  const currencyCode = selectedCurrency?.code || "USD";

  useEffect(() => {
    if (!open || fetched) return;
    setLoading(true);
    fetch(WA_API_URL)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setAgents(data.agents || []);
          setBranches(data.branches || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
        setFetched(true);
      });
  }, [open, fetched]);

  useEffect(() => {
    if (!open) return;
    let tid;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    tid = setTimeout(() => {
      document.addEventListener("click", handler);
    }, 0);
    return () => {
      clearTimeout(tid);
      document.removeEventListener("click", handler);
    };
  }, [open]);

  const filteredAgents = (() => {
    if (selectedBranch) {
      return agents.filter((a) => a.branch === selectedBranch);
    }
    const allowedBranches = CURRENCY_BRANCHES[currencyCode];
    if (allowedBranches?.length > 0) {
      const matched = agents.filter(
        (a) => a.branch && allowedBranches.some((b) => a.branch.toLowerCase().includes(b.toLowerCase())),
      );
      if (matched.length > 0) return matched;
    }
    return agents;
  })();

  const sortedAgents = [...filteredAgents].sort(
    (a, b) => (b.is_available_now ? 1 : 0) - (a.is_available_now ? 1 : 0),
  );
  const availableCount = filteredAgents.filter((a) => a.is_available_now).length;

  return (
    <>
      <style>{`
        @keyframes waPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.3); } }
        @keyframes waSlideUp { from { opacity:0; transform:translateY(20px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes waFabPulse { 0%,100% { box-shadow:0 0 0 0 rgba(37,211,102,0.5); } 70% { box-shadow:0 0 0 12px rgba(37,211,102,0); } }
        @keyframes waSpin { to { transform: rotate(360deg); } }
        .wa-fab-btn:hover { transform:scale(1.08) !important; }
        @media (max-width: 767px) { .wa-widget-root { bottom: 82px !important; } }
      `}</style>

      <div
        ref={panelRef}
        className="wa-widget-root"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 100001,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 12,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {open && (
          <div
            style={{
              width: "min(360px, calc(100vw - 32px))",
              background: "#fff",
              borderRadius: 18,
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
              overflow: "hidden",
              animation: "waSlideUp 0.25s ease-out both",
              border: "1px solid rgba(37,211,102,0.15)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                padding: "16px 18px 14px",
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16 }}>
                  <WhatsAppIcon size={22} />
                  Chat with us
                </div>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ✕
                </button>
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>
                {availableCount > 0
                  ? `${availableCount} agent${availableCount > 1 ? "s" : ""} available now`
                  : "Our team will reply soon"}
              </div>
            </div>

            {branches.length > 1 && (
              <div style={{ padding: "8px 14px 0", background: "#f8fffe", display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedBranch("")}
                  style={{
                    padding: "4px 12px",
                    borderRadius: 20,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    background: !selectedBranch ? "#25D366" : "#e8f5e9",
                    color: !selectedBranch ? "#fff" : "#128C7E",
                  }}
                >
                  All
                </button>
                {branches.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBranch(b)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 20,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                      background: selectedBranch === b ? "#25D366" : "#e8f5e9",
                      color: selectedBranch === b ? "#fff" : "#128C7E",
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
            )}

            <div style={{ maxHeight: 340, overflowY: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
              {loading ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 14 }}>
                  <div
                    style={{
                      display: "inline-block",
                      width: 24,
                      height: 24,
                      border: "3px solid #25D366",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "waSpin 0.7s linear infinite",
                    }}
                  />
                  <div style={{ marginTop: 8 }}>Loading agents…</div>
                </div>
              ) : sortedAgents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0", color: "#94a3b8", fontSize: 14 }}>
                  No agents available {selectedBranch ? `in ${selectedBranch}` : ""}.
                </div>
              ) : (
                sortedAgents.map((agent) => (
                  <AgentCard key={agent.id} agent={agent} prefilledMessage={prefilledMessage} />
                ))
              )}
            </div>

            <div style={{ padding: "8px 14px 12px", textAlign: "center", fontSize: 11, color: "#94a3b8", borderTop: "1px solid #f0f0f0" }}>
              Powered by WhatsApp &nbsp;•&nbsp; Your chats are private
            </div>
          </div>
        )}

        <button
          id="wa-chat-fab"
          className="wa-fab-btn"
          onClick={() => {
            const stored = sessionStorage.getItem("wa_prefill") || "";
            if (stored) {
              setPrefilledMessage(stored);
              sessionStorage.removeItem("wa_prefill");
            }
            setOpen((v) => !v);
          }}
          aria-label="Open WhatsApp Chat"
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #25D366, #128C7E)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 20px rgba(37,211,102,0.45)",
            animation: !open ? "waFabPulse 2.4s ease-out infinite" : "none",
            transition: "transform 0.2s, box-shadow 0.2s",
            position: "relative",
          }}
        >
          {!open && availableCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 20,
                height: 20,
                background: "#ef4444",
                borderRadius: "50%",
                color: "#fff",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #fff",
              }}
            >
              {availableCount > 9 ? "9+" : availableCount}
            </span>
          )}
          {open ? (
            <span style={{ color: "#fff", fontSize: 22, lineHeight: 1 }}>✕</span>
          ) : (
            <WhatsAppIcon size={28} />
          )}
        </button>
      </div>
    </>
  );
}
