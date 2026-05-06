'use client';
 
import { PaymentRowProps } from './types';
import styles from './PaymentRow.module.scss';
import Image from 'next/image';
import IcnBin from 'public/icons/icn_bin.svg';
import ColIconDown from 'public/icons/col-icon-down.svg';
import ColIconUp from 'public/icons/col-icon-up.svg';
import IcnWarningOutline from 'public/icons/icn_warning_outline.svg';
import { Button, StatusLabel } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
 
const PaymentRow: React.FC<PaymentRowProps> = ({
  payment,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onRemove,
}) => {
  const rowTestId = buildTestId('payment-file-upload-row', payment.id);
 
  const getStatusLabelProps = (status: string) => {
    switch (status) {
      case 'verified':
        return { text: 'Account verified', paletteColor: 'success' as const };
      case 'partially-verified':
        return { text: 'Account partially verified', paletteColor: 'warning' as const };
      case 'not-verified':
        return { text: 'Account not verified', paletteColor: 'info' as const };
      case 'invalid':
        return { text: 'INVALID PAYMENT', paletteColor: 'error' as const };
      case 'duplicate':
        return { text: 'DUPLICATE PAYMENT', paletteColor: 'error' as const };
      default:
        return { text: status, paletteColor: undefined };
    }
  };
 
  const statusProps = getStatusLabelProps(payment.status);
 
  return (
    <div
      className={`${styles.row} ${isExpanded ? styles.expanded : ''} ${isSelected ? styles.selected : ''}`}
      style={payment.status === 'invalid' || payment.status === 'duplicate' ? { borderColor: '#E31E46' } : undefined}
      data-testid={rowTestId}
    >
      <div className={styles.mainRow}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={isSelected}
          onChange={() => onToggleSelect(payment.id)}
          data-testid={buildTestId(rowTestId, 'select-checkbox')}
        />
 
        <span className={styles.name} data-testid={buildTestId(rowTestId, 'name')}>
          {payment.name}
        </span>
 
        <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
          {payment.status === 'invalid' || payment.status === 'duplicate' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Image src={IcnWarningOutline} alt="Warning" width={24} height={24} />
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#E31E46',
                  textTransform: 'uppercase',
                }}
              >
                {payment.status === 'invalid' ? 'INVALID PAYMENT' : 'DUPLICATE PAYMENT'}
              </span>
            </div>
          ) : (
            <StatusLabel text={statusProps.text} paletteColor={statusProps.paletteColor} />
          )}
        </div>
 
        <div className={styles.accountSelect}>
          <span className={styles.accountLabel}>Account number: [Account number]</span>
        </div>
 
        <button
          className={styles.expandButton}
          onClick={() => onToggleExpand(payment.id)}
          data-testid={buildTestId(rowTestId, isExpanded ? 'collapse-button' : 'expand-button')}
        >
          <Image src={isExpanded ? ColIconUp : ColIconDown} alt={isExpanded ? 'Collapse' : 'Expand'} width={20} height={20} />
        </button>
      </div>
 
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailsColumn}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Payment code</span>
                <span className={styles.detailValue}>{payment.beneficiaryCode || '[Payment code]'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Bank name</span>
                <span className={styles.detailValue}>{payment.bankName || '[Bank name]'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>CDI number</span>
                <span className={styles.detailValue}>{payment.cdiNumber || '[CDI number]'}</span>
              </div>
            </div>
 
            <div className={styles.detailsColumn}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Payment reference</span>
                <span className={styles.detailValue}>{payment.beneficiaryReference || '[Payment reference]'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>IBAN</span>
                <span className={styles.detailValue}>{payment.iban || 'XXXXXXXX'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Transaction limit and currency</span>
                <span className={styles.detailValue}>{payment.transactionLimit || '[XXX, xxx, xxxx, xxx]'}</span>
              </div>
            </div>
          </div>
 
          <div className={styles.removeSection}>
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={IcnBin} alt="Remove" width={24} height={24} />}
              onClick={() => onRemove(payment.id)}
              data-testid={buildTestId(rowTestId, 'remove-button')}
              style={{ height: '36px', minHeight: '36px', width: '113px', fontWeight: 700, fontSize: '14px' }}
            >
              REMOVE
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default PaymentRow;
 
 