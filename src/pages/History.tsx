import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Clock3,
  XCircle,
  Send,
} from "lucide-react";

import { auth, db } from "../firebase";

type ShellContext = {
  showBalance: boolean;
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
};

type TxStatus = "Pending" | "Completed" | "Failed" | "Rejected";
type TxType = "Receive" | "Withdraw" | "Transfer" | "Deposit" | "Swap";

type Transaction = {
  id: string;
  type: TxType;
  asset: string;
  amount: number;
  usdValue: number;
  status: TxStatus;
  date: string;
  network?: string;
  from?: string;
  to?: string;
  note?: string;
  createdAt?: number;
};

type FirebaseTransaction = {
  id?: string;
  type?: string;
  asset?: string;
  amount?: number | string;
  status?: string;
  createdAt?: number;
  createdAtLabel?: string;
  walletAddress?: string;
  recipient?: string;
  note?: string;
};

const transactionSeed: Transaction[] = [
  {
    id: "TX-20540",
    type: "Swap",
    asset: "BTC",
    amount: 0.0124,
    usdValue: 842.12,
    status: "Completed",
    date: "2026-03-14 18:42",
    network: "Internal",
    from: "BTC",
    to: "USDT",
    note: "Converted BTC to USDT",
  },
  {
    id: "TX-20531",
    type: "Withdraw",
    asset: "USDT",
    amount: 1200,
    usdValue: 1200,
    status: "Pending",
    date: "2026-03-14 17:08",
    network: "TRC20",
    to: "TR7NhqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    note: "Client withdrawal request",
  },
  {
    id: "TX-20519",
    type: "Receive",
    asset: "ETH",
    amount: 0.85,
    usdValue: 2864.55,
    status: "Completed",
    date: "2026-03-14 14:33",
    network: "ERC20",
    from: "0x9843bafA7614b0D122281B6C1a3B7A2b98AC1234",
    note: "Incoming deposit",
  },
];

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeType = (type?: string): TxType => {
  const value = (type || "").toLowerCase();

  if (value === "deposit") return "Deposit";
  if (value === "withdraw") return "Withdraw";
  if (value === "transfer") return "Transfer";
  if (value === "swap") return "Swap";
  if (value === "receive") return "Receive";

  return "Deposit";
};

const normalizeStatus = (status?: string): TxStatus => {
  const value = (status || "").toLowerCase();

  if (value === "completed") return "Completed";
  if (value === "failed") return "Failed";
  if (value === "rejected") return "Rejected";
  if (value === "pending") return "Pending";

  return "Pending";
};

const formatDateLabel = (timestamp?: number, fallback?: string) => {
  if (timestamp && Number.isFinite(timestamp)) {
    return new Date(timestamp).toLocaleString();
  }
  return fallback || "—";
};

