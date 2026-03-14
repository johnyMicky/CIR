import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  Ban,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  Wallet,
} from "lucide-react";
import { db } from "../../firebase";

type TxStatus = "Pending" | "Completed" | "Failed" | "Rejected";
type TxType = "deposit" | "withdraw" | "transfer" | "receive" | "swap" | string;

type TransactionRow = {
  uid: string;
  txId: string;
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: TxType;
  asset: string;
  amount: number;
  usdValue: number;
  inputUsd?: number;
  inputCrypto?: number;
  inputMode?: string;
  status: TxStatus;
  label?: string;
  displayLabel?: string;
  note?: string;
  createdAt?: number;
  createdAtLabel?: string;
  createdByAdmin?: boolean;
  adminActionKind?: string;
  priceAtExecution?: number;
};

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const normalizeStatus = (status?: string): TxStatus => {
  const value = (status || "").toLowerCase();

  if (value === "completed") return "Completed";
  if (value === "failed") return "Failed";
  if (value === "rejected") return "Rejected";
  return "Pending";
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

const formatCoin = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 8 : 6,
  }).format(value);

const formatDate = (timestamp?: number, label?: string) => {
  if (timestamp && Number.isFinite(timestamp)) {
    return new Date(timestamp).toLocaleString();
  }
  return label || "-";
};

const getTypeLabel = (type: string) => {
  const value = (type || "").toLowerCase();

  if (value === "deposit") return "Deposit";
  if (value === "withdraw") return "Withdraw";
  if (value === "transfer") return "Transfer";
  if (value === "receive") return "Receive";
  if (value === "swap") return "Swap";

  return type || "Unknown";
};

