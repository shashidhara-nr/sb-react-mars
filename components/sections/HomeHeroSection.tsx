import Hero from 'components/organisms/Hero/Hero';
import MainTemplate from 'components/templates/MainTemplate';

export default function HomeHeroSection({ timestamp }: { timestamp: string }) {
  return (
    <MainTemplate>
      <Hero heading="Home" subheading={`Rendered at ${timestamp}`} />
    </MainTemplate>
  );
}
