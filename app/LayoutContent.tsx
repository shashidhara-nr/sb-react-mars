'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import LayoutWrapper from './LayoutWrapper';
import { SessionTimeoutProvider } from 'lib/providers/SessionTimeoutProvider';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isNoLayout =
    pathname?.match(/\/[a-z]{2}\/signin($|\/)/) ||
    pathname?.startsWith('/(unauth)');

  return isNoLayout ? (
    <>{children}</>
  ) : (
    <SessionTimeoutProvider
      sessionTimeoutMs={12 * 60 * 1000}
      warningThresholdMs={2 * 60 * 1000}
      warningDurationMs={30 * 1000}
    >
      <LayoutWrapper>{children}</LayoutWrapper>
    </SessionTimeoutProvider>
  );
}
