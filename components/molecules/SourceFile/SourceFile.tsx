import UserCard from '@atoms/UserCard/UserCard';
import Image from 'next/image';
import Documentup from 'public/icons/icn_document_up.svg';
import { Uploader } from 'dist/standard-bank-react';
import { Box, CircularProgress, Typography } from '@mui/material';
import IcnInfoCircle from 'public/icons/icn_info_circle.svg';
import { Button } from 'dist/standard-bank-react';
import IcnCloseIcon from 'public/icons/close-icon.svg';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { buildTestId } from 'src/utils/testIds';
import { API_ROUTES } from '@lib/utils/apiRoute';
import { post } from '@lib/api/httpClient';
import { extractErrorIssues, formatErrorMessages } from 'src/utils/errorMessageFormatter';
import { useAppDispatch, useAppSelector } from '@lib/hooks/useAppDispatch';
import { setUploadFileName, setUploadStatus, setUploadSuccessful, setUploadedFileData, resetUploadState } from '@store/slices/createBeneficiarySlice';
import AvatarAlert from 'public/icons/avatar_alert.svg';
import DeleteConfirmationDialog from 'components/common/DeleteConfirmationDialog';
import { useState } from 'react';

interface SourceFileProps {
  onNext?: () => void;
  onCancel?: () => void;
}

function SourceFile({ onNext, onCancel }: SourceFileProps) {
  const [uploadErrorDialogOpen, setUploadErrorDialogOpen] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string>('');
  const dispatch = useAppDispatch();
  const uploadedFileName = useAppSelector((state) => state.createBeneficiary.uploadedFileName);
  const isUploadSuccessful = useAppSelector((state) => state.createBeneficiary.isUploadSuccessful);
  const uploadStatus = useAppSelector((state) => state.createBeneficiary.uploadStatus);
  const uploadedFileData = useAppSelector((state) => state.createBeneficiary.uploadedFileData);

  const handleFileChange = (files: any[]) => {
    if (files.length === 0) {
      dispatch(resetUploadState());
      return;
    }
    
    const selectedFile = files[0];
    const fileName = selectedFile.name.toLowerCase();
    
    const isValidExtension = fileName.endsWith('.csv') || fileName.endsWith('.txt');
    
    if (!isValidExtension) {
      dispatch(setUploadStatus('error'));
      return;
    }
    
    dispatch(setUploadFileName(selectedFile.name));
    dispatch(setUploadedFileData(selectedFile));
    dispatch(setUploadStatus('success'));
  };

  const handleUploadComplete = () => {
    dispatch(setUploadSuccessful(true));
  };

  const handleUploadError = () => {
    setUploadErrorDialogOpen(false);
  };

  const handleUploadRetry = () => {
    setUploadErrorDialogOpen(false);
    handleReviewSubmit();
  };

  const handleReviewSubmit = async () => {
    if (!uploadedFileData) {
      return;
    }

    try {
      dispatch(setUploadStatus('pending'));
      
      const fileContent = await uploadedFileData.text();
      const base64Data = btoa(fileContent);
      
      const fileName = uploadedFileName?.toLowerCase();
      const fileFormat = fileName?.endsWith('.csv') ? 'csv' : 'txt';
      
      const payload = {
        fileData: base64Data,
        fileFormat: fileFormat,
        payAlertAllowed: true,
      };
      
      const response = await post(API_ROUTES.BENEFICIARIES_UPLOAD_DETAILED, payload);
      
      dispatch(setUploadStatus('success'));
      dispatch(setUploadedFileData(response));
      
      onNext?.();
    } catch (error: any) {
      dispatch(setUploadStatus('error'));
      
      // Extract error issues and try to map to error codes
      const errorIssues = extractErrorIssues(error?.response?.data || error?.data || error);
      let errorMsg = 'We are unable to upload the file.';
      
      if (errorIssues && errorIssues.length > 0) {
        try {
          const formattedErrors = formatErrorMessages(errorIssues);
          if (formattedErrors && formattedErrors !== 'Something went wrong') {
            errorMsg = formattedErrors; // Use mapped error codes
          }
        } catch (e) {
          // Keep generic fallback on error
        }
      }
      
      setUploadErrorMessage(errorMsg);
      setUploadErrorDialogOpen(true);
    }
  };

  return (
    <>
      <UserCard
        title="Source file"
        icon={<Image src={Documentup} alt="Document Up Icon" />}
        testId={buildTestId('beneficiary-source-file', 'card')}
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
            Accepted file formats include: CSV (.csv) and Text (.txt)
          </Typography>
        </Box>
        <Box data-testid={buildTestId('beneficiary-source-file', 'uploader')}>
          <Uploader 
            onChange={handleFileChange}
            disabled={uploadStatus === 'pending' || !!uploadedFileData}
            onUploadComplete={handleUploadComplete}
            maxFiles={1} 
          />
        </Box>
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
          data-testid={buildTestId('beneficiary-source-file', 'cancel-button')}
          startIcon={<Image src={IcnCloseIcon} alt="close" width={20} height={20} />}
          style={{ height: '48px', minHeight: '48px', width: '112px' }}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="primary"
          onClick={handleReviewSubmit}
          data-testid={buildTestId('beneficiary-source-file', 'next-button')}
          startIcon={uploadStatus !== 'pending' ? <ArrowForwardIcon /> : undefined}
          disabled={!isUploadSuccessful || uploadStatus === 'pending'}
          style={{
            height: '48px',
            minHeight: '48px',
            width: '220px',
          }}
        >
          {uploadStatus === 'pending' ? <CircularProgress size={24} sx={{ color: '#0062E1' }} /> : ('Review and submit')}
        </Button>
      </Box>

      <DeleteConfirmationDialog
        open={uploadErrorDialogOpen}
        onClose={() => setUploadErrorDialogOpen(false)}
        onPrimaryCTA={handleUploadRetry}
        onSecondaryCTA={handleUploadError}
        selectedCount={0}
        exclamationIcon={AvatarAlert}
        itemLabel=""
        markedCount={undefined}
        showUndoWarning={false}
        title="System error"
        message={
          <div style={{ textAlign: 'center' }}>
            {!uploadErrorMessage || uploadErrorMessage === 'We are unable to upload the file.' ? (
              <>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
                  Something went wrong
                </div>
                <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
                  {uploadErrorMessage || 'We are unable to upload the file.'}
                </div>
                <div style={{ fontWeight: 400, fontSize: '16px', color: '#222E37' }}>
                  Please try again or contact your bank representative for assistance.
                </div>
              </>
            ) : (
              <div style={{ fontWeight: 400, fontSize: '16px', marginBottom: '16px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.6' }}>
                {uploadErrorMessage}
              </div>
            )}
          </div>
        }
        primaryCTALabel="Try again"
        secondaryCTALabel="Dismiss"
        secondaryCTAWidth="auto"
        tertiaryCTAWidth="auto"
        testIdPrefix={buildTestId('beneficiary-source-file', 'upload-error-dialog')}
      />
    </>
  );
}

export default SourceFile;
