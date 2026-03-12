import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase';

const AdminUserDetails = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;

      try {
        const snap = await get(ref(db, `users/${id}`));
        if (snap.exists()) {
          setUserData(snap.val());
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Load user details error:', error);
      }
    };

    loadUser();
  }, [id]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] uppercase tracking-[0.28em] text-white/35 font-bold mb-2">
          User Details
        </div>
        <h1 className="text-3xl font-black tracking-tight">User Profile</h1>
      </div>

      <div className="rounded-[28px
