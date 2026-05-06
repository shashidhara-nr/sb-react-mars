import * as React from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Stack, Typography, Button, Box } from '@mui/material';
import Image from 'next/image';
import IconCancel from 'public/icons/icn_cancel.svg';
import IconFloppy from 'public/icons/icn_floppy.svg';
import IconPencil from 'public/icons/col-icon-left-pencil.svg';
import IconChevronUp from 'public/icons/icn_chevron_up.svg';

interface CommonAccordionProps {
  children: React.ReactNode;
  summary?: React.ReactNode;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  reviewMode?: boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onCancel?: () => void;
  onSave?: () => void;
  actions?: React.ReactNode;
  defaultExpanded?: boolean;
  expandIcon?: React.ReactNode;
  sx?: object;
  summarySx?: object;
  detailsSx?: object;
  disableGutters?: boolean;
  elevation?: number;
  border?: boolean;
}
const CommonAccordion: React.FC<CommonAccordionProps> = ({
  children,
  summary,
  icon,
  title,
  reviewMode,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  actions,
  defaultExpanded = true,
  expandIcon,
  sx,
  summarySx,
  detailsSx,
  disableGutters = true,
  elevation = 0,
  border = true,
}) => {
  // Standard summary layout if icon/title/actions provided
  const renderSummary = () => {
    if (summary) return summary;
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
        {icon}
        {title && (
          <Typography variant="subtitle1" sx={{ fontSize: '1.25rem', fontWeight: 400 }}>
            {title}
          </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {actions ? actions : (
          reviewMode && (
            isEditing ? (
              <Stack direction="row" spacing={1}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCancel?.();
                  }}
                  startIcon={<Image src={IconCancel} alt="cancel" width={16} height={16} />}
                  size="small"
                  variant="text"
                  sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.875rem' }}
                >
                  CANCEL
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave?.();
                  }}
                  startIcon={<Image src={IconFloppy} alt="save" width={16} height={16} />}
                  size="small"
                  variant="text"
                  sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'uppercase', fontSize: '0.875rem' }}
                >
                  SAVE
                </Button>
              </Stack>
            ) : (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
                startIcon={<Image src={IconPencil} alt="edit" width={16} height={16} />}
                size="small"
                variant="text"
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                  },
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                Edit
              </Button>
            )
          )
        )}
      </Stack>
    );
  };

  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters={disableGutters}
      elevation={elevation}
       sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 1,
        '&:before': { display: 'none' },
        ...sx,
      }}
    >
      <AccordionSummary
        expandIcon={
          expandIcon === true
            ? <Image src={IconChevronUp} alt="expand" width={20} height={20} />
            : expandIcon || undefined
        }
       sx={{
          px: 2,
          minHeight: '52px !important',
           borderBottom: '1px solid #eef2f7', 
          '& .MuiAccordionSummary-content': { my: 1 },
          ...summarySx,
        }}
      >
        {renderSummary()}
      </AccordionSummary>
      <AccordionDetails sx={{padding: '0 !important', ...detailsSx }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );
};

export default CommonAccordion;
