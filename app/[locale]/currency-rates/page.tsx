import { getTranslations } from 'next-intl/server';
import CurrencyRates from '@organisms/CurrencyRates/CurrencyRates';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('currencyRates');
  
  return {
    title: `${t('currencyRates')} - Standard Bank`,
    description: '',
  };
}

export default function CurrencyRatesPage() {
  return <CurrencyRates />;
}
