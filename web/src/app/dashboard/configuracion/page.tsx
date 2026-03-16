import React from 'react';
import { Settings, CheckCircle2, AlertTriangle, Shield, UserPlus } from 'lucide-react';

export default function GlobalSettings() {
  return (
    <div className="flex flex-col w-full h-full p-8 max-w-5xl mx-auto">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Configuración</h1>
          <p className="text-sm text-zinc-500 font-medium tracking-wide mt-1">
            Administra branding, notificaciones y pagos de tu App web/móvil.
          </p>
        </div>
      </div>

      <div className="flex gap-8 items-start">
        
        {/* Settings Navigation */}
        <div className="w-64 bg-white border border-zinc-200 rounded-2xl shadow-sm p-4 sticky top-8 shrink-0">
          <ul className="flex flex-col gap-2">
            <li>
              <button className="w-full text-left px-4 py-2 bg-zinc-100 text-black font-bold text-sm rounded-lg hover:bg-zinc-200 transition-colors">
                Branding & Visual
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-2 bg-white text-zinc-500 font-semibold text-sm rounded-lg hover:bg-zinc-50 transition-colors">
                Integraciones (MercadoPago)
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-2 bg-white text-zinc-500 font-semibold text-sm rounded-lg hover:bg-zinc-50 transition-colors">
                Notificaciones
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-2 bg-white text-zinc-500 font-semibold text-sm rounded-lg hover:bg-zinc-50 transition-colors">
                Seguridad & Roles
              </button>
            </li>
            <li>
              <button className="w-full text-left px-4 py-2 bg-white text-red-500 font-semibold text-sm rounded-lg hover:bg-red-50 transition-colors mt-4">
                Suscripción StylerNow
              </button>
            </li>
          </ul>
        </div>

        {/* Selected View (Branding & Visual) */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-zinc-400" /> Identidad Visual
            </h2>
            <p className="text-sm text-zinc-500 mb-6 font-medium">
              Estos cambios se reflejarán inmediatamente en la App Cliente y Landing Page de tu Barbería.
            </p>

            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Nombre de Barbería / Estudio</label>
                <input type="text" defaultValue="The Gentlemen's Club" className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm font-bold text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Color Primario (Acento)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1A1A1A] border-2 border-zinc-200"></div>
                    <input type="text" defaultValue="#1A1A1A" className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-bold text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Color Secundario</label>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border-2 border-zinc-200"></div>
                    <input type="text" defaultValue="#FFF" className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-bold text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Imágenes & Logos</label>
                <div className="border-2 border-dashed border-zinc-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-zinc-100">
                    <span className="text-xl">🖼️</span>
                  </div>
                  <p className="text-sm font-bold text-black mb-1">Arrastra tu logo aquí para subir</p>
                  <p className="text-xs text-zinc-500 font-medium">PNG, SVG o JPG hasta 5MB.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all shadow-md">
                Guardar Cambios Visuales
              </button>
            </div>
          </div>

          {/* Quick Setup Validation Card */}
          <div className="bg-[#1A1A1A] text-white border border-black rounded-2xl p-6 shadow-lg">
            <h3 className="text-base font-bold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" /> Diagnóstico de Configuración
            </h3>
            
            <ul className="flex flex-col gap-3">
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium"><CheckCircle2 className="w-4 h-4 text-green-400" /> API de Supabase Conectada</span>
                <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded">OK</span>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-yellow-500"><AlertTriangle className="w-4 h-4" /> MercadoPago Webhooks Pendientes</span>
                <button className="text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded transition-colors">Configurar ahora</button>
              </li>
              <li className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium text-yellow-500"><AlertTriangle className="w-4 h-4" /> Resend API Key no proporcionada</span>
                <button className="text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded transition-colors">Agregar Llave</button>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
