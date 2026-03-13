import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  Bitcoin,
  Coins,
  Wallet,
  Landmark,
  Copy,
  CheckCircle2,
  Wifi,
  WifiOff
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth() as any;

  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const userRef = ref(db, `users/${user.id}`);

    onValue(userRef, (snap) => {
      if (snap.exists()) {
        setData(snap.val());
      }
    });
  }, [user]);

  const copy = async (value: string, key: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);

    setTimeout(() => {
      setCopied("");
    }, 1500);
  };

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-8">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-10">

          <div>
            <div className="text-sm text-blue-400 uppercase tracking-widest mb-2">
              Secure Client Dashboard
            </div>

            <h1 className="text-4xl font-bold">
              Welcome, {data.name} {data.lastName}
            </h1>
          </div>

          <div className="flex items-center gap-4">

            {data.online ? (
              <div className="flex items-center gap-2 text-green-400">
                <Wifi size={16}/>
                Online
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-400">
                <WifiOff size={16}/>
                Offline
              </div>
            )}

            <button
              onClick={logout}
              className="bg-blue-600 hover:bg-blue-500 px-5 py-2 rounded-xl"
            >
              Logout
            </button>

          </div>

        </div>
                <div className="grid md:grid-cols-4 gap-5 mb-10">

          <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-yellow-400">
              <Bitcoin size={20}/>
              BTC Balance
            </div>

            <div className="text-2xl font-bold">
              {Number(data.btc_balance || 0).toFixed(8)}
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-gray-300">
              <Coins size={20}/>
              ETH Balance
            </div>

            <div className="text-2xl font-bold">
              {Number(data.eth_balance || 0).toFixed(8)}
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-green-400">
              <Wallet size={20}/>
              USDT Balance
            </div>

            <div className="text-2xl font-bold">
              {Number(data.usdt_balance || 0).toFixed(2)}
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <Landmark size={20}/>
              USD Balance
            </div>

            <div className="text-2xl font-bold">
              ${Number(data.usd_balance || 0).toLocaleString()}
            </div>
          </div>

        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-10">

          <div className="bg-black/30 border border-white/10 rounded-2xl p-6">

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-400">
                BTC Address
              </div>

              {data.btc_address && (
                <button
                  onClick={() => copy(data.btc_address, "btc")}
                  className="text-blue-400 flex items-center gap-1"
                >
                  {copied === "btc"
                    ? <CheckCircle2 size={14}/>
                    : <Copy size={14}/>
                  }
                </button>
              )}
            </div>

            <div className="break-all">
              {data.btc_address || "No BTC address assigned"}
            </div>

          </div>
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6">

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-400">
                ETH Address
              </div>

              {data.eth_address && (
                <button
                  onClick={() => copy(data.eth_address, "eth")}
                  className="text-blue-400 flex items-center gap-1"
                >
                  {copied === "eth"
                    ? <CheckCircle2 size={14}/>
                    : <Copy size={14}/>
                  }
                </button>
              )}
            </div>

            <div className="break-all">
              {data.eth_address || "No ETH address assigned"}
            </div>

          </div>


          <div className="bg-black/30 border border-white/10 rounded-2xl p-6">

            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-400">
                USDT Address
              </div>

              {data.usdt_address && (
                <button
                  onClick={() => copy(data.usdt_address, "usdt")}
                  className="text-blue-400 flex items-center gap-1"
                >
                  {copied === "usdt"
                    ? <CheckCircle2 size={14}/>
                    : <Copy size={14}/>
                  }
                </button>
              )}
            </div>

            <div className="break-all">
              {data.usdt_address || "No USDT address assigned"}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;
