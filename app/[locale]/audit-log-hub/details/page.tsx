import { getTranslations } from 'next-intl/server';
import AuditLogHubDetail from '@organisms/AuditLogHub/AuditLogHubDetail';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('auditLogHub');
  
  return {
    title: `${t('auditLogHub')} - Standard Bank`,
    description: '',
  };
}

export default function AuditLogHubDetailPage() {
  return <AuditLogHubDetail />;
}
