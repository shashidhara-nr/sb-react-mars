'use client';

import { useTranslations } from 'next-intl';
import styles from './SFIUploads.module.scss';
import {
  Grid,
  Box,
  Typography,
  TextField,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { BreadcrumbList } from 'components/lib/Page/Breadcrumb';
import { Heading } from 'components/lib/Page';
import { Button } from 'dist/standard-bank-react';
import DragDropFileUpload from 'components/molecules/DragDropFileUpload';
import CancellationConfirmationDialog from 'components/common/CancellationConfirmationDialog';
import { useCallback, useState } from 'react';
import Image from 'next/image';
import CloseIcon from '@mui/icons-material/Close';
import { useRouter } from 'next/navigation';
import IcnFileUpload from 'public/icons/col-icon-upload.svg';
import IcnFileUploadRed from 'public/icons/col-icon-upload-red.svg';
import IcnSourceFile from 'public/icons/icn_document_up.svg';
import IcnInfo from 'public/icons/icn_info_circle.svg';
import IcnCancel from 'public/icons/icn_cancel.svg';
import IcnList from 'public/icons/col-icon-list.svg';
import IcnPlus from 'public/icons/col-icon-plus.svg';
import IcnCloseCircleBlue from 'assets/icons/icn_close_circle_blue.svg';
import IcnDocumentPdf from 'assets/icons/icn_document_pdf.svg';
import IcnDocumentXls from 'assets/icons/icn_document_xls.svg';
import IcnDocumentCsv from 'assets/icons/icn_document_csv.svg';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import AvatarAlertSuccess from 'public/icons/avatar_alert_success.svg';
import { buildTestId } from 'src/utils/testIds';

type FileWithProgress = {
  file: File;
  error?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
};

const SFIUploadNewFile = () => {
  const t = useTranslations('sfiUploads');
  const router = useRouter();
  const testIdPrefix = 'sfi-upload-new-file';
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [destination, setDestination] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [destinationError, setDestinationError] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });
  const [submittedFiles, setSubmittedFiles] = useState<string[]>([]);

  const ALLOWED_EXTENSIONS = ['.xlsx', '.csv', '.txt', '.pdf'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const getFileIcon = (fileName: string) => {
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case '.pdf':
        return IcnDocumentPdf;
      case '.xlsx':
        return IcnDocumentXls;
      case '.csv':
        return IcnDocumentCsv;
      default:
        return IcnFileUpload;
    }
  };

  const validateFile = (file: File): string | undefined => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds maximum size of 10 MB`;
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return `Unable to upload file. Please upload a .pdf, .doc or .docx file type`;
    }

    return undefined;
  };

  const handleDragDropFilesSelect = useCallback(
    (newFiles: FileWithProgress[]) => {
      setFiles((prev) => [...prev, ...newFiles]);
      setUploadError(false);
    },
    []
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const simulateFileUpload = useCallback(
    (index: number) => {
      setFiles((prev) => {
        const updated = [...prev];
        if (updated[index]) {
          updated[index].status = 'uploading';
        }
        return updated;
      });

      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 40;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setFiles((prev) => {
            const updated = [...prev];
            if (updated[index]) {
              updated[index].progress = 100;
              updated[index].status = 'success';
            }
            return updated;
          });
        } else {
          setFiles((prev) => {
            const updated = [...prev];
            if (updated[index]) {
              updated[index].progress = progress;
            }
            return updated;
          });
        }
      }, 500);
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    const validFiles = files.filter((f) => !f.error && f.file);
    let hasError = false;

    if (validFiles.length === 0) {
      setUploadError(true);
      hasError = true;
    } else {
      setUploadError(false);
    }

    if (!destination) {
      setDestinationError(true);
      hasError = true;
    } else {
      setDestinationError(false);
    }

    if (hasError) {
      return;
    }

    // Simulate file upload
    validFiles.forEach((fileItem, index) => {
      const fileIndex = files.indexOf(fileItem);
      simulateFileUpload(fileIndex);
    });

    // After all uploads complete, show success
    setTimeout(() => {
      setSubmittedFiles(validFiles.map((f) => f.file.name));
      setSuccessDialogOpen(true);
      setFiles([]);
      setDestination('');
    }, 3000);
  }, [files, destination, simulateFileUpload]);

  const handleCancel = useCallback(() => {
    if (files.length > 0) {
      setCancelDialogOpen(true);
    } else {
      router.back();
    }
  }, [files.length, router]);

  const handleCancelConfirm = useCallback(() => {
    setCancelDialogOpen(false);
    router.back();
  }, [router]);

  const handleUploadAnother = useCallback(() => {
    setSuccessDialogOpen(false);
    setFiles([]);
    setDestination('');
  }, []);

  const breadcrumbLinks = [
    { href: '/', label: t('dashboard') },
    { href: '/sfi-upload', label: t('fileUpload') },
    ...(submittedFiles.length > 0
      ? [{ href: '/sfi-upload/upload-new-file', label: t('uploadNewFile') }]
      : []),
  ];

  // Success Screen
  if (submittedFiles.length > 0 && successDialogOpen) {
    return (
      <section className={styles.container}>
        <BreadcrumbList links={breadcrumbLinks} />
        <Grid size={12} className={styles.headerRow}>
          <Heading as="h4" fontSize="28px">
            {t('uploadNewFile')}
          </Heading>
        </Grid>

        <Box className={styles.successScreen}>
          <Image src={AvatarAlertSuccess} alt="Success" width={80} height={80} />
          <Typography component="h2" className={styles.successHeading}>
            {t('success')}
          </Typography>
          <Typography className={styles.successText}>
            {t('uploadSuccessMessage')}
          </Typography>
          <Typography className={styles.successText}>
            {t('validationTimeNote')}
          </Typography>
          <Typography className={styles.successFilename}>
            {t('sfiFile')}
          </Typography>
          <Typography className={styles.successFilenameValue}>
            [{submittedFiles.join(', ')}]
          </Typography>
        </Box>
        <Box className={styles.successButtonsContainer}>
            <Button
              buttonVariant="tertiary"
              data-testid={buildTestId(testIdPrefix, 'success-button', 'go-to-list')}
              aria-label="Go to SFI uploads list"
              onClick={() => router.push('/sfi-upload')}
              startIcon={<Image src={IcnList} alt="List" width={24} height={24} />}
            >
              {t('goToSFIUploadsList')}
            </Button>
            <Button
              buttonVariant="primary"
              data-testid={buildTestId(testIdPrefix, 'success-button', 'upload-another')}
              aria-label="Upload another file"
              onClick={handleUploadAnother}
              startIcon={<Image src={IcnPlus} alt="Plus" width={24} height={24} />}
              style={{ height: '48px' }}
            >
              {t('uploadAnotherFile')}
            </Button>
          </Box>
      </section>
    );
  }

  // Main Upload Form
  return (
    <section className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />
      <Grid size={12} className={styles.headerRow}>
        <Heading as="h4" fontSize="28px">
          {t('sfiUploads')}
        </Heading>
      </Grid>

      <Box className={styles.uploadFormWrapper}>
        <Box className={styles.uploadFormContent}>
          {/* File Upload Zone */}
          <Box className={styles.uploadZone}>
            <Box className={styles.sourceFileHeader}>
              <Image src={IcnSourceFile} alt="Source File" width={28} height={28} />
              <Typography className={styles.sourceFileTitle}>
                {t('sourceFile')}
              </Typography>
            </Box>

            <Box className={styles.sourceFileHeaderDivider} />

            <Alert
              severity="info"
              variant="standard"
              icon={<Image src={IcnInfo} alt="Info" width={20} height={20} />}
              sx={{
                backgroundColor: '#FFFFFF',
                fontWeight: 400,
                fontSize: '16px !important',
                padding: 0,
                paddingBottom: '10px',
                '& .MuiAlert-message': {
                  fontSize: '16px !important',
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography sx={{ fontSize: '16px', fontWeight: 400 }}>{t('acceptedFileFormats')}</Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 400 }}>{t('maxFileSize')}</Typography>
              </Box>
            </Alert>

            {/* Drag & Drop Zone */}
            <DragDropFileUpload
              data-testid={buildTestId(testIdPrefix, 'dropzone')}
              allowedExtensions={ALLOWED_EXTENSIONS}
              maxFileSize={MAX_FILE_SIZE}
              uploadIcon={IcnFileUpload}
              uploadIconError={IcnFileUploadRed}
              onFilesSelect={handleDragDropFilesSelect}
              showError={uploadError}
              className={styles.dragDropZone}
              dragFileLabel={t('dragFile')}
              dragFileOrLabel={t('dragFileOr')}
              dragFileClickHereLabel={t('dragFileClickHere')}
              dragFileToUploadLabel={t('dragFileToUpload')}
              errorMessage={t('pleaseUploadAFile')}
            />

            {/* File List */}
            {files.length > 0 && (
              <Box className={styles.fileListContainer}>
                {files.map((fileItem, index) => (
                  <Box key={index} className={styles.fileListItem}>
                    <Image src={getFileIcon(fileItem.file.name)} alt="File" width={24} height={24} />
                    <Box className={styles.fileListItemContent}>
                      <Typography className={styles.fileListItemName}>
                        {fileItem.file.name}
                      </Typography>
                      {fileItem.error && (
                        <Typography className={styles.fileListItemError}>
                          {fileItem.error}
                        </Typography>
                      )}
                      {fileItem.status === 'uploading' && (
                        <LinearProgress
                          variant="determinate"
                          value={fileItem.progress}
                          sx={{ mt: 1 }}
                        />
                      )}
                      {fileItem.status === 'success' && (
                        <Typography className={styles.fileListItemSuccess}>
                          {t('uploadSuccessful')}
                        </Typography>
                      )}
                    </Box>
                    {fileItem.status !== 'uploading' && (
                      <IconButton
                        data-testid={buildTestId(testIdPrefix, 'button', 'remove-file', index)}
                        aria-label={`Remove file: ${fileItem.file.name}`}
                        size="small"
                        onClick={() => removeFile(index)}
                        sx={{ color: '#757575' }}
                      >
                        <Image src={IcnCloseCircleBlue} alt="Remove" width={20} height={20} />
                      </IconButton>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          {/* Destination Dropdown */}
          <Box className={styles.fileDestinationField}>
            <TextField
              data-testid={buildTestId(testIdPrefix, 'dropdown', 'destination')}
              select
              fullWidth
              label={t('destination')}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setDestinationError(false);
              }}
              error={destinationError}
              helperText={destinationError ? t('pleaseSelectADestination') : ''}
              SelectProps={{
                native: true,
              }}
              sx={{
                '& .MuiSelect-select': {
                  py: 2,
                },
              }}
            >
              {/* TODO: Replace with actual destination options */}
              <option value=""></option>
              <option value="Destination1">Destination1</option>
            </TextField>
          </Box>
        </Box>
        {/* Action Buttons */}
          <Box className={styles.actionButtonsContainer}>
            <Button
              buttonVariant="tertiary"
              data-testid={buildTestId(testIdPrefix, 'button', 'cancel')}
              aria-label="Cancel file upload"
              onClick={handleCancel}
              startIcon={<Image src={IcnCancel} alt="Cancel" width={24} height={24} />}
              style={{padding: 0}}
            >
              {t('cancel')}
            </Button>
            <Button
              buttonVariant="primary"
              data-testid={buildTestId(testIdPrefix, 'button', 'submit')}
              aria-label="Submit file for approval"
              onClick={handleSubmit}
              startIcon={<span >→</span>}
              style={{padding: '0px 16px', color: '#FFFFFF'}}
            >
              {t('submitFileForApproval')}
            </Button>
          </Box>
      </Box>

      {/* Cancel Confirmation Dialog */}
      <CancellationConfirmationDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onDismiss={() => setCancelDialogOpen(false)}
        onCancel={handleCancelConfirm}
        title={t('cancellationConfirmation')}
        heading={t('areYouSureYouWantToCancel')}
        subheading={t('unsavedChangesWillBeLost')}
        dismissLabel={t('dismiss')}
        cancelLabel={t('yesCancelRequest')}
      />

      {/* Error Dialog */}
      <CancellationConfirmationDialog
        open={errorDialog.open}
        onClose={() => setErrorDialog({ ...errorDialog, open: false })}
        onDismiss={() => setErrorDialog({ ...errorDialog, open: false })}
        onCancel={() => setErrorDialog({ ...errorDialog, open: false })}
        title={t('systemError')}
        heading={t('somethingWentWrong')}
        subheading={t('pleaseContactBank')}
        dismissLabel={t('cancel')}
        cancelLabel={t('tryAgain')}
      />
    </section>
  );
};

export default SFIUploadNewFile;
