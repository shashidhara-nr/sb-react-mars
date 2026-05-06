import { getTranslations } from 'next-intl/server';
import CollectionsList from '@organisms/CollectionsList/CollectionsList'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('collections');
  
  return {
    title: `${t('collections')} - Standard Bank`,
    description: '',
  };
}

export default function CollectionsPage() {
  return <CollectionsList />;
}
