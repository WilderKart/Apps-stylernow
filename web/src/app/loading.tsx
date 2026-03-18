import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 animate-fade-in">
      <div className="flex flex-col items-center gap-2">
         {/* Video Loader Nativo */}
         <video 
           src="/animaciones/loading.webm" 
           autoPlay 
           loop 
           muted 
           className="w-40 h-40"
         />
         <h3 className="text-xl font-black text-zinc-900 tracking-tight">Cargando StylerNow...</h3>
         <p className="text-zinc-400 text-xs font-semibold">Garantizando tu conexión segura</p>
      </div>
    </div>
  );
}
