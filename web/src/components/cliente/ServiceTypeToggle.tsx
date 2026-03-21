'use client';

import React, { useState } from 'react';
import { Scissors, MapPin } from 'lucide-react';

export default function ServiceTypeToggle() {
    const [tipo, setTipo] = useState<'local' | 'domicilio'>('local');

    return (
        <div className="flex bg-zinc-100 p-1 rounded-xl w-full max-w-sm mx-auto shadow-inner border border-zinc-200/50">
            <button
                onClick={() => setTipo('local')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    tipo === 'local' 
                    ? 'bg-white text-black shadow-sm border border-zinc-200/80' 
                    : 'text-zinc-500 hover:text-black'
                }`}
            >
                <Scissors className="w-4 h-4" /> En Barbería
            </button>
            <button
                onClick={() => setTipo('domicilio')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    tipo === 'domicilio' 
                    ? 'bg-[#D0FF14] text-black shadow-sm border border-[#bce612]' 
                    : 'text-zinc-500 hover:text-black'
                }`}
            >
                <MapPin className="w-4 h-4" /> A Domicilio
            </button>
        </div>
    );
}
