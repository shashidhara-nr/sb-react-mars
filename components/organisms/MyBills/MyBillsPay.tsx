
'use client';

import React, { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Grid } from '@mui/material';
import { Heading } from 'dist/standard-bank-react';
import { buildTestId } from 'src/utils/testIds';
import BreadcrumbList from 'components/lib/Page/Breadcrumb';
import styles from './MyBills.module.scss';
import SourceFile from '@molecules/MybillsSourceFile/SourceFile';
 
const MyBillsPay = () => {
const t = useTranslations('myBills');
  const router = useRouter();
  const testIdPrefix = 'mybills-pay-a-bill';
 
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/my-bills', label: t('myBills') },
      { href: '/my-bills/details', label: t('myBillsDetails') },
      { href: '/my-bills/details/pay', label: t('myBillsPay') }
    ],
    [t],
  );
 
  return (
    <Grid
      container
      direction="column"
      minHeight="100vh"
      className={styles.pageContainer}
      data-testid={buildTestId(testIdPrefix, 'container')}
    >
      {/* ================= Header ================= */}
      <Grid>
        <BreadcrumbList
          data-testid={buildTestId(testIdPrefix, 'breadcrumb')}
          links={breadcrumbLinks}
        />
 
        <Heading
          as="h4"
          fontSize="28px"
          data-testid={buildTestId(testIdPrefix, 'page-heading')}
        >
          {t('payABill')}
        </Heading>
      </Grid>
 
      {/* ================= Content ================= */}
      <Grid>
     
        <SourceFile
          data-testid={buildTestId(testIdPrefix, 'source-file')}
        />
      </Grid>
    </Grid>
  );
};
 
export default MyBillsPay;
 
