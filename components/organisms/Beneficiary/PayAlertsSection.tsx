'use client';
 
import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Box, Typography, ButtonBase } from '@mui/material';
import { Button, PhoneNumber } from 'dist/standard-bank-react';
import Textfield from '@atoms/Textfield/Textfield';
import SelectField from '@atoms/Select/Select';
import BellIcon from 'public/icons/icn_bell_bell.svg';
import CheckNormalIcon from 'public/icons/icn_check_normal.svg';
import CloseStandardBlueIcon from 'public/icons/close_standard_blue.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import EditIcon from 'public/icons/col-icon-left-pencil.svg';
import SaveIcon from 'public/icons/col-icon-left-save.svg';
import CloseIcon from 'public/icons/close-icon.svg';
import {
  MAX_PAY_ALERTS,
  type PayAlertErrors,
  type PayAlertRow,
  removePayAlertRow,
  resizePayAlertRows,
} from 'src/utils/beneficiaryPayAlerts';
import { buildTestId } from 'src/utils/testIds';
 
type SectionMode = 'edit' | 'review';
 
interface PayAlertsSectionProps {
  rows: PayAlertRow[];
  onRowsChange: (rows: PayAlertRow[]) => void;
  errors?: PayAlertErrors;
  mode?: SectionMode;
  allowReviewEdit?: boolean;
  onClearErrors?: () => void;
  testIdPrefix?: string;
  embedded?: boolean;
}
 
const alertTypeOptions = [
  { label: 'SMS', value: 'SMS' },
  { label: 'Email', value: 'Email' },
];
 
const countOptions = Array.from({ length: MAX_PAY_ALERTS + 1 }, (_, value) => ({
  label: String(value),
  value: String(value),
}));
 
const reviewHeadingCellSx = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#5C6C80',
  fontWeight: 500,
};
 
const reviewValueCellSx = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#222E37',
  fontWeight: 500,
};
 
const fieldCellSx = {
  minWidth: 0,
};
 
const actionCellSx = {
  display: 'flex',
  alignItems: 'center',
  height: '52px',
};
 
const fieldErrorSx = {
  paddingTop: '4px',
  paddingLeft: '16px',
  color: '#E31E46',
  fontSize: '12px',
  fontWeight: 400,
  lineHeight: '16px',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
};
 
const createJourneyFieldLookSx = {
  '& .MuiOutlinedInput-root': { borderRadius: '8px', height: '48px' },
  '& .MuiInputLabel-root:not(.MuiInputLabel-shrink)': {
    top: '24px',
    transform: 'translateY(-50%)',
    left: '14px',
  },
  '& .MuiInputLabel-root.MuiInputLabel-shrink': {
    top: '0px',
    left: '0px',
  },
};
 
