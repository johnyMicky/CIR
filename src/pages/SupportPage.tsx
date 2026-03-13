import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  LifeBuoy,
  Send,
  MessageSquare,
  Clock3,
  CheckCircle2,
  AlertCircle,
  Search,
  RefreshCw,
  Copy,
} from "lucide-react";

type ShellContext = {
  showBalance: boolean;
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
};

type TicketStatus = "Open" | "Pending" | "Closed";
type TicketPriority = "Low" | "Medium" | "High";
type TicketCategory =
  | "General"
  | "Deposit"
  | "Withdrawal"
  | "Transfer"
  | "Swap"
  | "Security"
  | "Account";

type Ticket = {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  message: string;
};

const seedTickets: Ticket[] = [
  {
    id: "SUP-10041",
    subject: "Withdrawal pending longer than expected",
    category: "Withdrawal",
    priority: "High",
    status: "Pending",
    createdAt: "2026-03-14 16:20",
    updatedAt: "2026-03-14 17:05",
    message: "My USDT withdrawal is still pending. Please check the processing status.",
  },
  {
    id: "SUP-10038",
    subject: "Need clarification about wallet address assignment",
    category: "Deposit",
    priority: "Medium",
    status: "Open",
    createdAt: "2026-03-14 13:12",
    updatedAt: "2026-03-14 13:12",
    message: "BTC deposit address still shows generating wallet address. Need confirmation.",
  },
  {
    id: "SUP-10029",
    subject: "Internal transfer confirmation",
    category: "Transfer",
    priority: "Low",
    status: "Closed",
    createdAt: "2026-03-13 18:44",
    updatedAt: "2026-03-13 20:01",
    message: "Wanted to confirm if the internal transfer was successfully delivered.",
  },
  {
    id: "SUP-10021",
    subject: "Swap preview question",
    category: "Swap",
    priority: "Medium",
    status: "Closed",
    createdAt: "2026-03-13 09:18",
    updatedAt: "2026-03-13 10:03",
    message: "Need clarification regarding estimated receive and fee preview before conversion.",
  },
];

