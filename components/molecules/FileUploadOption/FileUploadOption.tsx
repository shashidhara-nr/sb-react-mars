
'use client';

import * as React from 'react';
import { z } from 'zod';
import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  Typography,
  Button
} from '@mui/material';
import CommonAccordion from '../../common/CommonAccordion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Image from 'next/image';
import IconPencil from 'public/icons/col-icon-left-pencil.svg';
import IconDocumentUp from 'public/icons/icn_document_up.svg';
import IconChevronUp from 'public/icons/icn_chevron_up.svg';
import IconCancel from 'public/icons/icn_cancel.svg';
import IconFloppy from 'public/icons/icn_floppy.svg';
import BatchOptionsSection from './BatchOptionsSection';
import { useTranslations } from 'next-intl';
import { borderRadius } from 'components/lib/styles/spacing';

export type FileUploadOptionsState = {
  errorRejection: 'rejectBatch' | 'rejectInstruction' | 'rejectTransaction';
  cutoffBreach: 'rejectBatch' | 'rejectInstruction' | 'adjustInstruction';
  posting: 'consolidated' | 'itemised';
  allowEditingAfterUpload: boolean;
};

export const fileUploadOptionsSchema = z.object({
  errorRejection: z.enum(['rejectBatch', 'rejectInstruction', 'rejectTransaction']).catch('rejectBatch'),
  cutoffBreach: z.enum(['rejectBatch', 'rejectInstruction', 'adjustInstruction']).catch('rejectBatch'),
  posting: z.enum(['consolidated', 'itemised']).catch('consolidated'),
  allowEditingAfterUpload: z.boolean().catch(false),
});

type Props = {
  value: FileUploadOptionsState;
  onChange: (next: FileUploadOptionsState) => void;
  defaultExpanded?: boolean;
  disabled?: boolean;
  reviewMode?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  hidePostingOptions?: boolean;
  hideAllowEditing?: boolean;
  expandIcon?: React.ReactNode | boolean;
  actions?: React.ReactNode;
};

const SectionLabel: React.FC<React.PropsWithChildren> = ({ children }) => (
  <FormLabel
    sx={{
      color: 'text.primary',
      fontWeight: 600,
      mb: 1.5,
      '&.Mui-focused': { color: 'text.primary' }
    }}
  >
    {children}
  </FormLabel>
);

