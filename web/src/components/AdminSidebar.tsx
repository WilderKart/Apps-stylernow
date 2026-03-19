'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, CreditCard, Activity, Settings2, X, Users, RefreshCw, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';

export default function AdminSidebar({ isOpen, setIsOpen }: { isOpen?: boolean, setIsOpen?: (isOpen: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingBarberias, setPendingBarberias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('barberias')
        .select('id, nombre, creado_en')
        .eq('activa', false)
        .order('creado_en', { ascending: false });
      
      if (data) setPendingBarberias(data);
      setLoading(false);
    };

    fetchPending();
    
    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('barberias_pendientes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'barberias' }, () => {
        fetchPending();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
            onClick={() => setIsOpen?.(false)} 
          />
        )}
      </AnimatePresence>

      <aside className={`w-64 bg-[#09090A] border-r border-zinc-800/40 flex flex-col h-[100dvh] fixed left-0 top-0 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-zinc-800/40 flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black tracking-tight text-white">StylerNow OS</h2>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D0FF14]">Super Admin</span>
          </div>
          <button className="md:hidden text-zinc-400 hover:text-white" onClick={() => setIsOpen?.(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1 custom-scrollbar">
          <div className="mb-4 mt-2">
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Métricas</p>
            <Link onClick={() => setIsOpen?.(false)} href="/admin/kpis" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all ${isActive('/admin/kpis') ? 'bg-[#D0FF14] text-black shadow-lg shadow-[#D0FF14]/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm">War Room (KPIs)</span>
            </Link>
            <Link onClick={() => setIsOpen?.(false)} href="/admin/status" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all mt-1 ${isActive('/admin/status') ? 'bg-[#D0FF14] text-black shadow-lg shadow-[#D0FF14]/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
              <Activity className="w-5 h-5" />
              <span className="text-sm">Estado del Servidor</span>
            </Link>
          </div>

          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Control SaaS</p>
            <Link onClick={() => setIsOpen?.(false)} href="/admin/barberias" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all ${isActive('/admin/barberias') ? 'bg-[#D0FF14] text-black shadow-lg shadow-[#D0FF14]/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
              <Building2 className="w-5 h-5" />
              <span className="text-sm">Barberías (Tenants)</span>
            </Link>
            <Link onClick={() => setIsOpen?.(false)} href="/admin/usuarios" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all mt-1 ${isActive('/admin/usuarios') ? 'bg-[#D0FF14] text-black shadow-lg shadow-[#D0FF14]/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
              <Users className="w-5 h-5" />
              <span className="text-sm">Usuarios / Clientes</span>
            </Link>
            <Link onClick={() => setIsOpen?.(false)} href="/admin/suscripciones" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all mt-1 ${isActive('/admin/suscripciones') ? 'bg-[#D0FF14] text-black shadow-lg shadow-[#D0FF14]/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Suscripciones</span>
            </Link>
            <Link onClick={() => setIsOpen?.(false)} href="/admin/features" className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold transition-all mt-1 ${isActive('/admin/features') ? 'bg-[#D0FF14] text-black shadow-lg shadow-[#D0FF14]/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}>
               <Settings2 className="w-5 h-5" />
               <span className="text-sm">Activar Funciones</span>
            </Link>
          </div>
        </nav>

        {/* Pending Requests Card */}
        <AnimatePresence>
          {pendingBarberias.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="m-4 bg-[#141415] border border-zinc-800/40 rounded-xl p-4 flex flex-col gap-2 shadow-inner"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D0FF14]">Solicitudes</span>
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">{pendingBarberias.length}</span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">Barberías esperando aprobación.</p>
              
              <div className="flex flex-col gap-1.5 mt-2 max-h-24 overflow-y-auto custom-scrollbar">
                {pendingBarberias.map((b) => (
                  <div key={b.id} className="flex items-center justify-between bg-zinc-900 p-2 rounded-lg border border-zinc-800/20">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{b.nombre}</span>
                    <RefreshCw className="w-3 h-3 text-[#D0FF14] animate-spin-slow" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Info Bottom */}
        <div className="p-4 border-t border-zinc-800/40 mt-auto bg-[#0E0E0F]">
          <div className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 rounded-full bg-zinc-800 text-[#D0FF14] font-extrabold flex items-center justify-center text-xs shrink-0 border border-[#D0FF14]/20 shadow-inner">TU</div>
            <div className="flex-1 truncate">
              <a href="https://technoultra.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-white hover:text-[#D0FF14] transition-colors truncate block">TechnoUltra</a>
              <p className="text-[10px] text-zinc-500 font-medium truncate">Desarrollador Oficial</p>
            </div>
            <button 
              onClick={handleSignOut}
              title="Cerrar Sesión"
              className="ml-auto shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
