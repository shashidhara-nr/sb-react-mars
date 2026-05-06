'use client';

import { BeneficiaryRowProps } from './types';
import styles from './BeneficiaryRow.module.scss';
import Image from 'next/image';
import IcnBin from 'public/icons/icn_bin.svg';
import ColIconDown from 'public/icons/col-icon-down.svg';
import ColIconUp from 'public/icons/col-icon-up.svg';
import IcnWarningOutline from 'public/icons/icn_warning_outline.svg';
import { Button, StatusLabel } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';

const BeneficiaryRow: React.FC<BeneficiaryRowProps> = ({
  beneficiary,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onRemove,
}) => {
  const rowTestId = buildTestId('beneficiary-file-upload-row', beneficiary.id);
  // Map beneficiary status to Label props
  const getStatusLabelProps = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          text: 'Account verified',
          paletteColor: 'success' as const,
        };
      case 'partially-verified':
        return {
          text: 'Account partially verified',
          paletteColor: 'warning' as const,
        };
      case 'not-verified':
        return {
          text: 'Account not verified',
          paletteColor: 'info' as const,
        };
      case 'invalid':
        return {
          text: 'INVALID BENEFICIARY',
          paletteColor: 'error' as const,
        };
      case 'duplicate':
        return {
          text: 'DUPLICATE BENEFICIARY',
          paletteColor: 'error' as const,
        };
      default:
        return {
          text: status,
          paletteColor: undefined,
        };
    }
  };

  const statusProps = getStatusLabelProps(beneficiary.status);
  const isErrorStatus = beneficiary.status === 'invalid' || beneficiary.status === 'duplicate';
  const isRecordInvalid = beneficiary.recordType === 'invalid' || beneficiary.recordType === 'error';
  const isRecordDuplicate = beneficiary.recordType === 'duplicate';
  const isBlockedRecord = isRecordInvalid || isRecordDuplicate;

  return (
    <div
      className={`${styles.row} ${isExpanded ? styles.expanded : ''} ${isSelected ? styles.selected : ''}`}
      style={isBlockedRecord ? { borderColor: '#E31E46', borderWidth: '2px' } : undefined}
      data-testid={rowTestId}
    >
      {/* Main Row */}
      <div className={styles.mainRow}>
        {/* Checkbox */}
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={isSelected}
          onChange={() => !isBlockedRecord && onToggleSelect(beneficiary.id)}
          disabled={isBlockedRecord}
          data-testid={buildTestId(rowTestId, 'select-checkbox')}
        />

        {/* Name */}
        <span className={styles.name} data-testid={buildTestId(rowTestId, 'name')}>
          {beneficiary.name}
        </span>

        {/* Status Badge - Show warning for blocked records only */}
        <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
          {isBlockedRecord && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Image src={IcnWarningOutline} alt="Warning" width={24} height={24} />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#E31E46',
                textTransform: 'uppercase'
              }}>
                {isRecordInvalid ? 'INVALID BENEFICIARY' : 'DUPLICATE BENEFICIARY'}
              </span>
            </div>
          )}
        </div>

        {/* Account Number Dropdown */}
        <div className={styles.accountSelect}>
          <span className={styles.accountLabel}>Account number: {beneficiary.accountNumber}</span>
        </div>

        <button
          className={styles.expandButton}
          onClick={() => onToggleExpand(beneficiary.id)}
          data-testid={buildTestId(rowTestId, isExpanded ? 'collapse-button' : 'expand-button')}
        >
          <Image
            src={isExpanded ? ColIconUp : ColIconDown}
            alt={isExpanded ? 'Collapse' : 'Expand'}
            width={20}
            height={20}
          />
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={styles.expandedContent}>
          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            {/* Left Column */}
            <div className={styles.detailsColumn}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Beneficiary code</span>
                <span className={styles.detailValue}>
                  {beneficiary.beneficiaryCode || '[Beneficiary code]'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Bank name</span>
                <span className={styles.detailValue}>{beneficiary.bankName || '[Bank name]'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>CDI number</span>
                <span className={styles.detailValue}>
                  {beneficiary.cdiNumber || '[CDI number]'}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.detailsColumn}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Beneficiary Reference</span>
                <span className={styles.detailValue}>
                  {beneficiary.beneficiaryReference || '[Beneficiary reference]'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>IBAN</span>
                <span className={styles.detailValue}>{beneficiary.iban || '-'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Transaction limit and currency</span>
                <span className={styles.detailValue}>
                  {beneficiary.transactionLimit || '[XXX, xxx, xxxx, xxx]'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.removeSection} style={{ display: 'flex', justifyContent: (isBlockedRecord && beneficiary.declineReason && beneficiary.declineReason !== '-') ? 'space-between' : 'flex-end', alignItems: 'center', gap: '12px', paddingTop: '12px' }}>
            {isBlockedRecord && beneficiary.declineReason && beneficiary.declineReason !== '-' ? (
              <span style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#E31E46',
                flex: 1,
              }}>
                {beneficiary.declineReason}
              </span>
            ) : null}
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={IcnBin} alt="Remove" width={24} height={24} />}
              onClick={() => onRemove(beneficiary.id)}
              data-testid={buildTestId(rowTestId, 'remove-button')}
              style={{
                height: '36px',
                minHeight: '36px',
                width: '113px',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              REMOVE
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryRow;
