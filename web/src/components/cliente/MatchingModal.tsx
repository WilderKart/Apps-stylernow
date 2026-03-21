'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Navigation, X, CheckCircle2, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { buscarBarberosMatching } from '@/app/actions/matching';

interface MatchingModalProps {
    isOpen: boolean;
    onClose: () => void;
    servicioId: string;
    clienteId: string;
}

export default function MatchingModal({ isOpen, onClose, servicioId, clienteId }: MatchingModalProps) {
    const [searching, setSearching] = useState(true);
    const [candidatos, setCandidatos] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setSearching(true);
            setError(null);
            setCandidatos([]);

            const executeMatching = async () => {
                // Mock ubicación Bogotá Chapinero
                const res = await buscarBarberosMatching({
                    cliente_id: clienteId,
                    lat: 4.648297, 
                    lng: -74.061444,
                    servicio_id: servicioId
                });

                // Simular delay de 3s para animación "escaneo"
                setTimeout(() => {
                    setSearching(false);
                    if (res.success) {
                        setCandidatos(res.candidatos || []);
                    } else {
                        setError(res.error || 'No se pudieron encontrar barberos.');
                    }
                }, 3000);
            };

            executeMatching();
        }
    }, [isOpen, servicioId, clienteId]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col justify-end md:justify-center items-center p-4"
                >
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden"
                    >
                        {/* Botón Cerrar */}
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                            <X className="w-4 h-4 text-black" />
                        </button>

                        {searching ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full border-4 border-[#D0FF14] border-t-transparent animate-spin"></div>
                                    <Navigation className="w-10 h-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-black" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-black text-[#101010] flex items-center justify-center gap-2">
                                        Escaneando Barberos <Sparkles className="w-4 h-4 text-[#D0FF14]" />
                                    </h3>
                                    <p className="text-xs text-zinc-400 mt-1">Calculando distancia, reputación y disponibilidad...</p>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center py-10 text-center gap-4">
                                <div className="p-4 bg-red-50 text-red-500 rounded-full">
                                    <X className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-black">Búsqueda Fallida</h4>
                                    <p className="text-xs text-zinc-500 mt-1">{error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-black text-[#101010] flex items-center justify-center gap-2">
                                        ¡Compatibilidad Encontrada!  <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    </h3>
                                    <p className="text-xs text-zinc-500 mt-1">Selecciona la mejor opción para agendar</p>
                                </div>

                                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                                    {candidatos.length > 0 ? candidatos.map((c, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl hover:border-zinc-300 transition-all cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 bg-[#D0FF14] rounded-full flex items-center justify-center font-bold text-black border border-black/10">
                                                    {i + 1}
                                                 </div>
                                                 <div>
                                                     <p className="text-sm font-bold text-black">Barbero #{c.barbero_id.slice(0,4)}</p>
                                                     <p className="text-[10px] text-zinc-400 font-semibold">Puntuación: {(c.score_final * 10).toFixed(1)}%</p>
                                                 </div>
                                            </div>
                                            <button className="px-3 py-1.5 bg-[#101010] text-white text-xs font-bold rounded-lg hover:bg-[#202020] flex items-center gap-1">
                                                <UserCheck className="w-3 h-3" /> Agendar
                                            </button>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-zinc-500 text-center py-4">No se hallaron candidatos óptimos.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="border-t border-zinc-100 pt-3 text-center">
                            <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">Reserva Protegida por Blockchain & Ledger Financiero</p>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
