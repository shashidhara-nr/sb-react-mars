import styles from '@styles/loading.module.scss';

export default function RootLoading() {
  return (
    <div aria-busy="true" className={styles.rootLoading}>
      <div className="blockLarge" />
      <div className="blockMedium" />
      <div className="blockPanel" />
    </div>
  );
}
