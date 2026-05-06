import React, { SyntheticEvent, useEffect, useState } from 'react';
import {
  Box,
  FormControl,
  SvgIcon,
  InputAdornment,
  TextField,
  SxProps,
  useTheme,
} from '@mui/material';
import UploadIcon from '../../../../assets/icons/upload.svg?react';
import deleteIcon from '../../../../assets/icons/delete.svg?react';
import fileIcon from '../../../../assets/icons/file.svg?react';
import closeIcon from '@mui/icons-material/Close'; // Example import for an upload icon
import HelperText from '../HelperText';

interface SingleFileUploadProps {
  label: string;
  size: 'big' | 'small';
  handleChange: (value: string) => void;
  disabled: boolean;
  required: boolean;
  value: string;
  error: boolean;
  helperText: string;
  sx?: SxProps;
}

const SingleFileUpload = ({
  label,
  disabled = false,
  required = false,
  error,
  helperText,
  sx,
}: SingleFileUploadProps) => {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (count < 100 && file) {
        setCount((count) => {
          return count + 5;
        });
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [file, count]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCount(0);

    if (event.target.files && event.target.files.length > 0 && !disabled) {
      setFile(event.target.files[0]);
    }
  };

  const handleRemoveFile = (e: SyntheticEvent) => {
    e.preventDefault();
    setFile(null);
    setCount(0);
  };

  return (
    <FormControl
      fullWidth
      error={error}
      sx={{
        color: !error ? theme.palette.common.black : theme.palette.error.dark,
        '& .Mui-disabled': {
          backgroundColor: `${theme.palette.grey[100]}`,
          width: '100%',
        },
        ...sx,
      }}
    >
      <TextField
        type="text"
        disabled={disabled}
        required={required}
        value={file && count >= 100 ? file.name : ''}
        error={error}
        fullWidth
        sx={{ border: count > 0 ? '0.5px dashed blue' : '0.5px dashed black' }}
        label={count > 0 ? label : ''}
        onClick={() => {
          if (!file && !disabled) {
            document.getElementById('file-upload-input')?.click();
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {file && (
                <SvgIcon
                  component={fileIcon}
                  viewBox="0 0 22 22"
                  sx={{
                    fontSize: 30,
                    color: '#888',
                    width: '1.5rem',
                    padding: '0.75rem',
                    fill: !error
                      ? theme.palette.common.black
                      : theme.palette.error.dark,
                  }}
                />
              )}
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Box
                display="flex"
                flexDirection="row"
                alignItems="center"
                gap={2}
                sx={{ borderColor: 'primary.main' }}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={!file ? handleFileChange : handleRemoveFile}
                  onClick={() => {
                    if (!file && !disabled) {
                      document.getElementById('file-upload-input')?.click();
                    }
                  }}
                />
                <a
                  onClick={(e) => {
                    if (!file && !disabled) {
                      e.preventDefault();
                      document.getElementById('file-upload-input')?.click();
                    } else {
                      e.preventDefault();
                      handleRemoveFile(e);
                    }
                  }}
                  href="#file-upload-input"
                >
                  {count == 0 ? (
                    <SvgIcon
                      component={UploadIcon}
                      inheritViewBox
                      style={{
                        alignSelf: 'flex-start',
                        marginTop: '0.2rem',
                        fill: !error
                          ? theme.palette.common.black
                          : theme.palette.error.dark,
                      }}
                    />
                  ) : (
                    <>
                      {count <= 100 ? (
                        <SvgIcon
                          component={closeIcon}
                          sx={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            border: `1px solid ${!error ? theme.palette.common.black : theme.palette.error.dark}`,
                            fontSize: 20,
                            fill: !error
                              ? theme.palette.common.black
                              : theme.palette.error.dark,
                          }}
                          onClick={handleRemoveFile}
                        />
                      ) : (
                        <SvgIcon
                          onClick={handleRemoveFile}
                          component={deleteIcon}
                          inheritViewBox
                          sx={{
                            alignSelf: 'flex-start',
                            marginTop: '0.2rem',
                            fill: !error
                              ? theme.palette.common.black
                              : theme.palette.error.dark,
                          }}
                        />
                      )}
                    </>
                  )}
                </a>
              </Box>
            </InputAdornment>
          ),
        }}
      />
      {(count < 100 || file === null) && (
        <Box
          sx={{
            position: 'absolute',
            top: '20px',
            left: count === 0 ? '5px' : '10px',
            width: '93%',
          }}
        >
          {count !== 0 && file && (
            <progress
              value={count}
              max={100}
              style={{ width: '85%', marginLeft: '40px' }}
            />
          )}
          {count === 0 && file === null && (
            <a
              onClick={(e) => {
                e.preventDefault();
                if (!file && !disabled) {
                  document.getElementById('file-upload-input')?.click();
                }
              }}
            >
              {label}
            </a>
          )}
        </Box>
      )}
      {error && <HelperText error={error} helperText={helperText} />}
    </FormControl>
  );
};

export default SingleFileUpload;
