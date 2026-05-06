import { Card } from 'components/molecules/index';
import styles from './Hero.module.scss';

export default function Hero({ heading, subheading }: { heading: string; subheading: string }) {
  return (
    <section className={styles.hero}>
      <h1>{heading}</h1>
      <h2>{subheading}</h2>
      <Card>Organism content area</Card>
    </section>
  );
}