const AdminWithdrawals = () => {
  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [assetFilter, setAssetFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const txRootRef = ref(db, "transactions");

    const unsub = onValue(txRootRef, (snapshot) => {
      if (!snapshot.exists()) {
        setRows([]);
        return;
      }

      const root = snapshot.val() || {};
      const allRows: TransactionRow[] = [];

      Object.entries(root).forEach(([uid, txMap]) => {
        const transactions = txMap as Record<string, any>;

        Object.entries(transactions || {}).forEach(([txId, txValue]) => {
          const tx = txValue || {};

          allRows.push({
            uid,
            txId,
            id: String(tx.id || txId),
            userId: String(tx.userId || uid),
            userName: String(tx.userName || "Unknown User"),
            userEmail: String(tx.userEmail || ""),
            type: String(tx.type || ""),
            asset: String(tx.asset || ""),
            amount: toNumber(tx.amount),
            usdValue: toNumber(tx.usdValue),
            inputUsd: toNumber(tx.inputUsd),
            inputCrypto: toNumber(tx.inputCrypto),
            inputMode: tx.inputMode || "",
            status: normalizeStatus(tx.status),
            label: tx.label || "",
            displayLabel: tx.displayLabel || "",
            note: tx.note || "",
            createdAt: toNumber(tx.createdAt),
            createdAtLabel: tx.createdAtLabel || "",
            createdByAdmin: !!tx.createdByAdmin,
            adminActionKind: tx.adminActionKind || "",
            priceAtExecution: toNumber(tx.priceAtExecution),
          });
        });
      });

      allRows.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setRows(allRows);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(timer);
  }, [toast]);

  const assets = useMemo(() => {
    return Array.from(new Set(rows.map((row) => row.asset).filter(Boolean))).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rows.filter((row) => {
      const haystack = [
        row.userName,
        row.userEmail,
        row.asset,
        row.type,
        row.status,
        row.label,
        row.displayLabel,
        row.note,
        row.id,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !q || haystack.includes(q);
      const matchesType =
        typeFilter === "All" || getTypeLabel(row.type).toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus =
        statusFilter === "All" || row.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesAsset = assetFilter === "All" || row.asset === assetFilter;

      return matchesSearch && matchesType && matchesStatus && matchesAsset;
    });
  }, [rows, search, typeFilter, statusFilter, assetFilter]);

  const stats = useMemo(() => {
    return {
      total: rows.length,
      pending: rows.filter((r) => r.status === "Pending").length,
      completed: rows.filter((r) => r.status === "Completed").length,
      failed: rows.filter((r) => r.status === "Failed").length,
      rejected: rows.filter((r) => r.status === "Rejected").length,
    };
  }, [rows]);

  const updateTransactionStatus = async (
    uid: string,
    txId: string,
    status: TxStatus
  ) => {
    try {
      setUpdatingId(`${uid}_${txId}`);

      await update(ref(db, `transactions/${uid}/${txId}`), {
        status,
        updatedAt: Date.now(),
      });

      setToast(`Transaction set to ${status}`);
    } catch (error) {
      console.error("Transaction status update error:", error);
      setToast("Failed to update transaction status");
    } finally {
      setUpdatingId("");
    }
  };

  const getStatusClass = (status: TxStatus) => {
    if (status === "Completed") {
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
    }
    if (status === "Pending") {
      return "bg-amber-500/15 text-amber-300 border-amber-500/20";
    }
    if (status === "Rejected") {
      return "bg-rose-500/15 text-rose-300 border-rose-500/20";
    }
    return "bg-orange-500/15 text-orange-300 border-orange-500/20";
  };

  const getTypeIcon = (type: string) => {
    const value = (type || "").toLowerCase();

    if (value === "deposit" || value === "receive") {
      return <ArrowDownLeft size={16} />;
    }
    if (value === "transfer") {
      return <Send size={16} />;
    }
    return <ArrowUpRight size={16} />;
  };

  return (
    <div className="space-y-6 text-white">
      {toast && (
        <div className="fixed right-4 top-4 z-[120] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-blue-300 font-bold mb-2">
            Admin Transactions
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Requests Management
          </h1>
          <p className="text-slate-400 mt-2">
            Review deposits, withdrawals, transfers and admin-created balance actions.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Total</div>
            <div className="text-2xl font-black">{stats.total}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Pending</div>
            <div className="text-2xl font-black text-amber-400">{stats.pending}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Completed</div>
            <div className="text-2xl font-black text-emerald-400">{stats.completed}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Failed</div>
            <div className="text-2xl font-black text-orange-400">{stats.failed}</div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4">
            <div className="text-xs text-slate-400 mb-1">Rejected</div>
            <div className="text-2xl font-black text-rose-400">{stats.rejected}</div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 md:p-5 space-y-4">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by user, email, asset, type, label, note..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-black/20 border border-white/10 pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid md:grid-cols-3 xl:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              <Filter size={14} />
              Type
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option value="All" className="bg-slate-900">All Types</option>
              <option value="Deposit" className="bg-slate-900">Deposit</option>
              <option value="Withdraw" className="bg-slate-900">Withdraw</option>
              <option value="Transfer" className="bg-slate-900">Transfer</option>
              <option value="Receive" className="bg-slate-900">Receive</option>
              <option value="Swap" className="bg-slate-900">Swap</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              Status
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option value="All" className="bg-slate-900">All</option>
              <option value="Pending" className="bg-slate-900">Pending</option>
              <option value="Completed" className="bg-slate-900">Completed</option>
              <option value="Failed" className="bg-slate-900">Failed</option>
              <option value="Rejected" className="bg-slate-900">Rejected</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-400 mb-2">
              Asset
            </div>
            <select
              value={assetFilter}
              onChange={(e) => setAssetFilter(e.target.value)}
              className="w-full bg-transparent text-sm text-white outline-none"
            >
              <option value="All" className="bg-slate-900">All Assets</option>
              {assets.map((asset) => (
                <option key={asset} value={asset} className="bg-slate-900">
                  {asset}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 flex items-end">
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("All");
                setStatusFilter("All");
                setAssetFilter("All");
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200 hover:bg-white/10"
            >
              <RefreshCw size={16} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-4 md:p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        {filteredRows.length === 0 ? (
          <div className="text-center py-14 text-slate-400">No transactions found.</div>
        ) : (
          <div className="space-y-4">
            {filteredRows.map((row) => {
              const busy = updatingId === `${row.uid}_${row.txId}`;
              const displayLabel = row.displayLabel || row.label || getTypeLabel(row.type);

              return (
                <div
                  key={`${row.uid}_${row.txId}`}
                  className="rounded-[24px] border border-white/8 bg-black/20 p-4 md:p-5"
                >
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                          {getTypeIcon(row.type)}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-white truncate">
                            {row.userName || "Unknown User"}
                          </div>
                          <div className="text-sm text-slate-400 truncate">
                            {row.userEmail || "No email"}
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 xl:grid-cols-6 gap-3 text-sm">
                        <div className="text-slate-400">
                          <span className="text-white/90">Type:</span> {getTypeLabel(row.type)}
                        </div>
                        <div className="text-slate-400">
                          <span className="text-white/90">Asset:</span> {row.asset || "-"}
                        </div>
                        <div className="text-slate-400">
                          <span className="text-white/90">Amount:</span> {formatCoin(row.amount)} {row.asset}
                        </div>
                        <div className="text-slate-400">
                          <span className="text-white/90">USD:</span> {formatMoney(row.usdValue)}
                        </div>
                        <div className="text-slate-400">
                          <span className="text-white/90">Label:</span> {displayLabel}
                        </div>
                        <div className="text-slate-400">
                          <span className="text-white/90">Date:</span> {formatDate(row.createdAt, row.createdAtLabel)}
                        </div>
                      </div>

                      <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                        <div className="text-slate-400">
                          <span className="text-white/90">Note:</span> {row.note || "-"}
                        </div>
                        <div className="text-slate-400">
                          <span className="text-white/90">TX ID:</span> {row.id || row.txId}
                        </div>
                      </div>

                      {row.createdByAdmin && (
                        <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-300">
                          <Wallet size={15} />
                          Admin-created balance action
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-start xl:items-end gap-3 shrink-0">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-2xl border text-sm ${getStatusClass(
                          row.status
                        )}`}
                      >
                        {row.status === "Completed" && <CheckCircle2 size={16} />}
                        {row.status === "Pending" && <Clock3 size={16} />}
                        {row.status === "Failed" && <XCircle size={16} />}
                        {row.status === "Rejected" && <Ban size={16} />}
                        <span>{row.status}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 xl:justify-end">
                        <button
                          onClick={() => updateTransactionStatus(row.uid, row.txId, "Pending")}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/15 disabled:opacity-50"
                        >
                          {busy ? <RefreshCw size={15} className="animate-spin" /> : <Clock3 size={15} />}
                          Pending
                        </button>

                        <button
                          onClick={() => updateTransactionStatus(row.uid, row.txId, "Completed")}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/15 disabled:opacity-50"
                        >
                          {busy ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                          Approve
                        </button>

                        <button
                          onClick={() => updateTransactionStatus(row.uid, row.txId, "Failed")}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/15 disabled:opacity-50"
                        >
                          {busy ? <RefreshCw size={15} className="animate-spin" /> : <XCircle size={15} />}
                          Fail
                        </button>

                        <button
                          onClick={() => updateTransactionStatus(row.uid, row.txId, "Rejected")}
                          disabled={busy}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/15 disabled:opacity-50"
                        >
                          {busy ? <RefreshCw size={15} className="animate-spin" /> : <Ban size={15} />}
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWithdrawals;
