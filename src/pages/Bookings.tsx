import React from 'react';
import { Calendar, Clock, Video } from 'lucide-react';

const Bookings = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">My Booking Sessions</h1>
        <p className="text-slate-400 mt-2">Manage your scheduled consultations with our experts.</p>
      </div>

      <div className="bg-[#1a1b1e] rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
          <Calendar className="text-slate-400" size={32} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No Upcoming Sessions</h3>
        <p className="text-slate-400 mb-6 max-w-md">
          You don't have any scheduled sessions. Book a consultation with our crypto experts for personalized guidance.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
          <Video size={20} />
          Book a Session
        </button>
      </div>
    </div>
  );
};

export default Bookings;
