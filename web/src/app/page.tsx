import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] font-sans selection:bg-[#1A1A1A] selection:text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="text-2xl font-bold tracking-tighter">StylerNow</div>
        <nav className="hidden md:flex gap-8 items-center">
          <a href="#caracteristicas" className="text-sm font-medium hover:text-gray-500 transition-colors">Características</a>
          <a href="#planes" className="text-sm font-medium hover:text-gray-500 transition-colors">Planes</a>
          <a href="#barberos" className="text-sm font-medium hover:text-gray-500 transition-colors">Para Barberos</a>
          <a href="/ingresar" className="text-sm font-bold bg-gray-50 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
            Ingresar
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center px-6 py-32 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-100 mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">Nueva Experiencia PWA</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tighter">
          Tu estilo, tu tiempo.<br/> 
          <span className="text-gray-400">Sin complicaciones.</span>
        </h1>
        
        <p className="mt-6 text-lg md:text-xl text-gray-500 max-w-2xl leading-relaxed">
          StylerNow es la plataforma SaaS premium para barberías. Descubre profesionales con insignias de experticia, reserva en segundos y gestiona tus citas.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="px-8 py-4 bg-[#1A1A1A] text-white rounded-md font-semibold text-lg hover:bg-black transition-all shadow-xl shadow-black/10 focus:ring-4 focus:ring-gray-200">
            Explorar Barberías
          </button>
          <button className="px-8 py-4 bg-white text-[#1A1A1A] border border-gray-200 rounded-md font-semibold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all focus:ring-4 focus:ring-gray-100">
            Panel de Administración
          </button>
        </div>

        {/* Feature Teasers */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
          <div>
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Instalable (PWA)</h3>
            <p className="text-gray-500">Agrega StylerNow a tu pantalla de inicio directamente desde el navegador sin pasar por tiendas.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <span className="text-2xl">⭐</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Insignias de Experiencia</h3>
            <p className="text-gray-500">Nuestros barberos se clasifican en Artesano, Pro y Expert para que elijas con total confianza.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4 border border-gray-100">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Seguridad Zero Trust</h3>
            <p className="text-gray-500">Auditoría completa de todas las transacciones, roles y accesos garantizando la seguridad de tu barbería.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
