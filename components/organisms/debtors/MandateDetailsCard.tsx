import React from 'react';
import { Box, Typography } from '@mui/material';
import { MandateDetails } from '../../../types/mandate';
import Image from 'next/image';
import CalendarIcon from 'public/icons/icn_calendar.svg';
import { useTranslations } from 'next-intl';
import { buildTestId } from 'src/utils/testIds';

interface MandateDetailsCardProps {
  mandates: MandateDetails[];
}

const formatDate = (dateValue: Date | string | number | undefined | null): string => {
  if (!dateValue) return 'N/A';
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString();
};

const MandateDetailsCard: React.FC<MandateDetailsCardProps> = ({ mandates }) => {
  const translateLang = useTranslations('debtorsHubData');
  const testIdPrefix = 'debtor-mandate-details';
  
  if (!mandates || mandates.length === 0) {
    return null;
  }

  return (
    <Box data-testid={buildTestId(testIdPrefix, 'container')}>
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          padding: '24px 20px',
          borderBottom: '1px solid #E5E5E5',
          backgroundColor: '#FFFFFF',
        }} 
        data-testid={buildTestId(testIdPrefix, 'header')}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px' }}>
          <Image src={CalendarIcon} alt="mandates" width={24} height={24} style={{ filter: 'invert(27%) sepia(8%) saturate(916%) hue-rotate(169deg) brightness(94%) contrast(87%)' }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600, 
            fontSize: '18px', 
            lineHeight: '24px',
            color: '#222E37',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {translateLang('mandates')}
        </Typography>
      </Box>

      <Box sx={{ padding: '24px 20px', backgroundColor: '#FFFFFF' }}>
        {mandates.map((mandate, index) => (
          <Box
            key={index}
            sx={{
              mb: index < mandates.length - 1 ? 3 : 0,
              p: '20px',
              border: '1px solid #E5E5E5',
              borderRadius: '12px',
              backgroundColor: '#FAFBFC',
            }}
            data-testid={buildTestId(testIdPrefix, 'mandate-card', index)}
          >
            {/* Two-column grid layout matching Figma */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '24px 32px',
              '@media (max-width: 900px)': {
                gridTemplateColumns: '1fr',
              }
            }}>
              {/* Left Column */}
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  {translateLang('mandateId')}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                  {mandate.mandateId || '-'}
                </Typography>
              </Box>

              {/* Right Column */}
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  {translateLang('mandateType')}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                  {mandate.mandateType || '-'}
                </Typography>
              </Box>

              {/* Left Column */}
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  {translateLang('collectionFrequency')}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                  {mandate.frequency || '-'}
                </Typography>
              </Box>

              {/* Right Column */}
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  {translateLang('beginDate')}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                  {formatDate(mandate.beginDate)}
                </Typography>
              </Box>

              {/* Left Column */}
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  {translateLang('endDate')}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                  {formatDate(mandate.endDate)}
                </Typography>
              </Box>

              {/* Right Column */}
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  {translateLang('debitDayOfMonth')}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                  {mandate.debitDay || '-'}
                </Typography>
              </Box>

              {/* Left Column */}
              {mandate.mandateType === 'Fixed' ? (
                <Box>
                  <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                    {translateLang('fixedAmount')}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                    {mandate.fixedAmount || '-'}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                    {translateLang('minimumAmount')}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                    {mandate.minAmount || '-'}
                  </Typography>
                </Box>
              )}

              {/* Right Column */}
              {mandate.mandateType === 'Variable' && (
                <Box>
                  <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                    {translateLang('maximumAmount')}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                    {mandate.maxAmount || '-'}
                  </Typography>
                </Box>
              )}

              {/* Left Column - Currency */}
              <Box>
                <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                  {translateLang('currency')}
                </Typography>
                <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                  {mandate.currency || '-'}
                </Typography>
              </Box>

              {/* Status - spans full width if present */}
              {mandate.status && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                    {translateLang('status')}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                    {mandate.status}
                  </Typography>
                </Box>
              )}

              {/* Reference Description - spans full width */}
              {mandate.referenceDescription && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" sx={{ color: '#5A6772', fontSize: '12px', lineHeight: '16px', display: 'block', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>
                    {translateLang('observation')}
                  </Typography>
                  <Typography sx={{ fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#222E37', fontFamily: 'Inter, sans-serif' }}>
                    {mandate.referenceDescription}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MandateDetailsCard;
