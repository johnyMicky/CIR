import React, { useEffect, useMemo, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import {
  Users,
  CreditCard,
  Wallet,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Layers3
} from 'lucide-react';
import { db } from '../../firebase';

type UserMap = Record<string, any>;
type TxMap = Record<string, Record<string, any>>;

const StatCard = ({
  title,
  value,
  subtext,
  icon,
  tone = 'blue'
}: {
  title: string;
  value: string;
  subtext: string;
  icon: React.ReactNode;
  tone?: 'blue' | 'emerald' | 'amber' | 'cyan';
}) => {
  const toneMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
  };

  return (
    <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
      <div className="flex items-center justify-between mb-5">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/35 font-bold">
          {title}
        </div>
        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${toneMap[tone]}`}>
          {icon}
        </div>
      </div>

      <div className="text-3xl font-black tracking-tight text-white mb-2">{value}</div>
      <div className="text-sm text-slate-400">{subtext}</div>
    </div>
  );
};

const formatMoney = (n: number) => {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
};

const formatCoin = (n: number) => {
  return n.toLocaleString(undefined, { maximumFractionDigits: 6 });
};

const AdminDashboard = () => {
  const [usersMap, setUsersMap] = useState<UserMap>({});
  const [transactionsMap, setTransactionsMap] = useState<TxMap>({});
  const [notificationsMap, setNotificationsMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const txRef = ref(db, 'transactions');
    const notifRef = ref(db, 'notifications');

    let usersLoaded = false;
    let txLoaded = false;
    let notifLoaded = false;

    const tryFinish = () => {
      if (usersLoaded && txLoaded && notifLoaded) {
        setLoading(false);
      }
    };

    const unsubUsers = onValue(usersRef, (snap) => {
      setUsersMap(snap.exists() ? snap.val() : {});
      usersLoaded = true;
      tryFinish();
    });

    const unsubTx = onValue(txRef, (snap) => {
      setTransactionsMap(snap.exists() ? snap.val() : {});
      txLoaded = true;
      tryFinish();
    });

    const unsubNotif = onValue(notifRef, (snap) => {
      setNotificationsMap(snap.exists() ? snap.val() : {});
      notifLoaded = true;
      tryFinish();
    });

    return () => {
      unsubUsers();
      unsubTx();
      unsubNotif();
    };
  }, []);

  const usersArray = useMemo(() => {
    return Object.entries(usersMap).map(([id, value]) => ({
      id,
      ...(value as any)
    }));
  }, [usersMap]);

  const transactionsArray = useMemo(() => {
    const rows: any[] = [];

    Object.entries(transactionsMap || {}).forEach(([uid, userTxs]) => {
      Object.entries(userTxs || {}).forEach(([txId, tx]) => {
        rows.push({
          id: txId,
          uid,
          ...(tx as any)
        });
      });
    });

    rows.sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
    return rows;
  }, [transactionsMap]);

  const totalUsers = usersArray.length;

  const pendingWithdrawals = transactionsArray.filter(
    (tx) => tx.type === 'WITHDRAWAL' && tx.status === 'PENDING'
  ).length;

  const completedWithdrawals = transactionsArray.filter(
    (tx) => tx.type === 'WITHDRAWAL' && tx.status === 'COMPLETED'
  ).length;

  const totalNotifications = useMemo(() => {
    let count = 0;
    Object.values(notificationsMap || {}).forEach((bucket: any) => {
      count += Object.keys(bucket || {}).length;
    });
    return count;
  }, [notificationsMap]);

  const balances = useMemo(() => {
    return usersArray.reduce(
      (acc, user) => {
        acc.BTC += Number(user?.wallets?.BTC || 0);
        acc.ETH += Number(user?.wallets?.ETH || 0);
        acc.USDT += Number(user?.wallets?.USDT || 0);
        return acc;
      },
      { BTC: 0, ETH: 0, USDT: 0 }
    );
  }, [usersArray]);

  const balanceUsdEstimate = useMemo(() => {
    const estimatedBTC = balances.BTC * 80000;
    const estimatedETH = balances.ETH * 4000;
    const estimatedUSDT = balances.USDT;
    return estimatedBTC + estimatedETH + estimatedUSDT;
  }, [balances]);

  const recentActivity = useMemo(() => {
    return transactionsArray.slice(0, 8);
  }, [transactionsArray]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-blue-400">
        Loading admin reports...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-blue-300 font-bold mb-2">
          Admin Overview
        </div>
        <h1 className="text-4xl font-black tracking-tight">Axcel Control Panel</h1>
        <p className="text-slate-400 mt-2">
          Live reporting across users, wallets, withdrawals and activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={String(totalUsers)}
          subtext="Registered accounts in database"
          icon={<Users size={20} />}
          tone="blue"
        />
        <StatCard
          title="Pending Withdrawals"
          value={String(pendingWithdrawals)}
          subtext="Requests waiting for action"
          icon={<CreditCard size={20} />}
          tone="amber"
        />
        <StatCard
          title="Completed Withdrawals"
          value={String(completedWithdrawals)}
          subtext="Approved and completed payouts"
          icon={<ArrowUpRight size={20} />}
          tone="emerald"
        />
        <StatCard
          title="Notifications"
          value={String(totalNotifications)}
          subtext="Sent or queued user notifications"
          icon={<Bell size={20} />}
          tone="cyan"
        />
      </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <section className="xl:col-span-7 rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-white/35 font-bold mb-2">
                Portfolio Reports
              </div>
              <div className="text-2xl font-bold">Asset Summary</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers3 size={20} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold mb-2">
                BTC Total
              </div>
              <div className="text-2xl font-semibold text-orange-300">
                {formatCoin(balances.BTC)}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold mb-2">
                ETH Total
              </div>
              <div className="text-2xl font-semibold text-blue-300">
                {formatCoin(balances.ETH)}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/8 bg-black/20 p-5">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/35 font-bold mb-2">
                USDT Total
              </div>
              <div className="text-2xl font-semibold text-emerald-300">
                {formatCoin(balances.USDT)}
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-blue-500/15 bg-blue-500/[0.05] p-6">
            <div className="text-[10px] uppercase tracking-[0.22em] text-blue-300/80 font-bold mb-2">
              Estimated Wallet Exposure
            </div>
            <div className="text-4xl font-black tracking-tight text-white mb-2">
              {formatMoney(balanceUsdEstimate)}
            </div>
            <div className="text-sm text-slate-400">
              Estimated using static admin-side market assumptions for overview reporting.
            </div>
          </div>
        </section>

        <section className="xl:col-span-5 rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-white/35 font-bold mb-2">
                Quick Metrics
              </div>
              <div className="text-2xl font-bold">System Health</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Activity size={20} />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[22px] border border-white/8 bg-black/20 px-5 py-4 flex items-center justify-between">
              <span className="text-slate-400">Transactions Logged</span>
              <span className="font-semibold">{transactionsArray.length}</span>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-black/20 px-5 py-4 flex items-center justify-between">
              <span className="text-slate-400">Withdrawal Requests</span>
              <span className="font-semibold">
                {
                  transactionsArray.filter((tx) => tx.type === 'WITHDRAWAL').length
                }
              </span>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-black/20 px-5 py-4 flex items-center justify-between">
              <span className="text-slate-400">Swap Transactions</span>
              <span className="font-semibold">
                {transactionsArray.filter((tx) => tx.type === 'SWAP').length}
              </span>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-black/20 px-5 py-4 flex items-center justify-between">
              <span className="text-slate-400">Deposit / Bonus Entries</span>
              <span className="font-semibold">
                {
                  transactionsArray.filter(
                    (tx) =>
                      tx.type === 'DEPOSIT' ||
                      tx.type === 'BONUS' ||
                      tx.type === 'ADMIN_ADJUSTMENT'
                  ).length
                }
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] text-white/35 font-bold mb-2">
              Activity Feed
            </div>
            <div className="text-2xl font-bold">Recent Transactions</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ArrowDownRight size={20} />
          </div>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((tx) => (
              <div
                key={`${tx.uid}-${tx.id}`}
                className="rounded-[24px] border border-white/8 bg-black/20 p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-white">
                    {tx.type || 'Transaction'}
                  </div>
                  <div className="text-sm text-slate-400 truncate">
                    User: {tx.uid}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : 'No date'}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-semibold">
                    {tx.amount || 0} {tx.coin || tx.fromCoin || ''}
                  </div>
                  <div
                    className={`text-xs font-bold mt-1 ${
                      tx.status === 'PENDING'
                        ? 'text-amber-400'
                        : tx.status === 'COMPLETED'
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {tx.status || 'UNKNOWN'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[24px] border border-white/8 bg-black/20 p-10 text-center text-slate-400">
            No recent activity found.
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
