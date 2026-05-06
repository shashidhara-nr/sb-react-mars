'use client';
 
import { Box, Grid, Typography, Snackbar, Alert } from '@mui/material';
import { Heading } from 'dist/standard-bank-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import Image from 'next/image';
import DownloadIcon from 'public/icons/col-icon-download.svg';
import styles from './MyBills.module.scss';
import { buildTestId } from 'src/utils/testIds';
import { useTranslations } from 'next-intl';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Button } from 'components/lib/Forms';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
 
const MyBillsDetails = () => {
  const t = useTranslations('myBills');
  const testIdPrefix = 'bill-details';
  const searchParams = useSearchParams();
  const router = useRouter();
 
  /**
   * ✅ Toast state (ADDED)
   */
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
 
  const details = useMemo(
    () => ({
      billerId: searchParams?.get('billerId') || '-',
      billerName: searchParams?.get('billerName') || '-',
      country: searchParams?.get('country') || '-',
      dueDate: searchParams?.get('dueDate') || '-',
      reference: searchParams?.get('reference') || '-',
      status: searchParams?.get('status') || '-',
    }),
    [searchParams],
  );
 
  const breadcrumbLinks = useMemo(
    () => [
      { href: '/', label: t('dashboard') },
      { href: '/my-bills', label: t('myBills') },
      { href: '/my-bills/details', label: t('myBillsDetails') },
    ],
    [t],
  );
 
  /**
   * ✅ EXISTING DOWNLOAD LOGIC (UNCHANGED)
   */
  const handleDownload = useCallback(() => {
    const fileContent = [
      `Bill ID: ${details.billerId}`,
      `Biller name: ${details.billerName}`,
      `Country / region: ${details.country}`,
      `Due date: ${details.dueDate}`,
      `Reference name: ${details.reference}`,
      `Status: ${details.status}`,
    ].join('\n');
 
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bill-details-${String(details.billerId).replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, [details]);
 
  /**
   * ✅ Toast + Download trigger (ADDED)
   */
  const triggerDownloadWithToast = () => {
    // Red toast first
    setTimeout(() => {
    setToast({
      open: true,
      message: 'Download unsuccessful',
      severity: 'error',
    });
}, 1000);
    // Perform download
    // handleDownload();
 
    // Green toast after delay
    setTimeout(() => {
      setToast({
        open: true,
        message: 'Download successful',
        severity: 'success',
      });
    }, 3000);
  };
 
  return (
    <Grid container spacing={4} className={styles.billDetailsPage}>
      <Grid size={12}>
        <BreadcrumbList
          data-testid={buildTestId(testIdPrefix, 'breadcrumbs')}
          links={breadcrumbLinks}
        />
      </Grid>
 
      <Grid size={12}>
        <Heading as="h4" fontSize="36px" data-testid={buildTestId(testIdPrefix, 'heading')}>
          My bill details
        </Heading>
      </Grid>
 
      <Grid size={12}>
        <Box className={styles.billDetailsCard}>
          <Box className={styles.billDetailsCardHeader}>
            <Typography className={styles.billDetailsCardTitle}>
              Account group details
            </Typography>
 
            <Box
              role="button"
              tabIndex={0}
              className={styles.billDetailsDownloadLink}
              onClick={triggerDownloadWithToast}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  triggerDownloadWithToast();
                }
              }}
              data-testid={buildTestId(testIdPrefix, 'download')}
            >
              <Image src={DownloadIcon} alt="download" width={16} height={16} />
              DOWNLOAD
            </Box>
          </Box>
 
          <Grid container spacing={3} className={styles.billDetailsGrid}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className={styles.billDetailsItem}>
                <Typography className={styles.billDetailsLabel}>Bill ID</Typography>
                <Typography className={styles.billDetailsValue}>{details.billerId}</Typography>
              </Box>
            </Grid>
 
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className={styles.billDetailsItem}>
                <Typography className={styles.billDetailsLabel}>Biller name</Typography>
                <Typography className={styles.billDetailsValue}>{details.billerName}</Typography>
              </Box>
            </Grid>
 
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className={styles.billDetailsItem}>
                <Typography className={styles.billDetailsLabel}>Country/region</Typography>
                <Typography className={styles.billDetailsValue}>{details.country}</Typography>
              </Box>
            </Grid>
 
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className={styles.billDetailsItem}>
                <Typography className={styles.billDetailsLabel}>Due date</Typography>
                <Typography className={styles.billDetailsValue}>{details.dueDate}</Typography>
              </Box>
            </Grid>
 
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className={styles.billDetailsItem}>
                <Typography className={styles.billDetailsLabel}>Reference name</Typography>
                <Typography className={styles.billDetailsValue}>{details.reference}</Typography>
              </Box>
            </Grid>
 
            <Grid size={{ xs: 12, md: 4 }}>
              <Box className={styles.billDetailsItem}>
                <Typography className={styles.billDetailsLabel}>Status</Typography>
                <Typography className={styles.billDetailsValue}>{details.status}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Grid>
 
      <Grid size={12} display="flex" justifyContent="space-between">
        <Button buttonVariant="secondary" onClick={() => router.push('/my-bills')} style={{ width: '130px' }}>
          Back
        </Button>
 
        <Button
          buttonVariant="primary"
          onClick={() => router.push(`/my-bills/details/pay?billerId=${details.billerId}` as any)}
          startIcon={<ArrowForwardIcon />}
          style={{ width: '130px' }}
        >
          Pay
        </Button>
      </Grid>
 
      {/* ✅ Toast UI (ADDED) */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ borderRadius: '8px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};
 
export default MyBillsDetails;
 