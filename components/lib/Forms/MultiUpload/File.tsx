import { Box, Stack, SvgIcon, useTheme } from '@mui/material';
import fileIcon from '../../../../assets/icons/file.svg?react';
import CloseIconBlue from '../../../../assets/icons/icn_close_circle_blue.svg?react';
import CloseIconRed from '../../../../assets/icons/icn_close_circle_red.svg?react';
import DocumentPDF from '../../../../assets/icons/icn_document_pdf.svg?react';
import DocumentXLS from '../../../../assets/icons/icn_document_xls.svg?react';
import DocumentCSV from '../../../../assets/icons/icn_document_csv.svg?react';
import { FileWithPath } from 'react-dropzone';
import { useEffect, useState } from 'react';
import React from 'react';

interface FileProps {
  file: FileWithPath;
  status: 'success' | 'error';
  errorMessage?: string;
  index: number;
  handleRemoveFile: (e: React.SyntheticEvent) => void;
}

const File = ({
  file,
  status,
  errorMessage,
  index,
  handleRemoveFile,
}: FileProps) => {
  const theme = useTheme();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(true);

  useEffect(() => {
    // Simulate upload progress
    if (status === 'success') {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else {
      setIsUploading(false);
    }
  }, [status]);

  const getFileIcon = () => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.pdf')) {
      return DocumentPDF;
    } else if (fileName.endsWith('.xlsx')) {
      return DocumentXLS;
    } else if (fileName.endsWith('.csv')) {
      return DocumentCSV;
    } else {
      // For . txt or any other file type
      return fileIcon;
    }
  };

  const getCloseIcon = () => {
    return status === 'success' ? CloseIconBlue : CloseIconRed;
  };

  return (
    <Stack
      key={index}
      sx={{
        border: `1px solid ${theme.palette.grey[300]}`,
        backgroundColor: theme.palette.common.white,
        borderRadius: '8px',
        position: 'relative',
        padding: '12px 16px',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        {/* File Icon - Dynamic based on file type */}
        <SvgIcon
          component={getFileIcon()}
          viewBox="0 0 22 22"
          sx={{
            fontSize: 24,
            color: theme.palette.grey[600],
            flexShrink: 0,
          }}
        />

        {/* Progress Bar or File Name and Status */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isUploading && status === 'success' ? (
            // ✅ ONLY Progress Bar (No filename while uploading)
            <Box sx={{ width: '100%' }}>
              <progress
                value={uploadProgress}
                max={100}
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '24px',
                  border: 'none',
                  backgroundColor: theme.palette.grey[200],
                  display: 'block',
                }}
              />
              {/* Custom styling for progress bar */}
              <style>
                {`
                  progress::-webkit-progress-bar {
                    background-color: #e0e0e0;
                    border-radius: 24px;
                  }
                  progress::-webkit-progress-value {
                    background-color:  #0033AA;
                    border-radius: 24px;
                  }
                  progress::-moz-progress-bar {
                    background-color:  #0033AA;
                    border-radius: 24px;
                  }
                `}
              </style>
            </Box>
          ) : (
            // ✅ Show filename and status after upload completes
            <Box sx={{ width: '100%' }}>
              {/* File Name */}
              <Box
                sx={{
                  fontSize: '14px',
                  color: theme.palette.text.primary,
                  fontWeight: 400,
                  marginBottom: '2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {file.name}
              </Box>

              {/* Status Message */}
              <Box
                sx={{
                  fontSize: '12px',
                  color:
                    status === 'success'
                      ? theme.palette.success.main
                      : theme.palette.error.main,
                  fontWeight: 400,
                }}
              >
                {status === 'success'
                  ? 'Upload successful'
                  : errorMessage || 'Upload failed'}
              </Box>
            </Box>
          )}
        </Box>

        {/* Close/Delete Icon - Dynamic based on status */}
        <SvgIcon
          component={getCloseIcon()}
          viewBox="0 0 22 22"
          sx={{
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            flexShrink: 0,
            '&:hover': {
              opacity: 0.7,
            },
          }}
          onClick={handleRemoveFile}
        />
      </Stack>
    </Stack>
  );
};

export default File;
