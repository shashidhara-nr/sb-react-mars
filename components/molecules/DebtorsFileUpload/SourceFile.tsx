import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import Documentup from 'public/icons/icn_document_up.svg';
import { Uploader } from 'dist/standard-bank-react';
import { Box, Typography, CircularProgress } from '@mui/material';
import IcnInfoCircle from 'public/icons/icn_info_circle.svg';
import { Button } from 'dist/standard-bank-react';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState, useCallback } from 'react';
import ValidationErrorDialog from 'components/common/ValidationErrorDialog';
import { useAppDispatch } from '@lib/hooks/useAppDispatch';
import {
  processDebtorFile,
  getAllowedExtensionsForInput,
} from '../../../lib/utils/debtorFileUpload';
import {
  setUploadedDebtors,
  setUploading,
  setUploadError,
  clearUpload,
} from '@store/slices/debtorSlice';
import { useTranslations } from 'next-intl';
import { convertFileToBase64, getFileFormat } from '@lib/utils/fileUtils';
import { uploadDebtors } from '@lib/api/debtorApi';
import { extractErrorIssues, formatErrorMessages } from 'src/utils/errorMessageFormatter';

interface SourceFileProps {
  onNext?: () => void;
  onCancel?: () => void;
}

function SourceFile({ onNext, onCancel }: SourceFileProps) {
  const dispatch = useAppDispatch();
  const [uploading, setUploadingState] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string>('');
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    secondaryMessage?: string;
  }>({
    open: false,
    title: '',
    message: '',
    secondaryMessage: '',
  });

  const handleFileUpload = useCallback(
    async (files: any) => {
      let fileList = files;
      if (files?.target) {
        fileList = files.target.files;
      }
      if (!fileList || fileList.length === 0) {
        // Reset state when file is removed
        setUploadComplete(false);
        setUploadedFileName('');
        setSelectedFile(null);
        setError('');
        dispatch(clearUpload());
        return;
      }

      const file = fileList[0];
      
      // Just store the file, don't upload yet
      setSelectedFile(file);
      setUploadedFileName(file.name);
      setError('');
    },
    [dispatch],
  );

  const handleReset = useCallback(() => {
    setUploadComplete(false);
    setUploadedFileName('');
    setSelectedFile(null);
    setError('');
    dispatch(clearUpload());
  }, [dispatch]);

  const handleReviewSubmit = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setUploadingState(true);
      setError('');
      setUploadComplete(false);
      dispatch(setUploading(true));

      // Convert file to Base64
      const base64Data = await convertFileToBase64(selectedFile);
      const fileFormat = getFileFormat(selectedFile);

      // Call upload API
      const response = await uploadDebtors({
        fileData: base64Data,
        fileFormat: fileFormat,
        templateId: null,
      });

      // Store response in Redux
      dispatch(setUploadedDebtors(response as any));
      setUploadComplete(true);
      
      // Navigate to next step
      onNext?.();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to upload file';
      setError(errorMessage);
      dispatch(setUploadError(errorMessage));

      // Extract and format error codes if available
      const errorIssues = extractErrorIssues(err?.response?.data || err?.data || err);
      let errorMsg = translateLang('unableUploadDebtor');
      if (errorIssues && errorIssues.length > 0) {
        try {
          const formattedErrors = formatErrorMessages(errorIssues);
          if (formattedErrors && formattedErrors !== 'Something went wrong') {
            errorMsg = formattedErrors;
          }
        } catch (e) {
          // fallback to default message
        }
      }
      setUploadErrorMessage(errorMsg);

      // Show error popup dialog with common error message pattern
      setErrorDialog({
        open: true,
        title: translateLang('systemError'),
        message: translateLang('somethingWentWrong'),
        secondaryMessage: `We are unable to upload the file. ${translateLang('contactBankRepresentative')}`,
      });
    } finally {
      setUploadingState(false);
      dispatch(setUploading(false));
    }
  }, [selectedFile, dispatch, onNext]);

  const translateLang = useTranslations('debtorsHubData');

  const handleErrorDialogClose = useCallback(() => {
    setErrorDialog({
      open: false,
      title: '',
      message: '',
      secondaryMessage: '',
    });
  }, []);

  return (
    <>
      <UserCard
        title={translateLang('sourceFile')}
        icon={<Image src={Documentup} alt="Document Up Icon" />}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1,
            width: '100%',
            paddingTop: '14px',
            paddingBottom: '16px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
            }}
          >
            <Image src={IcnInfoCircle} alt="Info" width={20} height={20} />
          </Box>
          <Typography sx={{ color: '#555', fontSize: '13px', lineHeight: 1.5 }}>
            {translateLang('fileUploadAcceptedFormats')}
          </Typography>
        </Box>
        <Box data-testid="debtors-file-upload-uploader">
          <Uploader onChange={handleFileUpload} disabled={uploading || !!selectedFile} />
        </Box>
        {error && (
          <Typography sx={{ color: 'error.main', mt: 2, fontSize: '14px' }}>{error}</Typography>
        )}
      </UserCard>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          mt: '20px',
          mb: '20px',
        }}
      >
        <Button
          buttonVariant="text"
          onClick={onCancel}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px', width: '112px' }}
        >
          {translateLang('cancel')}
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleReviewSubmit}
          disabled={!selectedFile || uploading}
          startIcon={uploading ? undefined : <ArrowForwardIcon />}
          style={{
            height: '48px',
            minHeight: '48px',
            width: '220px',
          }}
        >
          {uploading ? <CircularProgress size={24} sx={{ color: '#0062E1' }} /> : translateLang('reviewAndSubmit')}
        </Button>
      </Box>

      <ValidationErrorDialog
        open={errorDialog.open}
        onClose={handleErrorDialogClose}
        title={!uploadErrorMessage || uploadErrorMessage === translateLang('unableUploadDebtor') ? errorDialog.title : ''}
        message={!uploadErrorMessage || uploadErrorMessage === translateLang('unableUploadDebtor') ? errorDialog.message : uploadErrorMessage}
        isMandatoryError={true}
        secondaryMessage={!uploadErrorMessage || uploadErrorMessage === translateLang('unableUploadDebtor') ? errorDialog.secondaryMessage : ''}
      />
    </>
  );
}

export default SourceFile;
