import { Box, Stack, SvgIcon, SxProps, useTheme } from '@mui/material';
import { FileWithPath, useDropzone } from 'react-dropzone';
import UploadIcon from '../../../../assets/icons/upload.svg?react';
import File from './File';
import { useEffect, useState } from 'react';
import HelperText from '../HelperText';

interface UploaderProps {
  onChange: (files: FileWithPath[]) => void;
  sx?: SxProps;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

interface FileStatus {
  file: FileWithPath;
  status: 'success' | 'error';
  errorMessage?: string;
}

const Uploader = ({
  onChange,
  sx,
  disabled = false,
  error = false,
  helperText = '',
}: UploaderProps) => {
  const theme = useTheme();
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      accept: {
        'application/pdf': ['.pdf'],
        'application/vnd. openxmlformats-officedocument.spreadsheetml. sheet': [
          '.xlsx',
        ],
        'text/csv': ['.csv'],
        'text/plain': ['.txt'],
      },
      disabled, // ✅ Pass disabled prop to dropzone
    });

  const [filesWithStatus, setFilesWithStatus] = useState<FileStatus[]>([]);

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const newFiles = acceptedFiles.map((file) => ({
        file,
        status: 'success' as const,
      }));
      setFilesWithStatus((prev) => [...prev, ...newFiles]);

      // ✅ Safely call onChange
      if (onChange && typeof onChange === 'function') {
        onChange([...acceptedFiles]);
      }
    }
  }, [acceptedFiles, onChange]);

  useEffect(() => {
    if (fileRejections.length > 0) {
      const rejectedFiles = fileRejections.map((rejection) => ({
        file: rejection.file,
        status: 'error' as const,
        errorMessage:
          'Unable to upload file. Please upload a .pdf, .doc or .docx file type',
      }));
      setFilesWithStatus((prev) => [...prev, ...rejectedFiles]);
    }
  }, [fileRejections]);

  const handleDelete = (index: number) => {
    const updatedFiles = filesWithStatus.filter((_, i) => i !== index);
    setFilesWithStatus(updatedFiles);

    const validFiles = updatedFiles
      .filter((f) => f.status === 'success')
      .map((f) => f.file);

    // ✅ Safely call onChange
    if (onChange && typeof onChange === 'function') {
      onChange(validFiles);
    }
  };

  return (
    <Stack
      className="container"
      sx={{
        ...sx,
      }}
    >
      <Box
        {...getRootProps({ className: 'dropzone' })}
        sx={{
          border: error
            ? `1px dashed ${theme.palette.error.dark}`
            : `1px dashed ${theme.palette.grey[400]}`,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer', // ✅ Show proper cursor
          backgroundColor: !disabled
            ? theme.palette.common.white
            : theme.palette.grey[200],
          borderRadius: '0.5rem',
          width: '100%',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',

          svg: {
            fill: !disabled
              ? !error
                ? theme.palette.primary.main
                : theme.palette.error.dark
              : 'initial',
          },
        }}
      >
        <div>
          <SvgIcon
            component={UploadIcon}
            sx={{ fontSize: 40, fill: theme.palette.primary.dark }}
          />
          <input {...getInputProps()} />

          <Box
            sx={{
              marginTop: '1.25rem',
              color: !error ? 'initial' : theme.palette.error.dark,
              span: {
                color: !error
                  ? theme.palette.primary.main
                  : theme.palette.error.dark,
              },
            }}
          >
            Drag a file or <span>click here</span> to upload a file
          </Box>
        </div>
      </Box>

      {/* Files List */}
      <aside>
        {filesWithStatus.length > 0 && (
          <Box
            sx={{
              marginTop: '1rem',
              'ul,li': {
                border: 'none',
                listStyle: 'none',
                padding: '0px',
                margin: '0px',
              },
            }}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {filesWithStatus.map((fileStatus, index) => (
                <File
                  key={index}
                  file={fileStatus.file}
                  status={fileStatus.status}
                  errorMessage={fileStatus.errorMessage}
                  index={index}
                  handleRemoveFile={() => handleDelete(index)}
                />
              ))}
            </div>
          </Box>
        )}
      </aside>

      {error && helperText && (
        <HelperText error={error} helperText={helperText} />
      )}
    </Stack>
  );
};

export default Uploader;
