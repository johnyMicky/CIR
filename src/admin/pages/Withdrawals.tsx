import React, { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { db } from "../../firebase";

type Withdrawal = {
  id: string;
  userId: string;
  amount: number;
  asset: string;
  status: string;
  createdAt?: number;
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

      setWithdrawals(list.reverse());
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
              className="border border-white/10 bg-white/5 rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <div className="text-lg font-semibold">
                  {item.amount} {item.asset}
                </div>
                <div className="text-sm text-slate-400">
                  User: {item.userId}
                </div>
                <div className="text-sm mt-1">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      item.status === "approved"
                        ? "text-green-400"
                        : item.status === "rejected"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {item.status || "pending"}
                  </span>
                </div>
              </div>

              {item.status === "pending" && (
                <div className="flex gap-2">
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
