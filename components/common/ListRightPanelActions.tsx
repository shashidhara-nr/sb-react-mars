'use client';

import { Box } from '@mui/material';
import { Button } from 'dist/standard-bank-react';
import Image from 'next/image';
import CloseIcon from 'public/icons/icn_close_circle.svg';
import DownloadIcon from 'public/icons/col-icon-download.svg';
import DeleteIcon from 'public/icons/icn_bin.svg';
import { buildTestId } from 'src/utils/testIds';

type ListRightPanelActionsProps = {
  selectedCount: number;
  hasFilters: boolean;
  onRemoveFilters?: () => void;
  onDownloadClick?: () => void;
  onDeleteClick?: () => void;
  testIdPrefix?: string;
};

const ListRightPanelActions = ({
  selectedCount,
  hasFilters,
  onRemoveFilters,
  onDownloadClick,
  onDeleteClick,
  testIdPrefix = 'list-right-actions',
}: ListRightPanelActionsProps) => {
  if (selectedCount === 0 && !hasFilters) return null;

  return (
    <Box sx={{ display: 'flex' }} data-testid={buildTestId(testIdPrefix, 'container')}>
      {hasFilters && onRemoveFilters && (
        <Button
          buttonVariant="tertiary"
          data-testid={buildTestId(testIdPrefix, 'remove-filters')}
          endIcon={<Image src={CloseIcon} alt="close" width={20} height={20} />}
          onClick={onRemoveFilters}
          style={{
            width: '170px',
            height: '32px',
            minWidth: '170px',
            minHeight: '32px',
            textTransform: 'none',
          }}
        >
          Remove filters
        </Button>
      )}
      {selectedCount > 0 && (
        <>
          {onDownloadClick && (
            <Button
              buttonVariant="tertiary"
              data-testid={buildTestId(testIdPrefix, 'download-selected')}
              startIcon={<Image src={DownloadIcon} alt="download" width={24} height={24} />}
              onClick={onDownloadClick}
              style={{
                width: '190px',
                height: '36px',
                minWidth: '131px',
                minHeight: '36px',
              }}
            >
              {`Download (${selectedCount})`}
            </Button>
          )}
          {onDeleteClick && (
            <Button
              buttonVariant="error-tertiary"
              data-testid={buildTestId(testIdPrefix, 'delete-selected')}
              onClick={onDeleteClick}
              startIcon={
                <Image
                  src={DeleteIcon}
                  alt="delete"
                  width={24}
                  height={24}
                  style={{
                    filter:
                      'brightness(0) saturate(100%) invert(20%) sepia(87%) saturate(3066%) hue-rotate(339deg) brightness(93%) contrast(95%)',
                  }}
                />
              }
              style={{
                width: '155px',
                height: '36px',
                minWidth: '155px',
                minHeight: '36px',
              }}
            >
              {`Delete (${selectedCount})`}
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default ListRightPanelActions;
