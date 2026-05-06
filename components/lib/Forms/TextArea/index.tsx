import { TextField as MUITextField } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import HelperText from '../HelperText';

interface TextAreaProps {
  helperText: string;
  error: boolean;
  required: boolean;
  label: string;
  disabled: boolean;
  rows: number;
  cols: number;
  name?: string;
  onChange: (e: ChangeEvent) => void;
}

const TextArea = ({
  helperText,
  error,
  label,
  disabled,
  required,
  rows,
  cols,
  name,
  onChange,
}: TextAreaProps) => {
  const [currentValue, setCurrentValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCurrentValue(newValue);
    onChange(e);
  };

  return (
    <>
      <MUITextField
        error={error}
        required={required}
        fullWidth
        onChange={handleChange}
        value={currentValue}
        variant="outlined"
        label={label}
        multiline
        rows={rows}
        maxRows={cols}
        disabled={disabled}
        name={name}
        sx={{
          '& .Mui-disabled': {
            backgroundColor: '#F4F5F7',
          },
        }}
      />
      {error && <HelperText error={error} helperText={helperText} />}
    </>
  );
};

export default TextArea;
