import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

interface AnimatedLoaderProps {
  src?: string;
  className?: string;
}

export default function AnimatedLoader({ 
  src = "/animations/loading.lottie", // Ajustar tras subir archivo
  className = "w-20 h-20" 
}: AnimatedLoaderProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <DotLottieReact
        src={src}
        loop
        autoplay
      />
    </div>
  );
}
