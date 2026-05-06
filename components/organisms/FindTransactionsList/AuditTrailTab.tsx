'use client';

import { useMemo, useRef, useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from './TransactionDetails.module.scss';
import TableWithTab from '@molecules/TableWithTab';
import { ListRightPanelActions } from 'components/common';
import { AUDIT_COLUMNS, AUDIT_HEAD_CELL_CONFIG } from './constant';
import { mockAuditTrail } from '@lib/mock/mockPaymentsList';

const AuditTrailTab = () => {
  const t = useTranslations('findTransaction');
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const tableHeadCells = useMemo(
    () => AUDIT_HEAD_CELL_CONFIG.map((cell) => ({
      ...cell,
      label: t(cell.labelKey),
    })),
    [t],
  );

  /* Table data (unchanged) */
  const tableData = useMemo(
    () => ({
      columns: AUDIT_COLUMNS,
      headCells: tableHeadCells,
      rows: mockAuditTrail,
      rowVariant: 'default',
      rowCount: mockAuditTrail.length,
      pageSize: 15,
    }),
    [tableHeadCells],
  );

  /* Download logic unchanged */
  const handleDownload = useCallback(() => {
    const csv =
      `${t('username')},${t('eventType')},${t('description')},${t('dateTime')}\n` +
      mockAuditTrail
        .map(
          (r) =>
            `${r.userName},${r.eventType},"${r.description}",${r.dateTime}`,
        )
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'audit-trail.csv';
    link.click();
  }, [t]);
  
  const rightPanelButtons = useMemo(() => {
    return (
      <div className={styles.auditRightPanel}>
        <ListRightPanelActions
          selectedCount={mockAuditTrail.length}
          onDownloadClick={handleDownload}
          hasFilters={false}
        />
      </div>
    );
  }, [mockAuditTrail, handleDownload]);

  return (
    <section ref={tableContainerRef}>
      <div className={styles.auditTableWrapper}>
        <TableWithTab 
          tableData={tableData} 
          selectedRows = {mockAuditTrail} 
          filterButtons={[]}
          onCheckboxClick={() => {}}
          onRowClick={(rowData: any) => console.log('rowData', rowData)}
          rightPanelButtons={rightPanelButtons}
          onPageChange={() => {}}
          onPerPageChange={() => {}}
          onQuickLinkClick={() => {}}
        />

      </div>
    </section>
  );
};

export default AuditTrailTab;