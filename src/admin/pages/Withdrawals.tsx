import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../../firebase";

type Withdrawal = {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  asset: string;
  status: string;
  walletAddress?: string;
  note?: string;
  createdAt?: number;
  createdAtLabel?: string;
};

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    const withdrawalsRef = ref(db, "withdraw_requests");

    const unsubscribe = onValue(withdrawalsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setWithdrawals([]);
        return;
      }

      const list: Withdrawal[] = Object.keys(data).map((key) => ({
        id: key,
        ...data[key],
      }));

      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setWithdrawals(list);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdate = async (id: string, status: "approved" | "rejected") => {
    try {
      await update(ref(db, `withdraw_requests/${id}`), {
        status,
      });
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const getStatusColor = (status?: string) => {
    const normalized = String(status || "pending").toLowerCase();

    if (normalized === "approved") return "text-green-400";
    if (normalized === "rejected") return "text-red-400";
    return "text-yellow-400";
  };

  const formatDate = (item: Withdrawal) => {
    if (item.createdAtLabel) return item.createdAtLabel;

    if (item.createdAt) {
      try {
        return new Date(item.createdAt).toLocaleString();
      } catch {
        return "Unknown time";
      }
    }

    return "Unknown time";
  };

  const getUserDisplay = (item: Withdrawal) => {
    return item.userName || item.userEmail || item.userId || "Unknown user";
  };

  return (
    <div className="text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Withdraw Requests</h1>

      {withdrawals.length === 0 ? (
        <div className="text-slate-400">No withdrawal requests found.</div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((item) => (
            <div
              key={item.id}
              className="border border-white/10 bg-white/5 rounded-xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {item.amount} {item.asset}
                </div>

                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">User:</span>{" "}
                  {getUserDisplay(item)}
                </div>

                {item.userEmail && (
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">Email:</span>{" "}
                    {item.userEmail}
                  </div>
                )}

                {item.userId && (
                  <div className="text-sm text-slate-300 break-all">
                    <span className="text-slate-400">User ID:</span>{" "}
                    {item.userId}
                  </div>
                )}

                {item.walletAddress && (
                  <div className="text-sm text-slate-300 break-all">
                    <span className="text-slate-400">Wallet:</span>{" "}
                    {item.walletAddress}
                  </div>
                )}

                {item.note && (
                  <div className="text-sm text-slate-300">
                    <span className="text-slate-400">Note:</span>{" "}
                    {item.note}
                  </div>
                )}

                <div className="text-sm text-slate-300">
                  <span className="text-slate-400">Time:</span>{" "}
                  {formatDate(item)}
                </div>

                <div className="text-sm mt-1">
                  <span className="text-slate-400">Status:</span>{" "}
                  <span className={`font-semibold ${getStatusColor(item.status)}`}>
                    {item.status || "pending"}
                  </span>
                </div>
              </div>

              {String(item.status || "pending").toLowerCase() === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdate(item.id, "approved")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-semibold"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleUpdate(item.id, "rejected")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Withdrawals;
