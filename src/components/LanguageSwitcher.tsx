'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const handleChange = (newLocale: string) => {
    if (!pathname) return;
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath as any);
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      <select 
        value={currentLocale} 
        onChange={(e) => handleChange(e.target.value)}
        style={{
          padding: '10px 16px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#333',
          backgroundColor: 'white',
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}
      >
        <option value="en">🇬🇧 English</option>
        <option value="fr">🇫🇷 Français</option>
        <option value="pt">pt Português</option>
      </select>
    </div>
  );
}