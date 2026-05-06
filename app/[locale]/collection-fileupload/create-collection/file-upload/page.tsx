'use client';
 
import { useRouter } from 'next/navigation';
import { Breadcrumb, Heading } from 'dist/standard-bank-react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from 'react';
import { buildTestId } from 'src/utils/testIds';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { Button, Select } from 'dist/standard-bank-react';
import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import PaperStack from 'public/icons/icn_paper_stack.svg';
import { Uploader } from 'dist/standard-bank-react';
import { useTranslations } from 'next-intl';
type ModalKind =
  | null
  | 'overwriteWarning'
  | 'dataErrorsDetected'
  | 'submissionWarning'
  | 'correctionSuccess';
 
interface UploadedFileState {
  name: string;
  status: 'uploading' | 'uploaded';
  progress: number;
  hasErrors: boolean;
  corrected: boolean;
}
 
interface AlertModalProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
}
 
function AlertModal({ title, icon, children, actions, onClose }: AlertModalProps) {
  return (
    <Paper sx={{ width: '560px', borderRadius: '10px', overflow: 'hidden' }}>
      <Box
        sx={{
          height: '48px',
          bgcolor: '#0a43d6',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>{title}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: '#fff' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
 
      <DialogContent sx={{ px: 4, py: 3.5 }}>
        <Stack spacing={2.5} alignItems="center">
          {icon}
          <Box sx={{ width: '100%', textAlign: 'center' }}>{children}</Box>
        </Stack>
      </DialogContent>
 
      <Box sx={{ px: 3, py: 2, borderTop: '1px solid #eceef3', display: 'flex', justifyContent: 'space-between' }}>
        {actions}
      </Box>
    </Paper>
  );
}
 
function Page() {
  const testIdPrefix = 'payment-file-upload-page';
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileState | null>(null);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [modalKind, setModalKind] = useState<ModalKind>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState('');
  const [format, setFormat] = useState('Populated');
  const [paymentType, setPaymentType] = useState('Populated');
  const t = useTranslations('collectionsfileupload');
  const handleSelectFieldChange = useCallback((fieldName: string, value: string | number) => {
    if (fieldName === 'format') setFormat(String(value));
    if (fieldName === 'paymentType') setPaymentType(String(value));
  
  }, []);
 
  const handleCancel = useCallback(() => {
    router.push('/collection-fileupload' as any);
  }, [router]);
 
  const clearUploadTimer = useCallback(() => {
    if (uploadTimerRef.current) {
      clearInterval(uploadTimerRef.current);
      uploadTimerRef.current = null;
    }
  }, []);
 
  const beginUpload = useCallback(
    (file: File, overwriteCurrent = false) => {
      if (!overwriteCurrent && uploadedFile && uploadedFile.name === file.name) {
        setPendingFile(file);
        setModalKind('overwriteWarning');
        return;
      }
 
      clearUploadTimer();
      setUploadErrorMessage('');
      setUploadedFile({
        name: file.name,
        status: 'uploading',
        progress: 8,
        hasErrors: false,
        corrected: false,
      });
 
      uploadTimerRef.current = setInterval(() => {
        setUploadedFile((prev) => {
          if (!prev) return prev;
          const nextProgress = Math.min(prev.progress + 20, 100);
          if (nextProgress >= 100) {
            clearUploadTimer();
            const hasErrors = /error|invalid|failed/i.test(file.name);
            if (hasErrors) {
              setTimeout(() => setModalKind('dataErrorsDetected'), 250);
            }
            return {
              ...prev,
              status: 'uploaded',
              progress: 100,
              hasErrors,
              corrected: false,
            };
          }
          return { ...prev, progress: nextProgress };
        });
      }, 250);
    },
    [clearUploadTimer, uploadedFile],
  );
 
  const handleSelectedFile = useCallback(
    (file?: File) => {
      if (!file) return;
      const validExtensions = ['pdf', 'doc', 'docx'];
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !validExtensions.includes(extension)) {
        setUploadErrorMessage('Unable to upload file. Please upload a .pdf, .doc or .docx file type.');
        return;
      }
      beginUpload(file);
    },
    [beginUpload],
  );
 
  const triggerFilePicker = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
 
  const handleReviewAndSubmit = useCallback(() => {
    if (!uploadedFile || uploadedFile.status !== 'uploaded') return;
    if (uploadedFile.hasErrors && !uploadedFile.corrected) {
      setModalKind('submissionWarning');
      return;
    }
    setShowSuccessState(true);
  }, [uploadedFile]);
 
  const modalOpen = modalKind !== null;
 
  const uploadedStatusText = useMemo(() => {
    if (!uploadedFile) return '';
    if (uploadedFile.status === 'uploading') return 'Uploading...';
    if (uploadedFile.hasErrors && !uploadedFile.corrected) return 'Upload completed with errors';
    return 'Upload successful';
  }, [uploadedFile]);
 
  const renderModalBody = () => {
    if (!modalKind) return null;
 
   if (modalKind === 'overwriteWarning') {
  return (
    <AlertModal
      title="File overwrite warning"
      onClose={() => setModalKind(null)}
      icon={<ErrorOutlineIcon sx={{ color: '#d74f4f', fontSize: 56 }} />}
      actions={
        <>
          <Button buttonVariant="text" onClick={() => setModalKind(null)}>
            CANCEL
          </Button>
          <Button
            buttonVariant="text"
            onClick={() => {
              const fileToUpload = pendingFile;
              setPendingFile(null);
              setModalKind(null);
              if (fileToUpload) beginUpload(fileToUpload, true);
            }}
          >
            OVERWRITE FILE
          </Button>
        </>
      }
    >
      <Typography
        sx={{
          color: '#2d3748',
          fontSize: '18px',
          lineHeight: 1.35,
          textAlign: 'center',
        }}
      >
        You are attempting to upload a duplicate file, which will overwrite the previous version of it.
      </Typography>

      <Typography
        sx={{
          color: '#2d3748',
          fontSize: '18px',
          lineHeight: 1.35,
          textAlign: 'center',
          mt: 1,
        }}
      >
        Are you sure you want to overwrite the existing file?
      </Typography>
    </AlertModal>
  );
}

 
if (modalKind === 'dataErrorsDetected') {
  return (
    <AlertModal
      title="File data errors detected"
      onClose={() => setModalKind(null)}
      icon={<ErrorOutlineIcon sx={{ color: '#d74f4f', fontSize: 56 }} />}
      actions={
        <Button buttonVariant="text" onClick={() => setModalKind(null)}>
          CLOSE
        </Button>
      }
    >
      <Typography
        sx={{
          color: '#2d3748',
          fontSize: '18px',
          lineHeight: 1.35,
          textAlign: 'center',
        }}
      >
       The following data formatting errors have been found within the file you&apos;ve uploaded.
      </Typography>

      <Box sx={{ mt: 1.5, mb: 1 }}>
        <ol style={{ paddingLeft: '20px', margin: 0 }}>
          <li>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.5 }}>
              Malesuada pellentesque elit eget gravida.
            </Typography>
          </li>
          <li>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.5 }}>
              Sem et tortor consequat id porta.
            </Typography>
          </li>
          <li>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.5 }}>
              Eget mauris pharetra et ultrices.
            </Typography>
          </li>
          <li>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.5 }}>
              Viverra nibh cras pulvinar mattis nunc sed blandit libero volutpat.
            </Typography>
          </li>
        </ol>
      </Box>

      <Typography
        sx={{
          color: '#2d3748',
          fontSize: '18px',
          lineHeight: 1.35,
          textAlign: 'center',
        }}
      >
        Please fix these errors and try again.
      </Typography>
    </AlertModal>
  );
}
 
    if (modalKind === 'submissionWarning') {
  return (
    <AlertModal
      title="Collection submission warning"
      onClose={() => setModalKind(null)}
      icon={<ErrorOutlineIcon sx={{ color: '#d74f4f', fontSize: 56 }} />}
      actions={
        <>
          <Button buttonVariant="text" onClick={() => setModalKind(null)}>
            CLOSE
          </Button>
          <Button
            buttonVariant="text"
            onClick={() => {
              setModalKind('correctionSuccess');
              setUploadedFile((prev) =>
                prev ? { ...prev, corrected: true } : prev,
              );
            }}
          >
            RELOAD THE FILE
          </Button>
        </>
      }
    >
      <Typography
        sx={{
          color: '#2d3748',
          fontSize: '18px',
          lineHeight: 1.35,
          textAlign: 'center',
        }}
      >
        There are errors within the payment batch
      </Typography>

      <Typography
        sx={{
          color: '#2d3748',
          fontSize: '16px',
          lineHeight: 1.35,
          textAlign: 'center',
          mt: 1,
        }}
      >
        Please either:
      </Typography>

      <Box sx={{ mt: 1 }}>
        <ol style={{ paddingLeft: '22px', margin: 0 }}>
          <li>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.5 }}>
              Fix the errors within the source file and reload it.
            </Typography>
          </li>
        </ol>

        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            textAlign: 'center',
            mt: 0.5,
            mb: 0.5,
          }}
        >
          OR
        </Typography>

        <ol start={2} style={{ paddingLeft: '22px', margin: 0 }}>
          <li>
            <Typography sx={{ fontSize: '14px', lineHeight: 1.5 }}>
              Fix the errors in situ, here. Note: you will have the option of
              downloading a corrected copy of your source file upon successful
              submission of it.
            </Typography>
          </li>
        </ol>
      </Box>
    </AlertModal>
  );
}
 
    return (
  <AlertModal
    title="Error correction successful"
    onClose={() => setModalKind(null)}
    icon={<CheckCircleOutlineIcon sx={{ color: '#4a9668', fontSize: 56 }} />}
    actions={
      <>
        <Button buttonVariant="text" onClick={() => setModalKind(null)}>
          CLOSE
        </Button>
        <Button
          buttonVariant="text"
          onClick={() => {
            setModalKind(null);
            setShowSuccessState(true);
          }}
        >
          SUBMIT COLLECTION
        </Button>
      </>
    }
  >
    <Typography
      sx={{
        color: '#2d3748',
        fontSize: '18px',
        lineHeight: 1.35,
        textAlign: 'center',
      }}
    >
      Thank you for correcting the errors within the payment batch
    </Typography>

    <Typography
      sx={{
        color: '#2d3748',
        fontSize: '16px',
        lineHeight: 1.35,
        textAlign: 'center',
        mt: 1.5,
      }}
    >
      Want to download the corrected file?
    </Typography>

    <Typography
      sx={{
        color: '#4b5565',
        fontSize: '14px',
        lineHeight: 1.35,
        textAlign: 'center',
        mt: 0.5,
      }}
    >
      You can download the corrected copy of your file by clicking the link below.
    </Typography>

    <Button
      buttonVariant="text"
      onClick={() => {}}
      startIcon={<DownloadOutlinedIcon />}
      sx={{ mt: 1 }}
    >
      DOWNLOAD FILE
    </Button>
  </AlertModal>
);

  };
 
  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
      data-testid={buildTestId(testIdPrefix, 'page')}
    >
      <Box sx={{ p: 2, mb: -2 }}>
        <Breadcrumb
          links={[
          
                 { href: '/', label: t('dashboard') },
                  { href: '/collection-fileupload', label: t('collectionsfileupload') },
                  { href: '/collection-fileupload/create-collection', label: t('selectCreationMethod') },
                   { href: '/collection-fileupload/create-collection/file-upload', label: t('fileUploadTitle') },
          ]}
        />
        <Heading as="h4" fontSize="28px" style={{ marginTop: '16px', marginLeft: '10px' }}>
          Create a collection (file upload)
        </Heading>
      </Box>
 
      <Box sx={{ flex: 1, p: 2 }}>
        {showSuccessState ? (
          <Paper sx={{ p: 6, border: '1px solid #e6e9ef', boxShadow: 'none', borderRadius: '8px' }}>
            <Stack alignItems="center" spacing={2}>
              <CheckCircleOutlineIcon sx={{ color: '#4a9668', fontSize: 72 }} />
              <Typography sx={{ fontSize: '40px', fontWeight: 600 }}>Success</Typography>
              <Typography sx={{ textAlign: 'center', maxWidth: '780px', fontSize: '24px', lineHeight: 1.35 }}>
                You have successfully uploaded your payment file(s) and submitted it/them for validation and you will
                receive a notification upon completion.
              </Typography>
              <Typography sx={{ textAlign: 'center', maxWidth: '760px', fontSize: '24px', lineHeight: 1.35 }}>
                Please note that validation times increase according to the number of instructions within a batch.
              </Typography>
            </Stack>
            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'space-between' }}>
              <Button buttonVariant="text" onClick={() => router.push('/collection-fileupload' as any)}>
                Go TO THE COLLECTIONS HUB
              </Button>
              <Button buttonVariant="primary" onClick={() => setShowSuccessState(false)}>
                CREATE ANOTHER COLLECTION
              </Button>
            </Box>
          </Paper>
        ) : (
          <Box data-testid={buildTestId(testIdPrefix, 'file-upload-container')}>
            <UserCard title="Source file" icon={<Image src={PaperStack} alt="Paper stack icon" />}>
              <Stack spacing={2.2}>
              <Typography sx={{ color: '#4b5565', fontSize: '16px' }}>Max file upload size is 100mb</Typography>
 
              <Box sx={{ width: '48%' }}>
                <Select
                  formOptions={{ sx: { minWidth: '100%' } }}
                  options={[{ label: 'Populated', value: 'Populated' }]}
                  selectProps={{
                    label: 'Format',
                    labelId: 'format-select',
                    onChange: (e: any) => handleSelectFieldChange('format', e.target.value),
                  }}
                  name="format"
                  value={format}
                  error={false}
                  helperText=""
                  height="48px"
                />
              </Box>
 
          
            <Box data-testid={buildTestId('collection-source-file', 'uploader')}>
  <Uploader
    onChange={(files: File | File[]) => {
      if (Array.isArray(files)) {
        handleSelectedFile(files[0]);
      } else {
        handleSelectedFile(files);
      }
    }}
  />
</Box>

 
              {uploadErrorMessage && (
                <Typography sx={{ color: '#c62828', fontSize: '13px' }}>{uploadErrorMessage}</Typography>
              )}
 
            
 
              <Stack direction="row" spacing={2}>
                <Select
                  formOptions={{ sx: { minWidth: '100%' } }}
                  options={[{ label: 'Populated', value: 'Populated' }]}
                  selectProps={{
                    label: 'Collection type',
                    labelId: 'payment-type-select',
                    onChange: (e: any) => handleSelectFieldChange('paymentType', e.target.value),
                  }}
                  name="paymentType"
                  value={paymentType}
                  error={false}
                  helperText=""
                  height="48px"
                />
             
              </Stack>
            </Stack>
          </UserCard>
 
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button buttonVariant="text" onClick={handleCancel}>
              CANCEL
            </Button>
            <Button
              buttonVariant="primary"
              onClick={handleReviewAndSubmit}
              startIcon={<ArrowForwardIcon />}
              style={{ width: '230px' }}
              disabled={!uploadedFile || uploadedFile.status !== 'uploaded'}
            >
              REVIEW AND SUBMIT
            </Button>
          </Box>
        </Box>
        )}
      </Box>
 
      <Dialog open={modalOpen} onClose={() => setModalKind(null)} PaperProps={{ sx: { boxShadow: 'none', background: 'transparent' } }}>
        {renderModalBody()}
      </Dialog>
    </Box>
  );
}
 
export default Page;
 