function PayAlertsSection({
  rows,
  onRowsChange,
  errors = {},
  mode = 'edit',
  allowReviewEdit = false,
  onClearErrors,
  testIdPrefix = 'pay-alerts',
  embedded = false,
}: PayAlertsSectionProps) {
  const [isReviewEditing, setIsReviewEditing] = useState(false);
  const [snapshotRows, setSnapshotRows] = useState<PayAlertRow[] | null>(null);
  const hasErrors = Object.keys(errors).length > 0;
  const isEditing = mode === 'edit' || (mode === 'review' && (isReviewEditing || hasErrors));
 
  const onChangeRowField = (index: number, field: keyof PayAlertRow, value: any) => {
    const nextRows = rows.map((row, rowIndex) =>
      rowIndex === index
        ? {
            ...row,
            [field]: value,
          }
        : row,
    );
    onRowsChange(nextRows);
    onClearErrors?.();
  };
 
  const onChangeCount = (value: string | number) => {
    const parsed = Number(value);
    const nextRows = resizePayAlertRows(rows, parsed);
    onRowsChange(nextRows);
    onClearErrors?.();
  };
 
  const onDeleteRow = (index: number) => {
    const nextRows = removePayAlertRow(rows, index);
    onRowsChange(nextRows);
    onClearErrors?.();
  };
 
  const reviewRows = useMemo(
    () =>
      rows.map((row, index) => ({
        ...row,
        alertId: index + 1,
      })),
    [rows],
  );
 
  const renderEditRows = () => {
    if (!rows.length) {
      return null;
    }
 
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((row, index) => {
          const rowErrors = errors[index] || {};
          return (
            <Box
              key={`pay-alert-row-${index}`}
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 112px 100px',
                  sm: 'minmax(180px, 220px) minmax(140px, 180px) 112px 100px',
                  md: 'minmax(180px, 220px) minmax(140px, 180px) minmax(120px, 1fr) minmax(120px, 1fr) 112px 100px',
                  lg: 'minmax(180px, 220px) minmax(140px, 180px) minmax(120px, 1fr) minmax(120px, 1fr) 112px 100px',
                },
                gap: '12px',
                alignItems: 'start',
              }}
            >
              <Box sx={fieldCellSx}>
                <Textfield
                  name={`alertId-${index}`}
                  label="Alert id"
                  value={String(index + 1)}
                  onChange={() => {}}
                  disabled
                  dataTestId={buildTestId(testIdPrefix, 'alert-id', index)}
                />
              </Box>
 
              <Box
                sx={{
                  ...fieldCellSx,
                  '& .MuiFormHelperText-root': {
                    ...fieldErrorSx,
                    paddingTop: '0px',
                  },
                }}
              >
                <SelectField
                  name={`alertType-${index}`}
                  label="Alert type"
                  value={row.alertType || ''}
                  onChange={(name, value) =>
                    onChangeRowField(index, 'alertType', String(value) as PayAlertRow['alertType'])
                  }
                  options={alertTypeOptions}
                  error={Boolean(rowErrors.alertType)}
                  helperText={rowErrors.alertType}
                  height="52px"
                  dataTestId={buildTestId(testIdPrefix, 'alert-type', index)}
                />
              </Box>
 
              <Box sx={fieldCellSx}>
                <Textfield
                  name={`titleAndName-${index}`}
                  label="Title and name"
                  value={row.titleAndName}
                  onChange={(name, value) => onChangeRowField(index, 'titleAndName', value)}
                  error={Boolean(rowErrors.titleAndName)}
                  helperText=""
                  dataTestId={buildTestId(testIdPrefix, 'title-and-name', index)}
                />
                {rowErrors.titleAndName ? (
                  <Typography sx={fieldErrorSx}>{rowErrors.titleAndName}</Typography>
                ) : null}
              </Box>
 
              <Box sx={fieldCellSx}>
                {row.alertType === 'SMS' ? (
                  <Box sx={{ minWidth: 0 }}>
                    <PhoneNumber
                      label="Address or number"
                      defaultCountry="ZA"
                      value={row.emailOrNumber || ''}
                      error={Boolean(rowErrors.emailOrNumber)}
                      helperText=""
                      onChange={(value: string) => onChangeRowField(index, 'emailOrNumber', value)}
                    />
                  </Box>
                ) : (
                  <Textfield
                    name={`emailOrNumber-${index}`}
                    label="Address or number"
                    value={row.emailOrNumber}
                    onChange={(name, value) => onChangeRowField(index, 'emailOrNumber', value)}
                    error={Boolean(rowErrors.emailOrNumber)}
                    helperText=""
                    dataTestId={buildTestId(testIdPrefix, 'address-or-number', index)}
                  />
                )}
                {rowErrors.emailOrNumber ? (
                  <Typography sx={fieldErrorSx}>{rowErrors.emailOrNumber}</Typography>
                ) : null}
              </Box>
 
              <Box sx={{ ...actionCellSx, justifyContent: 'flex-start' }}>
                <ButtonBase
                  onClick={() => onChangeRowField(index, 'notify', !row.notify)}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    borderRadius: '999px',
                    border: '1px solid #0051FF',
                    backgroundColor: row.notify ? '#0051FF' : '#FFFFFF',
                    color: row.notify ? '#FFFFFF' : '#0051FF',
                    height: '32px',
                    padding: '0 12px',
                    minWidth: '88px',
                    transition: 'all 120ms ease',
                  }}
                  data-testid={buildTestId(testIdPrefix, 'notify-toggle', index)}
                >
                  <Image
                    src={row.notify ? CheckNormalIcon : CloseStandardBlueIcon}
                    alt={row.notify ? 'Notify selected' : 'Notify unselected'}
                    width={16}
                    height={16}
                  />
                  <Typography
                    sx={{
                      fontSize: '12px',
                      lineHeight: '14px',
                      fontWeight: 500,
                      color: row.notify ? '#FFFFFF' : '#0051FF',
                    }}
                  >
                    Notify
                  </Typography>
                </ButtonBase>
              </Box>
 
              <Box sx={{ ...actionCellSx, justifyContent: 'center' }}>
                <Button
                  buttonVariant="error-tertiary"
                  data-testid={buildTestId(testIdPrefix, 'delete', index)}
                  onClick={() => onDeleteRow(index)}
                  startIcon={
                    <Image
                      src={DeleteIcon}
                      alt="delete"
                      width={24}
                      height={24}
                      style={{
                        filter: 'brightness(0) saturate(100%) invert(20%) sepia(87%) saturate(3066%) hue-rotate(339deg) brightness(93%) contrast(95%)',
                      }}
                    />
                  }
                  sx={{
                    width: '90px',
                    height: '48px',
                    minWidth: '90px',
                    minHeight: '48px',
                    '&:hover': {
                      backgroundColor: '#FEF2F4',
                      borderColor: '#E31E46',
                    },
                  }}
                >
                  DELETE
                </Button>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  };
 
  const renderReviewRows = () => {
    if (!reviewRows.length) {
      return (
        <Typography sx={{ fontSize: '14px', color: '#5C6C80' }}>
          No pay alerts added.
        </Typography>
      );
    }
 
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '80px 140px 1fr 1fr 96px',
            gap: '12px',
          }}
        >
          <Typography sx={reviewHeadingCellSx}>Alert id</Typography>
          <Typography sx={reviewHeadingCellSx}>Alert type</Typography>
          <Typography sx={reviewHeadingCellSx}>Title and name</Typography>
          <Typography sx={reviewHeadingCellSx}>Address or number</Typography>
          <Typography sx={reviewHeadingCellSx}>Notify</Typography>
        </Box>
 
        {reviewRows.map((row) => (
          <Box
            key={`pay-alert-review-${row.alertId}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: '80px 140px 1fr 1fr 96px',
              gap: '12px',
            }}
          >
            <Typography sx={reviewValueCellSx}>{row.alertId}</Typography>
            <Typography sx={reviewValueCellSx}>
              {row.alertType === 'SMS' ? 'Number' : row.alertType || '-'}
            </Typography>
            <Typography sx={reviewValueCellSx}>{row.titleAndName || '-'}</Typography>
            <Typography sx={reviewValueCellSx}>{row.emailOrNumber || '-'}</Typography>
            <Typography sx={reviewValueCellSx}>{row.notify ? 'Yes' : 'No'}</Typography>
          </Box>
        ))}
      </Box>
    );
  };
 
  const renderReviewActionControls = () => {
    if (!(mode === 'review' && allowReviewEdit && !hasErrors)) {
      return null;
    }
 
    return isReviewEditing ? (
      <Box sx={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Button
          buttonVariant="text"
          onClick={() => {
            if (snapshotRows) {
              onRowsChange(snapshotRows);
            }
            onClearErrors?.();
            setSnapshotRows(null);
            setIsReviewEditing(false);
          }}
          sx={{ color: '#0051FF', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}
          startIcon={<Image src={CloseIcon} alt="Cancel edit" width={20} height={20} />}
          style={{ height: '36px', minHeight: '36px', width: '110px' }}
        >
          CANCEL
        </Button>
        <Button
          buttonVariant="text"
          onClick={() => {
            setSnapshotRows(null);
            setIsReviewEditing(false);
          }}
          sx={{ color: '#0051FF', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}
          startIcon={<Image src={SaveIcon} alt="Save edit" width={20} height={20} />}
          style={{ height: '36px', minHeight: '36px', width: '90px' }}
        >
          DONE
        </Button>
      </Box>
    ) : (
      <Button
        buttonVariant="text"
        onClick={() => {
          setSnapshotRows(rows.map((row) => ({ ...row })));
          setIsReviewEditing(true);
        }}
        sx={{ color: '#0051FF', fontWeight: 700, textTransform: 'uppercase' }}
        style={{ width: '85px', height: '36px', minHeight: '36px', fontSize: '15px' }}
        startIcon={<Image src={EditIcon} alt="Edit pay alerts" width={20} height={20} />}
      >
        EDIT
      </Button>
    );
  };
 
  const reviewActionControls = renderReviewActionControls();
 
  const sectionContent = (
    <Box
      sx={{
        ...createJourneyFieldLookSx,
        padding: embedded ? 0 : '8px 12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {embedded && reviewActionControls ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>{reviewActionControls}</Box>
      ) : null}
      {isEditing ? (
        <>
          <Box
            sx={{
              paddingTop: '0px',
              maxWidth: '340px',
            }}
          >
            <SelectField
              name="payAlertCount"
              label="How many pay alerts to add"
              value={String(rows.length)}
              onChange={(_, value) => onChangeCount(value)}
              options={countOptions}
              height="52px"
              dataTestId={buildTestId(testIdPrefix, 'count')}
            />
          </Box>
          {rows.length ? <Box sx={{ paddingTop: '8px' }}>{renderEditRows()}</Box> : null}
        </>
      ) : (
        renderReviewRows()
      )}
    </Box>
  );
 
  if (embedded) {
    return sectionContent;
  }
 
  return (
    <Box
      sx={{
        border: '1px solid #E0E5EB',
        borderRadius: '8px',
        backgroundColor: '#FFFFFF',
      }}
      data-testid={buildTestId(testIdPrefix, 'section')}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px',
          borderBottom: '1px solid #E0E5EB',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src={BellIcon} alt="Pay alerts" width={28} height={28} />
          <Typography sx={{ fontWeight: 400, fontSize: '20px', color: '#333' }}>Pay alerts</Typography>
        </Box>
        {reviewActionControls}
      </Box>
      {sectionContent}
    </Box>
  );
}
 
export default PayAlertsSection;
 