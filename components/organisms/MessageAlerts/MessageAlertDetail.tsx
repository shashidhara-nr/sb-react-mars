'use client';
import { Box, Typography } from '@mui/material';
import { DetailDrawer, DetailField } from 'components/organisms/DetailDrawer';
import { Icon } from '@atoms/index';
import React from 'react';
import { buildTestId } from 'src/utils/testIds';
import styles from 'components/organisms/DetailDrawer/DetailDrawer.module.scss';

interface MessageAlertDetailProps {
  open: boolean;
  onClose: () => void;
  selectedMessage: any;
  selectedMessageIndex: number;
  mappedRows: any[];
  onNextMessage: () => void;
  onPreviousMessage: () => void;
}

const testIdPrefix = 'message-alerts-detail';

const formatDateString = (dateStr: string): string => {
  if (!dateStr) return '';
  const [day, month, year] = dateStr.split('/');
  const monthNames = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  const monthIndex = parseInt(month, 10) - 1;
  return `${day} ${monthNames[monthIndex]} ${year}`;
};

const MailBoxIcon = () => (
  <Icon name="mailBox" width="20px" height="20px" bgColor="#222E37" />
);

const MessageAlertDetail: React.FC<MessageAlertDetailProps> = ({
  open,
  onClose,
  selectedMessage,
  selectedMessageIndex,
  mappedRows,
  onNextMessage,
  onPreviousMessage,
}) => {
  const fields: DetailField[] = [
    {
      label: 'Message id.',
      key: 'messageId',
    },
    {
      label: 'Date sent',
      key: 'dateSent',
      formatter: formatDateString,
    },
    {
      label: 'Priority',
      key: 'priority',
    },
    {
      label: 'Subject',
      key: 'subject',
    },
  ];

  const contentSection = selectedMessage && (
    <Box>
      <Typography className={styles.contentTitle}>
        Message Alert
      </Typography>
      <Typography className={styles.contentText}>
        {selectedMessage.message || selectedMessage.content}
      </Typography>
    </Box>
  );

  return (
    <DetailDrawer
      open={open}
      onClose={onClose}
      data={selectedMessage}
      dataIndex={selectedMessageIndex}
      totalCount={mappedRows.length}
      onNext={onNextMessage}
      onPrevious={onPreviousMessage}
      fields={fields}
      title="Message Alert"
      icon={MailBoxIcon}
      contentSection={contentSection}
      width={692}
      data-testid={buildTestId(testIdPrefix, 'drawer')}
    />
  );
};

export default MessageAlertDetail;
