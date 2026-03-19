'use client';

import React, { useState } from 'react';
import OnboardingCarousel from '@/components/OnboardingCarousel';
import RoleSelection from '@/components/RoleSelection';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);

  if (showOnboarding) {
    return <OnboardingCarousel onClose={() => setShowOnboarding(false)} />;
  }

  return <RoleSelection />;
}
