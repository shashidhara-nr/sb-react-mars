import { getTranslations } from 'next-intl/server';
import CollectionList from '@organisms/CollectionFileuploadList/CollectionList';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('collectionsfileupload');
  
  return {
    title: `${t('collectionsfileupload')} - Standard Bank`,
    description: '',
  };
}

export default function CollectionFileUploadPage() {
  return <CollectionList />;
}
