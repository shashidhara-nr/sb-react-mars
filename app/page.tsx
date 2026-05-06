// Server Component example
import Hero from 'components/organisms/Hero';
import HomeHeroSection from 'components/sections/HomeHeroSection';
import styles from '@styles/page.module.scss';

async function getTime() {
  return new Date().toISOString();
}

export default async function Page() {
  const time = await getTime();
  return (
    <main className={styles.main}>
      <Hero heading="Welcome" subheading="Atomic Next.js Scaffold" />
      <HomeHeroSection timestamp={time} />
    </main>
  );
}
