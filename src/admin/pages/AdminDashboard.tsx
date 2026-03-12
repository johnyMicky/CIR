import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { Users, Wallet, Activity, ShieldCheck } from 'lucide-react';
import { db } from '../../firebase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    withdrawals: 0,
    notifications: 0,
    totalBalances: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const usersSnap = await get(ref(db, 'users'));
        const withdrawalsSnap = await get(ref(db, 'transactions'));
        const notificationsSnap = await get(ref(db, 'notifications'));

        let usersCount = 0;
        let withdrawalsCount = 0;
        let notificationsCount = 0;
        let totalBalances = 0;

        if (usersSnap.exists()) {
          const usersData = usersSnap.val();
          usersCount = Object.keys(usersData).length;

          Object.values(usersData).forEach((u: any) => {
            totalBalances += Number(u?.balance || 0);
          });
        }

        if (withdrawalsSnap.exists()) {
          const txRoot = withdrawalsSnap.val();
          Object.values(txRoot).forEach((userTxs: any) => {
            if (userTxs) {
              Object.values(userTxs).forEach((tx: any) => {
                if (tx?.type === 'WITHDRAWAL') {
                  withdrawalsCount += 1;
                }
              });
            }
          });
        }

        if (notificationsSnap.exists()) {
          const notifRoot = notificationsSnap.val();
          Object.values(notifRoot).forEach((userNotifs: any) => {
            if (userNotifs) {
              notificationsCount += Object.keys(userNotifs).length;
            }
          });
        }

        setStats({
          users: usersCount,
          withdrawals: withdrawalsCount,
          notifications: notificationsCount,
          totalBalances
        });
      } catch (error) {
        console.error('Admin stats error:', error);
      }
    };

    loadStats();
  }, []);

  const cards = [
    {
      title: 'Registered Users',
      value: stats.users,
      icon: <Users size={20} className="text-blue-400" />
    },
    {
      title: 'Withdrawals',
      value: stats.withdrawals,
      icon: <Wallet size={20} className="text-emerald-400" />
    },
    {
      title: 'Notifications',
      value: stats.notifications,
      icon: <Activity size={20} className="text-cyan-400" />
    },
    {
      title: 'Total Balances',
      value: `$${stats.totalBalances.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      icon: <ShieldCheck size={20} className="text-violet-400" />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/35 font-bold mb-2">
          Admin Dashboard
        </div>
        <h1 className="text-3xl font-black tracking-tight">Control Center</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6"
          >
            <div className="flex items-center justify-between mb-4">
              {card.icon}
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/30 font-bold">
                Live
              </div>
            </div>
            <div className="text-sm text-slate-400 mb-2">{card.title}</div>
            <div className="text-3xl font-black tracking-tight">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
        <div className="text-lg font-semibold mb-2">Admin Panel Restored</div>
        <div className="text-slate-400">
          ახლა უკვე შეგვიძლია შემდეგ ეტაპზე users page და withdrawals page რეალური მონაცემებით დავამუშაოთ.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