const History = () => {
  const { showBalance, globalSearch } = useOutletContext<ShellContext>();

  const [toast, setToast] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | TxType>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | TxStatus>("All");
  const [copiedTxId, setCopiedTxId] = useState("");
  const [userId, setUserId] = useState("");
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [firebaseTransactions, setFirebaseTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUserId("");
        setFirebaseTransactions([]);
        setLoadingTransactions(false);
        return;
      }

      setUserId(firebaseUser.uid);
      setLoadingTransactions(true);

      const txRef = ref(db, `transactions/${firebaseUser.uid}`);
      const unsubscribeValue = onValue(
        txRef,
        (snapshot) => {
          const raw = snapshot.val() || {};
          const rows: Transaction[] = Object.entries(raw).map(([key, value]) => {
            const tx = (value || {}) as FirebaseTransaction;
            const amount = toNumber(tx.amount);
            const type = normalizeType(tx.type);
            const status = normalizeStatus(tx.status);

            return {
              id: String(tx.id || key),
              type,
              asset: String(tx.asset || ""),
              amount,
              usdValue: 0,
              status,
              date: formatDateLabel(tx.createdAt, tx.createdAtLabel),
              network:
                type === "Transfer"
                  ? "Internal"
                  : type === "Withdraw"
                  ? "External"
                  : type === "Deposit"
                  ? "Deposit"
                  : "Internal",
              from: type === "Deposit" ? "Client Request" : "",
              to: tx.recipient || tx.walletAddress || "",
              note: tx.note || "",
              createdAt: tx.createdAt || 0,
            };
          });

          rows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

          setFirebaseTransactions(rows);
          setLoadingTransactions(false);
        },
        (error) => {
          console.error("History transactions fetch error:", error);
          setFirebaseTransactions([]);
          setLoadingTransactions(false);
        }
      );

      return unsubscribeValue;
    });

    return () => unsubscribeAuth();
  }, []);

  const transactions = useMemo(() => {
    if (firebaseTransactions.length > 0) return firebaseTransactions;
    return transactionSeed;
  }, [firebaseTransactions]);

  const filteredTransactions = useMemo(() => {
    let rows = transactions;

    if (typeFilter !== "All") {
      rows = rows.filter((tx) => tx.type === typeFilter);
    }

    if (statusFilter !== "All") {
      rows = rows.filter((tx) => tx.status === statusFilter);
    }

    const q = globalSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (tx) =>
          tx.id.toLowerCase().includes(q) ||
          tx.asset.toLowerCase().includes(q) ||
          tx.type.toLowerCase().includes(q) ||
          tx.status.toLowerCase().includes(q) ||
          (tx.network || "").toLowerCase().includes(q) ||
          (tx.from || "").toLowerCase().includes(q) ||
          (tx.to || "").toLowerCase().includes(q) ||
          (tx.note || "").toLowerCase().includes(q)
      );
    }

    return rows;
  }, [transactions, typeFilter, statusFilter, globalSearch]);

  const stats = useMemo(() => {
    const completed = filteredTransactions.filter((tx) => tx.status === "Completed").length;
    const pending = filteredTransactions.filter((tx) => tx.status === "Pending").length;
    const failed = filteredTransactions.filter(
      (tx) => tx.status === "Failed" || tx.status === "Rejected"
    ).length;
    const totalValue = filteredTransactions.reduce((sum, tx) => sum + tx.usdValue, 0);

    return { completed, pending, failed, totalValue };
  }, [filteredTransactions]);

  const formatMoney = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: value >= 1000 ? 2 : 4,
    }).format(value);

  const formatCoinAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 4,
    }).format(value);

  const copyTxId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedTxId(id);
      setToast(`Copied ${id}`);
      setTimeout(() => setCopiedTxId(""), 1500);
    } catch {
      setToast("Copy failed");
    }
  };

  const handleExport = () => {
    const rows = [
      ["Type", "Asset", "Amount", "USD Value", "Status", "Date", "Network", "From", "To", "Note", "Transaction ID"],
      ...filteredTransactions.map((tx) => [
        tx.type,
        tx.asset,
        String(tx.amount),
        String(tx.usdValue),
        tx.status,
        tx.date,
        tx.network || "",
        tx.from || "",
        tx.to || "",
        tx.note || "",
        tx.id,
      ]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transaction-history.csv";
    link.click();
    URL.revokeObjectURL(url);

    setToast("History exported");
  };

  const getStatusClass = (status: TxStatus) => {
    if (status === "Completed") {
      return "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20";
    }
    if (status === "Pending") {
      return "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/20";
    }
    return "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20";
  };

  const getStatusIcon = (status: TxStatus) => {
    if (status === "Completed") return <CheckCircle2 className="h-4 w-4" />;
    if (status === "Pending") return <Clock3 className="h-4 w-4" />;
    return <XCircle className="h-4 w-4" />;
  };

  const getTypeIcon = (type: TxType) => {
    if (type === "Receive" || type === "Deposit") {
      return <ArrowDownLeft className="h-4 w-4 text-emerald-400" />;
    }
    if (type === "Transfer") {
      return <Send className="h-4 w-4 text-sky-400" />;
    }
    return <ArrowUpRight className="h-4 w-4 text-sky-400" />;
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
            Transaction Ledger
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Transactions History
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Review deposits, withdrawals, internal transfers and swap activity with
            status filters, export tools, and searchable transaction details.
          </p>
        </div>

        <button
          onClick={() => setToast("History data is up to date")}
          className="inline-flex h-12 items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-500/10 px-4 text-sm text-cyan-200 hover:bg-cyan-500/15"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Rows
          </div>
          <div className="mt-3 text-3xl font-semibold">{filteredTransactions.length}</div>
          <div className="mt-2 text-sm text-slate-400">
            Transactions matching current filters
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Completed
          </div>
          <div className="mt-3 text-3xl font-semibold text-emerald-300">{stats.completed}</div>
          <div className="mt-2 text-sm text-slate-400">Successfully processed</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Pending
          </div>
          <div className="mt-3 text-3xl font-semibold text-amber-300">{stats.pending}</div>
          <div className="mt-2 text-sm text-slate-400">Awaiting final action</div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
          <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Total Value
          </div>
          <div className="mt-3 text-3xl font-semibold tabular-nums">
            {showBalance ? formatMoney(stats.totalValue) : "••••••"}
          </div>
          <div className="mt-2 text-sm text-slate-400">
            {userId ? "Combined filtered volume" : "Using local fallback data"}
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
              Filters & Export
            </div>
            <div className="mt-1 text-lg font-semibold">Refine your transaction view</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as "All" | TxType)}
                className="h-12 min-w-[180px] rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-cyan-400/40"
              >
                <option value="All" className="bg-slate-900">All Types</option>
                <option value="Receive" className="bg-slate-900">Receive</option>
                <option value="Withdraw" className="bg-slate-900">Withdraw</option>
                <option value="Transfer" className="bg-slate-900">Transfer</option>
                <option value="Deposit" className="bg-slate-900">Deposit</option>
                <option value="Swap" className="bg-slate-900">Swap</option>
              </select>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "All" | TxStatus)}
                className="h-12 min-w-[180px] rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-cyan-400/40"
              >
                <option value="All" className="bg-slate-900">All Statuses</option>
                <option value="Completed" className="bg-slate-900">Completed</option>
                <option value="Pending" className="bg-slate-900">Pending</option>
                <option value="Failed" className="bg-slate-900">Failed</option>
                <option value="Rejected" className="bg-slate-900">Rejected</option>
              </select>
            </div>

            <button
              onClick={handleExport}
              className="inline-flex h-12 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-slate-200 hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 hidden rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:block">
        <div className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="grid grid-cols-[1.6fr_0.8fr_1fr_1fr_1fr_1.2fr] gap-4 px-4 py-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
              <div>Transaction</div>
              <div>Asset</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Date</div>
              <div>Details</div>
            </div>

            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="grid grid-cols-[1.6fr_0.8fr_1fr_1fr_1fr_1.2fr] gap-4 rounded-3xl bg-white/5 px-4 py-4 ring-1 ring-white/8 transition hover:bg-white/[0.07]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                      {getTypeIcon(tx.type)}
                    </div>

                    <div className="min-w-0">
                      <div className="font-medium">{tx.type}</div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                        <span>{tx.id}</span>
                        <button
                          onClick={() => copyTxId(tx.id)}
                          className="rounded-lg p-1 hover:bg-white/10"
                          title="Copy transaction ID"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {copiedTxId === tx.id && <span className="text-cyan-300">Copied</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="rounded-full bg-white/8 px-3 py-1 text-sm font-medium">
                      {tx.asset}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <div>
                      <div className="font-medium tabular-nums">
                        {formatCoinAmount(tx.amount)} {tx.asset}
                      </div>
                      <div className="text-sm tabular-nums text-slate-400">
                        {showBalance ? formatMoney(tx.usdValue) : "••••••"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${getStatusClass(
                        tx.status
                      )}`}
                    >
                      {getStatusIcon(tx.status)}
                      {tx.status}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-slate-300">
                    {tx.date}
                  </div>

                  <div className="flex items-center">
                    <div className="text-sm text-slate-400">
                      <div>{tx.network || "—"}</div>
                      <div className="mt-1 truncate">{tx.note || "No note"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!loadingTransactions && filteredTransactions.length === 0 && (
              <div className="rounded-3xl bg-white/5 px-4 py-8 text-center text-sm text-slate-400 ring-1 ring-white/8">
                No transactions found for current filters.
              </div>
            )}

            {loadingTransactions && (
              <div className="rounded-3xl bg-white/5 px-4 py-8 text-center text-sm text-slate-400 ring-1 ring-white/8">
                Loading transactions...
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-4 lg:hidden">
        {filteredTransactions.map((tx) => (
          <div
            key={tx.id}
            className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/8">
                  {getTypeIcon(tx.type)}
                </div>
                <div>
                  <div className="font-medium">{tx.type}</div>
                  <div className="mt-1 text-sm text-slate-400">{tx.id}</div>
                </div>
              </div>

              <button
                onClick={() => copyTxId(tx.id)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Asset
                </div>
                <div className="mt-2 text-sm font-semibold">{tx.asset}</div>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Status
                </div>
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${getStatusClass(
                      tx.status
                    )}`}
                  >
                    {getStatusIcon(tx.status)}
                    {tx.status}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Amount
                </div>
                <div className="mt-2 text-sm font-semibold tabular-nums">
                  {formatCoinAmount(tx.amount)} {tx.asset}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-3 ring-1 ring-white/8">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  Value
                </div>
                <div className="mt-2 text-sm font-semibold tabular-nums">
                  {showBalance ? formatMoney(tx.usdValue) : "••••••"}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
              <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Details</div>
              <div className="mt-2 space-y-1 text-sm text-slate-300">
                <div>Date: {tx.date}</div>
                <div>Network: {tx.network || "—"}</div>
                {tx.from && <div>From: {tx.from}</div>}
                {tx.to && <div>To: {tx.to}</div>}
                {tx.note && <div>Note: {tx.note}</div>}
              </div>
            </div>
          </div>
        ))}

        {!loadingTransactions && filteredTransactions.length === 0 && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400 backdrop-blur-xl">
            No transactions found for current filters.
          </div>
        )}

        {loadingTransactions && (
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center text-sm text-slate-400 backdrop-blur-xl">
            Loading transactions...
          </div>
        )}
      </section>
    </div>
  );
};

export default History;
