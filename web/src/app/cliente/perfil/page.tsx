import React from 'react';
import { User, Settings, CreditCard, LogOut, Wallet, Award } from 'lucide-react';

export default function ClientePerfil() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50 pt-8">
      {/* Header Profile */}
      <div className="flex flex-col items-center justify-center p-6 bg-white border-b border-zinc-100">
        <div className="w-24 h-24 rounded-full bg-zinc-100 border-4 border-white shadow-sm flex items-center justify-center mb-4 relative">
          <User className="w-10 h-10 text-zinc-400" />
          <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
            <Award className="w-3 h-3 text-white" />
          </div>
        </div>
        <h2 className="text-xl font-extrabold text-[#1A1A1A]">Andrés Jiménez</h2>
        <p className="text-sm font-medium text-zinc-500">Miembro desde 2026</p>
      </div>

      <div className="p-5 flex flex-col gap-6">
        {/* Loyalty Wallet Summary */}
        <div className="bg-[#1A1A1A] rounded-2xl p-5 text-white flex justify-between items-center shadow-lg">
          <div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">Puntos Styler</p>
            <h3 className="text-3xl font-extrabold text-white">4,250</h3>
          </div>
          <Wallet className="w-10 h-10 text-white/20" />
        </div>

        {/* Options List */}
        <div className="bg-white border border-zinc-100 rounded-2xl overflow-hidden shadow-sm">
          <button className="w-full flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <User className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-bold text-black">Datos Personales</span>
            </div>
            <span className="text-zinc-400">›</span>
          </button>
          
          <button className="w-full flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-bold text-black">Métodos de Pago</span>
            </div>
            <span className="text-zinc-400">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Award className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-bold text-black">Membresías Activas</span>
            </div>
            <span className="text-zinc-400">›</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-black" />
              </div>
              <span className="text-sm font-bold text-black">Configuración</span>
            </div>
            <span className="text-zinc-400">›</span>
          </button>
        </div>

        <button className="w-full flex items-center justify-center gap-2 p-4 text-red-500 font-bold text-sm bg-white border border-red-50 rounded-2xl hover:bg-red-50 transition-colors mt-4">
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
