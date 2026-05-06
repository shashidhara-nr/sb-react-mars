import Heading from 'lib/components/Page/Heading';
import TextField from '../Forms/TextField';
import { Button, Select, SelectType } from 'lib/main';
import CloseIcon from '@mui/icons-material/Close';
import { Box, SxProps, TextFieldProps, Typography, useTheme } from '@mui/material';
import { ChangeEvent, useState } from 'react';
import TextArea from 'lib/components/Forms/TextArea';

export type Fields = {
  type: string;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  heading?: string;
  nolabels?: boolean;
  hasBorder?: boolean;
  value?: string;
  options?: SelectType[];
  errorText?: string;
  fornSubmitted?: boolean;
  params?: TextFieldProps;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  sx?: SxProps;
  onChange?: (event: ChangeEvent) => void;
};

interface FormCreatorProps {
  mainHeading: string;
  isEditMode?: boolean;
  onClose?: () => void;
  fields: Fields[];
  onSubmit: (formData: Record<string, string>) => void;
  cancelLabel?: string;
  submitLabel?: string;
}

const FormCreator = ({
  mainHeading,
  isEditMode = false,
  fields,
  onClose,
  onSubmit,
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
}: FormCreatorProps) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [edited, setEdited] = useState<Record<string, string>[]>([]);

  const handleEdit = (field: string, value: string): void => {
    setEdited((prev) => {
      const existingFieldIndex = prev.findIndex((item) =>
        Object.prototype.hasOwnProperty.call(item, field),
      );
      if (existingFieldIndex !== -1) {
        // Update the existing field value
        const updatedFields = [...prev];
        updatedFields[existingFieldIndex][field] = value;
        return updatedFields;
      }
      // Add a new field entry if it doesn't exist
      return [...prev, { [field]: value }];
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setFormSubmitted(true);

    const currentElements = Array.from(
      e.currentTarget.elements as unknown as Element[],
    )
      .filter(
        (element: Element) =>
          element.tagName === 'INPUT' || element.tagName === 'SELECT',
      )
      .map((element) => {
        const inputElement = element as HTMLInputElement;
        const { name, value } = inputElement;
        return { [name]: value };
      });

    if ((e.target as HTMLFormElement).checkValidity()) {
      console.log('Form is valid! Submitting the form...');
      onSubmit(
        currentElements.reduce((acc, curr) => ({ ...acc, ...curr }), {}),
      );
    } else {
      console.log('Form is invalid! Please check the fields...');
    }
  };

  const formBody = {
    height: '450px',
    paddingRight: '0.5rem',
    overflow: 'auto',
    scrollBehavior: 'smooth',
  };

  const editBody = {
    display: 'flex',
    gap: '0.5rem',
    flexFlow: 'row wrap',
    justifyContent: 'space - between',
  };

  return (
    <Box
      sx={{
        borderRadius: '0.75rem',
        borderColor: `1px solid ${theme.palette.grey[300]}`,
        background: theme.palette.common.white,
        width: '400px',
        padding: '1.5rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Heading
          as="h2"
          padding="0"
          margin="1.5rem 0 1.5rem 0"
          lineHeight="normal"
          dark={true}
          hasBorder={false}
        >
          {mainHeading}
        </Heading>
        <CloseIcon sx={{ fill: theme.palette.grey[500] }} onClick={onClose} />
      </Box>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
        noValidate
      >
        <Box sx={!isEditMode ? formBody : editBody}>
          {fields.map((field, index) => {
            const {
              type,
              name,
              label,
              placeholder,
              required,
              defaultValue,
              nolabels,
              hasBorder,
              value,
              options,
              errorText,
              disabled,
            } = field;

            switch (type) {
              case 'heading':
                return (
                  <Box
                    key={index}
                    sx={{
                      width: '100%',
                    }}
                  >
                    <Heading
                      as="h3"
                      padding="1.5rem 0 0 0"
                      margin="1.5rem 0 0 0"
                      lineHeight="normal"
                      dark={true}
                      hasBorder={hasBorder}
                    >
                      {label}
                    </Heading>
                  </Box>
                );
              case 'text':
                return (
                  <Box
                    key={index}
                    sx={{
                      marginBottom: '1rem',
                      marginTop: '1rem',
                      width: '49%',
                    }}
                    style={!isEditMode ? { width: '100%' } : { width: '49%' }}
                  >
                    {!isEditMode ? (
                      <>
                        <TextField
                          key={index}
                          name={name}
                          type="text"
                          placeholder={nolabels ? placeholder : label}
                          required={required}
                          defaultValue={defaultValue}
                          label={nolabels ? label : ''}
                          errorText={errorText ?? ''}
                          fornSubmitted={formSubmitted}
                          disabled={disabled}
                          error={
                            formSubmitted &&
                            (!edited.find((item) => item[name]) ||
                              edited.find((item) => item[name])?.[name] === '')
                          }
                          helperText="This field is required"
                          onChange={(e: ChangeEvent) => {
                            const inputElement =
                              e.target as HTMLTextAreaElement;
                            console.log('Input Element:', inputElement);
                            handleEdit(name, inputElement?.value);
                          }}
                        />
                      </>
                    ) : (
                      <Box
                        sx={{
                          flex: '0 1 50%',
                          borderRadius: '0.3rem',
                        }}
                      >
                        <Heading
                          as="label"
                          padding="0"
                          margin="0px 0 0px 0"
                          lineHeight="normal"
                          dark={true}
                        >
                          {label}
                        </Heading>

                        <div>
                          <Typography>{value}</Typography>
                        </div>
                      </Box>
                    )}
                  </Box>
                );
              case 'select':
                return (
                  <Box key={index} sx={{ marginTop: '2rem' }}>
                    {!isEditMode ? (
                      <Select
                        options={options ?? []}
                        value={value ?? ''}
                        helperText={errorText ?? ''}
                        name={name}
                        selectProps={{
                          label: label,
                          labelId: 'select-label',
                        }}
                        error={
                          formSubmitted &&
                          (!edited.find((item) => item[name]) ||
                            edited.find((item) => item[name])?.[name] === '')
                        }
                      />
                    ) : (
                      <>
                        <Heading
                          as="label"
                          padding="0"
                          margin="0px 0 0px 0"
                          lineHeight="normal"
                          dark={true}
                        >
                          {label}
                        </Heading>

                        <div>{value}</div>
                      </>
                    )}
                  </Box>
                );
              case 'textarea':
                return (
                  <Box key={index} sx={{ marginTop: '2rem' }}>
                    <TextArea
                      key={index}
                      name={name}
                      required={required ?? false}
                      label={nolabels ? label : ''}
                      error={
                        formSubmitted &&
                        (!edited.find((item) => item[name]) ||
                          edited.find((item) => item[name])?.[name] === '')
                      }
                      helperText={errorText ?? ''}
                      disabled={disabled ?? false}
                      onChange={(e: ChangeEvent) => {
                        const inputElement = e.target as HTMLInputElement;
                        console.log('Input Element:', inputElement);
                        handleEdit(name, inputElement?.value);
                      }}
                      rows={3}
                      cols={4}
                    />
                  </Box>
                );
              default:
                return null;
            }
          })}
        </Box>
        <Box
          sx={{
            padding: '1.5rem 0',
            marginTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <Button
            buttonVariant="tertiary"
            onClick={onClose}
            sx={{
              fill: '#ccc',
            }}
          >
            {cancelLabel}
          </Button>
          <Button buttonVariant={'primary'} type="submit">
            {submitLabel}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default FormCreator;
