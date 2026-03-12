import React, { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { Link } from "react-router-dom";
import { Search, Users, ChevronRight } from "lucide-react";
import { db } from "../../firebase";

type UserItem = {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  stateRegion?: string;
  city?: string;
  role?: string;
  status?: string;
  created_at?: string;
};

const AdminUsers = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const usersRef = ref(db, "users");

    const unsub = onValue(usersRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUsers([]);
        return;
      }

      const data = snapshot.val();

      const mapped = Object.entries(data).map(([id, value]) => ({
        id,
        ...(value as any)
      })) as UserItem[];

      mapped.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime();
        const bTime = new Date(b.created_at || 0).getTime();
        return bTime - aTime;
      });

      setUsers(mapped);
    });

    return () => unsub();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return users;

    return users.filter((user) => {
      const haystack = [
        user.firstName,
        user.lastName,
        user.fullName,
        user.email,
        user.phone,
        user.country,
        user.stateRegion,
        user.city,
        user.role,
        user.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [users, search]);

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-blue-300 font-bold mb-2">
            Admin Users
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">
            Users Management
          </h1>
          <p className="text-slate-400 mt-2">
            All registered users are listed here.
          </p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-5 py-4 min-w-[220px]">
          <div className="text-sm text-slate-400 mb-1">Total Users</div>
          <div className="text-2xl font-black">{users.length}</div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4 md:p-5">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, country, city, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-black/20 border border-white/10 pl-12 pr-4 py-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,#0b1220_0%,#0d1628_100%)] p-4 md:p-6 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-14 text-slate-400">
            No users found.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-[24px] border border-white/8 bg-black/20 p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-11 h-11 rounded-2xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center text-blue-300 shrink-0">
                      <Users size={18} />
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate">
                        {user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unnamed User"}
                      </div>
                      <div className="text-sm text-slate-400 truncate">
                        {user.email || "No email"}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3 text-sm">
                    <div className="text-slate-400">
                      <span className="text-white/90">Country:</span> {user.country || "-"}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-white/90">Region:</span> {user.stateRegion || "-"}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-white/90">City:</span> {user.city || "-"}
                    </div>
                    <div className="text-slate-400">
                      <span className="text-white/90">Phone:</span> {user.phone || "-"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right hidden md:block">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/30 font-bold">
                      {user.role || "user"}
                    </div>
                    <div className={`text-sm mt-1 font-semibold ${user.status === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                      {user.status || "active"}
                    </div>
                  </div>

                  <Link
                    to={`/admin/users/${user.id}`}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 transition-all"
                  >
                    <span>Open</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
