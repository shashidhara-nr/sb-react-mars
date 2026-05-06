'use client';

import { DebtorRowProps } from './types';
import styles from './DebtorsRow.module.scss';
import Image from 'next/image';
import IcnBin from 'public/icons/icn_bin.svg';
import ColIconDown from 'public/icons/col-icon-down.svg';
import ColIconUp from 'public/icons/col-icon-up.svg';
import IcnWarningOutline from 'public/icons/icn_warning_outline.svg';
import { Button, StatusLabel } from 'dist/standard-bank-react';

const DebtorsRow: React.FC<DebtorRowProps> = ({
  debtor,
  isSelected,
  isExpanded,
  onToggleSelect,
  onToggleExpand,
  onRemove,
}) => {
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
          text: 'INVALID DEBTOR',
          paletteColor: 'error' as const,
        };
      case 'duplicate':
        return {
          text: 'DUPLICATE DEBTOR',
          paletteColor: 'error' as const,
        };
      default:
        return {
          text: status,
          paletteColor: undefined,
        };
    }
  };

  const statusProps = getStatusLabelProps(debtor.status);
  const isErrorStatus = debtor.status === 'invalid' || debtor.status === 'duplicate';

  return (
    <div
      className={`${styles.row} ${isExpanded ? styles.expanded : ''} ${isSelected ? styles.selected : ''}`}
      style={isErrorStatus ? { borderColor: '#E31E46' } : undefined}
    >
      {/* Main Row */}
      <div className={styles.mainRow}>
        {/* Checkbox */}
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={isSelected}
          onChange={() => onToggleSelect(debtor.id)}
          disabled={isErrorStatus}
        />

        {/* Name */}
        <span className={styles.name}>{debtor.name}</span>

        {/* Status Badge - Using Label Component for verified/partially-verified/not-verified, icon+text for invalid/duplicate */}
        <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
          {debtor.status === 'invalid' || debtor.status === 'duplicate' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Image src={IcnWarningOutline} alt="Warning" width={24} height={24} />
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#E31E46',
                textTransform: 'uppercase'
              }}>
                {debtor.status === 'invalid' ? 'INVALID DEBTOR' : 'DUPLICATE DEBTOR'}
              </span>
            </div>
          ) : (
            <StatusLabel text={statusProps.text} paletteColor={statusProps.paletteColor} />
          )}
        </div>

        {/* Divider Line */}
        <div style={{ 
          width: '1px', 
          height: '24px', 
          backgroundColor: '#0051FF',
          flexShrink: 0
        }} />

        {/* Account Number Dropdown */}
        <div className={styles.accountSelect}>
          <span className={styles.accountLabel}>Account number: {debtor.accountNumber}</span>
        </div>

        <button className={styles.expandButton} onClick={() => onToggleExpand(debtor.id)}>
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
          {/* Error Messages - Show if debtor has errors */}
          {debtor.rawData?.issueLogTO?.issues && debtor.rawData.issueLogTO.issues.length > 0 && (
            <div style={{
              backgroundColor: '#FEF2F4',
              border: '1px solid #E31E46',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                marginBottom: '8px',
              }}>
                <Image src={IcnWarningOutline} alt="Warning" width={20} height={20} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#E31E46',
                }}>
                  {debtor.rawData.issueLogTO.issues.length === 1 ? 'Issue Found' : `${debtor.rawData.issueLogTO.issues.length} Issues Found`}
                </span>
              </div>
              <div style={{
                paddingLeft: '28px',
              }}>
                {debtor.rawData.issueLogTO.issues.map((issue: any, index: number) => (
                  <div key={index} style={{
                    fontSize: '13px',
                    color: '#E31E46',
                    marginBottom: index < debtor.rawData.issueLogTO.issues.length - 1 ? '4px' : '0',
                  }}>
                    • {issue.message}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            {/* Left Column */}
            <div className={styles.detailsColumn}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Debtor code</span>
                <span className={styles.detailValue}>
                  {debtor.debtorCode || '[Debtor code]'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Bank name</span>
                <span className={styles.detailValue}>{debtor.bankName || '[Bank name]'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>CDI number</span>
                <span className={styles.detailValue}>
                  {debtor.cdiNumber || '[CDI number]'}
                </span>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.detailsColumn}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Debtor Reference</span>
                <span className={styles.detailValue}>
                  {debtor.debtorReference || '[Debtor reference]'}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>IBAN</span>
                <span className={styles.detailValue}>{debtor.iban || 'XXXXXXXX'}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Transaction limit and currency</span>
                <span className={styles.detailValue}>
                  {debtor.transactionLimit || '[XXX, xxx, xxxx, xxx]'}
                </span>
              </div>
            </div>
          </div>

          {/* Separator Line + Remove Button at Bottom Right */}
          <div className={styles.removeSection} style={{ display: 'flex', justifyContent: (isErrorStatus && debtor.declineReason && debtor.declineReason !== '-') ? 'space-between' : 'flex-end', alignItems: 'center', gap: '12px', paddingTop: '12px' }}>
            {isErrorStatus && debtor.declineReason && debtor.declineReason !== '-' ? (
              <span style={{
                fontSize: '14px',
                fontWeight: 400,
                color: '#E31E46',
                flex: 1,
              }}>
                {debtor.declineReason}
              </span>
            ) : null}
            <Button
              buttonVariant="tertiary"
              startIcon={<Image src={IcnBin} alt="Remove" width={24} height={24} />}
              onClick={() => onRemove(debtor.id)}
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

export default DebtorsRow;