export const FileUploadOptions: React.FC<Props> = ({
  value,
  onChange,
  defaultExpanded = true,
  disabled = false,
  reviewMode = false,
  onEdit,
  onSave,
  onCancel,
  hidePostingOptions = false,
  hideAllowEditing = false,
  expandIcon,
  actions
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  // Effective review state for this section only.
  const effectiveReviewMode = reviewMode && !isEditing;

  // Leaving global review should reset local edit override.
  React.useEffect(() => {
    if (!reviewMode) {
      setIsEditing(false);
    }
  }, [reviewMode]);
  const setValue = <K extends keyof FileUploadOptionsState>(
    key: K,
    v: FileUploadOptionsState[K]
  ) => onChange({ ...value, [key]: v });

  const errorRejectionText = {
    rejectBatch: 'Reject erroneous batch',
    rejectInstruction: 'Reject erroneous instruction',
    rejectTransaction: 'Reject erroneous transaction',
  }[value.errorRejection];

  const cutoffBreachText = {
    rejectBatch: 'Reject batch',
    rejectInstruction: 'Reject instruction',
    adjustInstruction: 'Adjust instruction',
  }[value.cutoffBreach];

  const postingText = {
    consolidated: 'Consolidated',
    itemised: 'Itemised',
  }[value.posting];

  const allowEditingText = value.allowEditingAfterUpload ? 'Yes' : 'No';
  const translateLang = useTranslations('collectionTypesHubData');

  return (
    <CommonAccordion
      defaultExpanded={defaultExpanded}
      expandIcon={expandIcon}
      icon={<Image src={IconDocumentUp} alt="file upload options" width={24} height={24} />}
      title={translateLang('fileUploadOptions')}
      reviewMode={reviewMode}
      isEditing={isEditing}
      onEdit={() => {
        setIsEditing(true);
      }}
      onCancel={() => {
        onCancel?.();
        setIsEditing(false);
      }}
      onSave={() => {
        onSave?.();
        setIsEditing(false);
      }}
       sx={{ 
        borderRadius: '0.75rem',
        overflow: 'hidden',
        '&.MuiAccordion-root': {
          borderRadius: '0.75rem',
        }
      }}
      actions={actions}
    >
      {/* Top divider under summary */}
      <Divider />

      {effectiveReviewMode ? (
        <Box px={2} py={2}>
          <BatchOptionsSection
            left={[
              { label: translateLang('fileErrorRejectionOptions'), value: errorRejectionText },
              ...(!hidePostingOptions ? [{ label: translateLang('defaultPostingOptions'), value: postingText }] : []),
              ...(!hideAllowEditing ? [{ label: translateLang('allowEditingAfterUpload'), value: allowEditingText }] : []),
            ]}
            right={[
              { label: translateLang('cutOfftimebreach'), value: cutoffBreachText },
            ]}
          />
        </Box>
      ) : (
        <>
          {/* First row: two columns */}
          <Box px={2} py={2}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl component="fieldset" disabled={disabled} fullWidth>
                  <SectionLabel>{ translateLang('fileErrorRejectionOptions') }</SectionLabel>
                  <RadioGroup
                    value={value.errorRejection}
                    onChange={(e) =>
                      setValue('errorRejection', e.target.value as FileUploadOptionsState['errorRejection'])
                    }
                  >
                    <FormControlLabel value="rejectBatch" control={<Radio />} label= {translateLang('rejectErroneousBatch')} />
                    <FormControlLabel value="rejectInstruction" control={<Radio />} label= { translateLang('rejectErroneousInstruction')} />
                    <FormControlLabel value="rejectTransaction" control={<Radio />} label= { translateLang('rejectErroneousTransaction')} />
                  </RadioGroup>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl component="fieldset" disabled={disabled} fullWidth>
                  <SectionLabel>{translateLang('cutOfftimebreach') }</SectionLabel>
                  <RadioGroup
                    value={value.cutoffBreach}
                    onChange={(e) =>
                      setValue('cutoffBreach', e.target.value as FileUploadOptionsState['cutoffBreach'])
                    }
                  >
                    <FormControlLabel value="rejectBatch" control={<Radio />} label={translateLang('rejectBatch') } />
                    <FormControlLabel value="rejectInstruction" control={<Radio />} label={translateLang('rejectInstruction') }/>
                    <FormControlLabel value="adjustInstruction" control={<Radio />} label={translateLang('adjustInstruction') } />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Second row: default posting options (hidden for collection type) */}
          {!hidePostingOptions && (
            <>
              <Box px={2} py={2}>
                <FormControl component="fieldset" disabled={disabled}>
                  <SectionLabel>{translateLang('defaultPostingOptions')}</SectionLabel>
                  <RadioGroup
                    value={value.posting}
                    onChange={(e) => setValue('posting', e.target.value as FileUploadOptionsState['posting'])}
                  >
                    <FormControlLabel value="consolidated" control={<Radio />} label={translateLang('consolidated') } />
                    <FormControlLabel value="itemised" control={<Radio />} label={translateLang('itemised') } />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Divider />
            </>
          )}

          {/* Final row: checkbox (hidden for collection type) */}
          {!hideAllowEditing && (
            <Box px={2} py={1.5}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={value.allowEditingAfterUpload}
                    onChange={(e) => setValue('allowEditingAfterUpload', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label={translateLang('allowEditingAfterUpload') }
              />
            </Box>
          )}
        </>
      )}
    </CommonAccordion>
  );
};
