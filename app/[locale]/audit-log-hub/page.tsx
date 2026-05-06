import { getTranslations } from 'next-intl/server';
import AuditLogHub from '@organisms/AuditLogHub/AuditLogHub';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('auditLogHub');
  
  return {
    title: `${t('auditLogHub')} - Standard Bank`,
    description: '',
  };
}

export default function AuditLogHubPage() {
  return <AuditLogHub />;
}