const SupportPage = () => {
  const { globalSearch } = useOutletContext<ShellContext>();

  const [toast, setToast] = useState("");
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);

  const [category, setCategory] = useState<TicketCategory>("General");
  const [priority, setPriority] = useState<TicketPriority>("Medium");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const filteredTickets = useMemo(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return tickets;

    return tickets.filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(q) ||
        ticket.subject.toLowerCase().includes(q) ||
        ticket.category.toLowerCase().includes(q) ||
        ticket.priority.toLowerCase().includes(q) ||
        ticket.status.toLowerCase().includes(q) ||
        ticket.message.toLowerCase().includes(q)
    );
  }, [tickets, globalSearch]);

  const stats = useMemo(() => {
    const open = tickets.filter((t) => t.status === "Open").length;
    const pending = tickets.filter((t) => t.status === "Pending").length;
    const closed = tickets.filter((t) => t.status === "Closed").length;
    return { open, pending, closed };
  }, [tickets]);

  const submitTicket = () => {
    if (!subject.trim()) {
      setToast("Enter ticket subject");
      return;
    }

    if (!message.trim()) {
      setToast("Enter ticket message");
      return;
    }

    const now = new Date();
    const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate()
    ).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const newTicket: Ticket = {
      id: `SUP-${10050 + tickets.length}`,
      subject: subject.trim(),
      category,
      priority,
      status: "Open",
      createdAt: stamp,
      updatedAt: stamp,
      message: message.trim(),
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSubject("");
    setMessage("");
    setCategory("General");
    setPriority("Medium");
    setToast("Support ticket submitted");
  };

  const copyTicketId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setToast(`${id} copied`);
    } catch {
      setToast("Copy failed");
    }
  };

  const getStatusClass = (status: TicketStatus) => {
    if (status === "Open") {
      return "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/20";
    }
    if (status === "Pending") {
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20";
    }
    return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20";
  };

  const getPriorityClass = (priority: TicketPriority) => {
    if (priority === "High") {
      return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20";
    }
    if (priority === "Medium") {
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20";
    }
    return "bg-white/10 text-slate-300 ring-1 ring-white/10";
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed right-4 top-24 z-[100] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="text-sm uppercase tracking-[0.18em] text-cyan-300/80">
            Client Support
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Support / Help
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Open a support ticket, track response progress, and review recent help
            requests from one place.
          </p>
        </div>

        <button
          onClick={() => setToast("Support data is up to date")}
          className="inline-flex h-12 items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-4 text-sm text-cyan-200 hover:bg-cyan-500/15"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Open Tickets
          </div>
          <div className="mt-3 text-3xl font-semibold text-cyan-200">{stats.open}</div>
          <div className="mt-2 text-sm text-slate-400">Awaiting first response</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Pending
          </div>
          <div className="mt-3 text-3xl font-semibold text-amber-300">{stats.pending}</div>
          <div className="mt-2 text-sm text-slate-400">Currently under review</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Closed
          </div>
          <div className="mt-3 text-3xl font-semibold text-emerald-300">{stats.closed}</div>
          <div className="mt-2 text-sm text-slate-400">Resolved requests</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Tickets
          </div>
          <div className="mt-3 text-3xl font-semibold">{tickets.length}</div>
          <div className="mt-2 text-sm text-slate-400">All support conversations</div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        {/* LEFT: TICKET LIST */}
        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                Recent Support Tickets
              </div>
              <div className="mt-1 text-lg font-semibold">Latest help requests</div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <Search className="h-4 w-4" />
              Using global search
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-[26px] border border-white/10 bg-white/5 p-5 ring-1 ring-white/5 transition hover:bg-white/[0.07]"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold">{ticket.subject}</div>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                      <span>{ticket.id}</span>
                      <button
                        onClick={() => copyTicketId(ticket.id)}
                        className="rounded-lg p-1 hover:bg-white/10"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <span>•</span>
                      <span>{ticket.category}</span>
                      <span>•</span>
                      <span>Created: {ticket.createdAt}</span>
                    </div>

                    <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                      <div className="text-sm leading-6 text-slate-300">{ticket.message}</div>
                    </div>
                  </div>

                  <div className="w-full lg:w-[220px]">
                    <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                      <div className="text-xs uppercase tracking-[0.14em] text-slate-500">
                        Last Update
                      </div>
                      <div className="mt-2 text-sm text-slate-300">{ticket.updatedAt}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredTickets.length === 0 && (
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400">
                No support tickets found for the current search.
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: NEW TICKET */}
        <aside className="space-y-6">
          <section className="rounded-[28px] border border-cyan-300/10 bg-[linear-gradient(135deg,rgba(59,130,246,0.16),rgba(34,211,238,0.10),rgba(139,92,246,0.14))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <LifeBuoy className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-200/80">
                  New Ticket
                </div>
                <div className="mt-1 text-lg font-semibold">Contact support</div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                >
                  <option value="General" className="bg-slate-900">General</option>
                  <option value="Deposit" className="bg-slate-900">Deposit</option>
                  <option value="Withdrawal" className="bg-slate-900">Withdrawal</option>
                  <option value="Transfer" className="bg-slate-900">Transfer</option>
                  <option value="Swap" className="bg-slate-900">Swap</option>
                  <option value="Security" className="bg-slate-900">Security</option>
                  <option value="Account" className="bg-slate-900">Account</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                >
                  <option value="Low" className="bg-slate-900">Low</option>
                  <option value="Medium" className="bg-slate-900">Medium</option>
                  <option value="High" className="bg-slate-900">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter ticket subject"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue or request"
                  rows={6}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                />
              </div>

              <button
                onClick={submitTicket}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,211,238,0.18)] hover:opacity-95"
              >
                <Send className="h-4 w-4" />
                Submit Ticket
              </button>
            </div>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6">
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Support Status Guide
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-cyan-500/10 p-4 ring-1 ring-cyan-400/15">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-cyan-300" />
                  <div>
                    <div className="text-sm font-medium text-cyan-200">Open</div>
                    <div className="text-sm text-cyan-100/80">Ticket created and waiting for review.</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-amber-500/10 p-4 ring-1 ring-amber-400/15">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-amber-300" />
                  <div>
                    <div className="text-sm font-medium text-amber-200">Pending</div>
                    <div className="text-sm text-amber-100/80">Support team is processing your request.</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/15">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  <div>
                    <div className="text-sm font-medium text-emerald-200">Closed</div>
                    <div className="text-sm text-emerald-100/80">Issue resolved or ticket completed.</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-4 w-4 text-slate-300" />
                  <div>
                    <div className="text-sm font-medium text-white">Tip</div>
                    <div className="text-sm text-slate-400">
                      Include asset, amount, ticket context, and transaction ID when relevant.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default SupportPage;
