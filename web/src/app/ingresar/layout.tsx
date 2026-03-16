import React from 'react';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans selection:bg-[#1A1A1A] selection:text-white p-4">
      {children}
    </div>
  );
}
