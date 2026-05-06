import './globals.scss';

import React from 'react';
import LayoutContent from './LayoutContent';

export const metadata = {
  title: 'React Mars',
  description: 'Banking application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutContent>{children}</LayoutContent>
      </body>
    </html>
  );
}
