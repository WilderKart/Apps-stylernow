import React from 'react';
import { ChevronLeft, CheckCircle2, ShieldCheck, CreditCard } from 'lucide-react';
import Link from 'next/link';
import PaymentButton from '@/components/cliente/PaymentButton';

export default function CheckoutReserva() {
  return (
    <div className="flex flex-col w-full min-h-screen bg-zinc-50 font-sans pb-24 relative">
      {/* Header */}
      <header className="px-5 py-6 bg-white border-b border-zinc-100 flex items-center justify-between sticky top-0 z-40">
        <Link href="/cliente" className="p-2 -ml-2 hover:bg-zinc-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6 text-black" />
        </Link>
        <h1 className="text-lg font-extrabold text-[#1A1A1A]">Confirmar Reserva</h1>
        <div className="w-8 h-8"></div> {/* Spacer */}
      </header>

      <div className="p-5 flex flex-col gap-6">
        
        {/* Resumen Card */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">Tu Cita</h2>
            <h3 className="text-xl font-extrabold text-[#1A1A1A]">Jueves 18 Nov, 4:30 PM</h3>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center">
               <span className="text-xs font-bold">DS</span>
             </div>
             <div>
               <p className="font-bold text-black">David S. <span className="text-[10px] bg-zinc-200 px-1 py-0.5 rounded ml-1">PRO</span></p>
               <p className="text-sm text-zinc-500">The Gentlemen's Club</p>
             </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 flex justify-between items-center text-sm">
            <span className="font-semibold text-zinc-600">Combo Premium</span>
            <span className="font-bold text-black">$50.000</span>
          </div>
        </div>

        {/* Benefits & Memberships */}
        <div className="bg-[#1A1A1A] text-white p-5 rounded-2xl relative overflow-hidden shadow-lg flex items-center justify-between">
          <div className="relative z-10">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" /> Miembro Styler Club
            </h4>
            <p className="text-xs text-zinc-400 mt-1">Acumulas 50 puntos con esta reserva</p>
          </div>
          <button className="text-xs font-bold uppercase tracking-widest border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors z-10">
            Usar
          </button>
        </div>

        {/* Payment Summary */}
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
          <h3 className="text-base font-bold text-black mb-4 flex items-center gap-2">
            Anticipo de Reserva <ShieldCheck className="w-4 h-4 text-green-500" />
          </h3>
          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
            StylerNow requiere un abono del 15% para confirmar tu asistencia. El saldo restante lo pagas en la barbería.
          </p>

          <div className="flex justify-between items-center text-sm mb-2">
            <span className="text-zinc-600">Total Servicio</span>
            <span className="font-semibold">$50.000</span>
          </div>
          <div className="flex justify-between items-center text-sm mb-4">
            <span className="text-zinc-600 cursor-help underline decoration-dashed">Abono (15%)</span>
            <span className="font-semibold">$7.500</span>
          </div>
          
          <div className="pt-4 border-t border-zinc-100 flex justify-between items-center">
            <span className="font-bold text-black">Total a Pagar Hoy</span>
            <span className="text-2xl font-extrabold text-black">$7.500</span>
          </div>
        </div>

      </div>

      {/* MP Action Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-100 p-4 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <PaymentButton />
        <p className="text-[10px] text-center text-zinc-400 font-medium mt-3 uppercase tracking-widest">
          Pagos seguros por MercadoPago
        </p>
      </div>

    </div>
  );
}
