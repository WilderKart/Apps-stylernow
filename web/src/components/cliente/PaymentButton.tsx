'use client';

import React, { useState } from 'react';
import { CreditCard, RefreshCw } from 'lucide-react';

export default function PaymentButton({ reservaId }: { reservaId?: string }) {
    const [loading, setLoading] = useState(false);

    const handlePay = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pago', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    reserva_id: reservaId || 'demo-reserva-id', // En producción se pasa el real
                    monto: 7500 // El abono
                })
            });

            const data = await res.json();

            if (data.init_point) {
                // Redirigir a Mercado Pago
                window.location.href = data.init_point;
            } else {
                alert('Error al generar la preferencia de pago.');
                setLoading(false);
            }

        } catch (error) {
            console.error('Error en pago:', error);
            alert('Error de conexión con el servidor de pagos.');
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handlePay}
            disabled={loading}
            className="w-full bg-[#009EE3] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#0089C5] transition-colors shadow-lg shadow-[#009EE3]/20 disabled:opacity-75 disabled:cursor-not-allowed"
        >
            {loading ? (
                <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Procesando Pago...
                </>
            ) : (
                <>
                    <CreditCard className="w-5 h-5" />
                    Pagar con MercadoPago
                </>
            )}
        </button>
    );
}
