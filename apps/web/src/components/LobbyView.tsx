import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useGameSocket } from '../hooks/useGameSocket';

export function LobbyView() {
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const { joinRoom, isConnected, error } = useGameSocket();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 overflow-hidden">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-[float_6s_ease-in-out_infinite]">
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 text-center mb-2">Tic-Tac-Toe</h1>
        <p className="text-center text-sm font-medium mb-8 flex justify-center items-center gap-2">
          {isConnected ? <><span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span><span className="text-cyan-400">System Online</span></> : <span className="text-rose-500">System Offline</span>}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Operator Name</label>
            <input type="text" placeholder="Enter your designation" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner outline-none" />
          </div>

          <button disabled={!playerName || !isConnected} onClick={() => joinRoom(uuidv4(), playerName, 'X')} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] active:scale-95 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
            Initialize Match
          </button>

          <div className="relative py-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative bg-slate-950 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Or Link to Existing</span>
          </div>

          <div className="space-y-4">
            <input type="text" placeholder="Input Room Coordinates" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner outline-none" />
            <button disabled={!playerName || !roomId || !isConnected} onClick={() => joinRoom(roomId, playerName, 'O')} className="w-full border-2 border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              Join Match
            </button>
          </div>

          {error && <div className="mt-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-sm text-rose-400 text-center shadow-inner">{error.message}</div>}
        </div>
      </div>
    </div>
  );
}
