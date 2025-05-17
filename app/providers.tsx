'use client';

import { ThemeProvider } from 'next-themes';
import { AnimatePresence } from 'framer-motion';
import React from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AnimatePresence mode="sync">
        {children}
      </AnimatePresence>
    </ThemeProvider>
  );
}