'use client';

import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Zap, Star, ShieldCheck, Award } from 'lucide-react';
import Logo from './Logo';

export default function OnboardingCarousel({ onClose }: { onClose: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const slides = [
    {
      type: 'splash',
      title: 'StylerNow',
      subtitle: 'Cargando tu estilo...',
      bg: 'bg-white'
    },
    {
      type: 'image',
      title: 'Reserva tu corte en segundos',
      subtitle: 'Encuentra barberías profesionales verificadas cerca de ti.',
      image: '/imagenes/carousel/slide2.png',
      icon: Zap
    },
    {
      type: 'image',
      title: 'Gestiona tu barbería como un profesional',
      subtitle: 'Agenda, clientes, pagos y marketing en una sola plataforma.',
      image: '/imagenes/carousel/slide3.png',
      icon: ShieldCheck
    },
    {
      type: 'badges',
      title: 'Elige barberos por experiencia real',
      subtitle: 'Nuestros profesionales están certificados con insignias de experticia.',
      bg: 'bg-[#0f0f11]'
    }
  ];

  const nextSlide = () => {
    if (currentSlide === slides.length - 1) {
      onClose();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    setCurrentSlide(prev => Math.max(0, prev - 1));
  };

  if (!isMounted) return null;

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col justify-between overflow-hidden transition-opacity duration-500">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-border-spin {
          animation: spin 3s linear infinite;
        }
      `}</style>
      
      {/* Slide Content */}
      <div className="flex-1 flex flex-col relative w-full h-full items-center justify-center">

        {/* --- SLIDE 1: SPLASH SCREEN --- */}
        {slide.type === 'splash' && (
          <div className="flex flex-col items-center justify-center text-center px-6 animate-fadeIn">
            <div className="relative">
              {/* Green pulsing back light effect */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/30 filter blur-3xl animate-pulse scale-150 -z-10" />
              <Logo className="w-24 h-24 mb-4 scale-125 transition-all" markOnly={true} />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-black mt-4">StylerNow</h1>
            <p className="text-zinc-400 text-sm font-medium tracking-wide mt-1 animate-pulse">{slide.subtitle}</p>
          </div>
        )}

        {/* --- SLIDE 2 & 3: IMAGES --- */}
        {slide.type === 'image' && (
          <div className="absolute inset-0 flex flex-col items-center justify-end animate-fadeIn">
            <img 
              src={slide.image} 
              alt={slide.title} 
              className="absolute inset-0 w-full h-full object-cover select-none"
            />
            {/* Background Gradient Overlay to read text clearly */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <div className="relative z-10 px-8 pb-32 text-center text-white max-w-lg">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-4 border border-white/20">
                {slide.icon && <slide.icon className="w-6 h-6 text-white" />}
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-2 leading-tight">{slide.title}</h2>
              <p className="text-zinc-200 text-sm font-medium leading-relaxed">{slide.subtitle}</p>
            </div>
          </div>
        )}

        {/* --- SLIDE 4: INSIGNIAS --- */}
        {slide.type === 'badges' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white px-4 pt-16 pb-12 animate-fadeIn overflow-hidden">
            <div className="text-center max-w-md mb-3">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 mb-1 leading-tight">{slide.title}</h2>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md justify-items-stretch items-center flex-1 border-0">
              {[
                { 
                  label: 'EXPERT', 
                  name: 'Carlos "El Mago" Rivera', 
                  desc: 'Maestro del Oficio', 
                  color: '#D4AF37', 
                  textColor: '#F3E5AB',
                  avatar: '/imagenes/avatars/expert.png',
                  badge: 'EXPERT BARBER'
                },
                { 
                  label: 'PRO', 
                  name: 'Andrés "Pulido" Ruiz', 
                  desc: 'Profesional Certificado', 
                  color: '#B0BEC5', 
                  textColor: '#FFFFFF',
                  avatar: '/imagenes/avatars/pro.png',
                  badge: 'PRO BARBER'
                },
                { 
                  label: 'ARTESANO', 
                  name: 'Leo "El Joven" Diaz', 
                  desc: 'Técnica Sólida', 
                  color: '#8C7853', 
                  textColor: '#D4C6A9',
                  avatar: '/imagenes/avatars/artesano.png',
                  badge: 'ARTESANO BARBER'
                }
              ].map((badge, idx) => (
                <div 
                  key={idx} 
                  className="relative p-[1.5px] rounded-2xl overflow-hidden w-full max-w-sm flex shadow-lg"
                >
                  {/* Rotating borders with conic gradient */}
                  <div 
                    className="absolute inset-[-150%] animate-border-spin" 
                    style={{ 
                      background: `conic-gradient(from 0deg, transparent 40%, ${badge.color} 50%, transparent 60%, transparent 90%, ${badge.color} 100%)` 
                    }} 
                  />
                  
                  <div className="relative bg-[#0E0E10] p-4 rounded-2xl flex flex-col w-full">
                    <span className="text-[9px] font-bold tracking-widest mb-1.5" style={{ color: badge.textColor }}>
                      {badge.label}
                    </span>

                    <div className="flex items-center justify-center gap-4 w-full mb-2">
                      {/* Avatar circular */}
                      <div className="w-24 h-24 rounded-full border-2 overflow-hidden shadow-2xl flex-shrink-0" style={{ borderColor: badge.color }}>
                        <img src={badge.avatar} alt={badge.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Escudo Crest SVG */}
                      <div className="w-24 h-24 relative flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 100 120" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path 
                            d="M10 20 C30 15, 70 15, 90 20 L90 85 C90 98, 50 115, 50 115 C50 115, 10 98, 10 85 Z" 
                            fill={badge.color} 
                          />
                          <path 
                            d="M14 23 C32 19, 68 19, 86 23 L86 83 C86 94, 50 109, 50 109 C50 109, 14 94, 14 83 Z" 
                            fill="#141416" 
                          />
                          <path d="M40 38 L45 44 L50 38 L55 44 L60 38 L57 48 L43 48 Z" fill={badge.color} />
                          <text x="50" y="65" textAnchor="middle" fill={badge.color} fontSize="10" fontWeight="bold" letterSpacing="1">
                            {badge.badge.split(' ')[0]}
                          </text>
                          <text x="50" y="78" textAnchor="middle" fill={badge.color} fontSize="10" fontWeight="bold" letterSpacing="1">
                            {badge.badge.split(' ')[1]}
                          </text>
                        </svg>
                      </div>
                    </div>

                    <div className="text-center">
                      <h3 className="text-sm font-bold text-white mb-0.5">{badge.name}</h3>
                      <p className="text-[10px] text-zinc-400 font-medium">{badge.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- FOOTER NAVIGATION --- */}
      <div className={`p-8 flex items-center justify-between relative z-10 ${slide.bg === 'bg-[#0f0f11]' || slide.type === 'image' || slide.type === 'badges' ? 'bg-transparent' : 'bg-white'}`}>
        
        {currentSlide > 0 && (
          <button 
            onClick={prevSlide}
            className={`p-3 rounded-full flex items-center justify-center transition-all bg-zinc-100 hover:bg-zinc-200 text-black`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {currentSlide === 0 && <div/>}

        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all ${currentSlide === i ? 'w-6 bg-black' : 'w-2 bg-zinc-200'}`}
              style={currentSlide > 0 && (slide.type === 'image' || slide.type === 'badges') ? { backgroundColor: currentSlide === i ? '#FFF' : 'rgba(255,255,255,0.3)' } : {}}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
            slide.type === 'image' || slide.type === 'badges' 
              ? 'bg-white text-black hover:bg-zinc-100' 
              : 'bg-black text-white hover:bg-zinc-800'
          }`}
        >
          {currentSlide === slides.length - 1 ? 'Empezar' : 'Siguiente'}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
