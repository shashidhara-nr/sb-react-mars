import { getTranslations } from 'next-intl/server';
import TransactionalAuditAndApprove from '@organisms/TransactionalAuditAndApprove/TransactionalAuditAndApprove';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('transactionalAuditAndApprove');
  
  return {
    title: `${t('transactionalAuditAndApprove')} - Standard Bank`,
    description: '',
  };
}

export default function TransactionalAuditAndApprovePage() {
  return <TransactionalAuditAndApprove />;
}
