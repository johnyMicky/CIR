import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';

const AdminUsers = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const snap = await get(ref(db, 'users'));
        if (!snap.exists()) {
          setUsers([]);
          return;
        }

        const data = snap.val();
        const rows = Object.entries(data).map(([id, value]) => ({
          id,
          ...(value as any)
        }));

        setUsers(rows);
      } catch (error) {
        console.error('Load users error:', error);
      }
    };

    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/35 font-bold mb-2">
          Admin Users
        </div>
        <h1 className="text-3xl font-black tracking-tight">Users</h1>
      </div>

      <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 border-b border-white/10">
            <tr>
              <th className="py-3 px-3">Name</th>
              <th className="py-3 px-3">Email</th>
              <th className="py-3 px-3">Country</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Balance</th>
              <th className="py-3 px-3">Open</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-white/5">
                <td className="py-3 px-3">{`${u.firstName || ''} ${u.lastName || ''}`.trim() || 'N/A'}</td>
                <td className="py-3 px-3">{u.email || 'N/A'}</td>
                <td className="py-3 px-3">{u.country || 'N/A'}</td>
                <td className="py-3 px-3">{u.role || 'user'}</td>
                <td className="py-3 px-3">${Number(u.balance || 0).toLocaleString()}</td>
                <td className="py-3 px-3">
                  <Link to={`/admin/users/${u.id}`} className="text-blue-400 hover:text-blue-300">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-slate-500 py-8 text-center">No users found</div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
