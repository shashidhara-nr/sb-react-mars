import { getTranslations } from 'next-intl/server';
import ParticipatingBanks from '@organisms/ParticipatingBanks/ParticipatingBanks';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('participatingBanks');
  
  return {
    title: `${t('participatingBanks')} - Standard Bank`,
    description: '',
  };
}

export default function ParticipatingBanksPage() {
  return <ParticipatingBanks />;
}
