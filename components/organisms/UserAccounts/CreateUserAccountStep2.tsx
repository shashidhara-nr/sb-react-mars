'use client';
import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Grid, Typography, useTheme, Chip } from '@mui/material';
import { Icon } from '@atoms/index';
import FormActionButtons from 'components/common/formActionButtons';
import styles from './CreateUserAccountStep2.module.scss';

interface Step2Props {
  formData: any;
  onNext: () => void;
  onCancel: () => void;
}

// Dummy data for display
const dummyUserProfileData = {
  userId: 'XXXXXX',
  status: 'Active',
  firstName: '[First name]',
  lastName: '[Last name]',
  dateOfBirth: '[Date of birth]',
  idNumber: '[ID number]',
  language: '[Language]',
  gender: '[Gender]',
  addressLine1: '[Address line 1]',
  addressLine2: '[Address line 2]',
  countryRegion: '[Country/ Region]',
  phoneNumber: '[+27 XXX XXXX]',
  emailAddress: '[Email address]',
};

const dummySelectedRoles = [
  { id: 1, label: 'Label 1', value: 'label1' },
  { id: 2, label: 'Label 2', value: 'label2' },
  { id: 3, label: 'Label 3', value: 'label3' },
  { id: 4, label: 'Label 4', value: 'label4' },
];

const dummySelectedUser = {
  name: 'Maya Smit',
  userId: 'A1234565',
  email: 'Maya.smit@yahoo.com',
  status: 'Active',
};

const CreateUserAccountStep2 = ({ 
  formData,
  onNext, 
  onCancel
}: Step2Props) => {
  const t = useTranslations('userAccounts');
  const theme = useTheme();

  // Render user account details as read-only
  const renderReadOnlySection = () => (
    <Box className={styles.card}>
      <Box className={styles.sectionHeader}>
        <Icon
          name="userAccount"
          width="20px"
          height="20px"
          bgColor={theme.palette.text.secondary}
        />
        <Typography className={styles.sectionTitle}>
          {t('userAccountDetails')}
        </Typography>
      </Box>

      <Grid container spacing={2} className={styles.fieldGrid}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.readOnlyField}>
            <Typography className={styles.fieldLabel}>
              {t('userAccountName')}
            </Typography>
            <Typography className={styles.fieldValue}>
              {formData?.userAccountName || 'Populated'}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.readOnlyField}>
            <Typography className={styles.fieldLabel}>
              {t('authClass')}
            </Typography>
            <Typography className={styles.fieldValue}>
              {formData?.authClass || 'Populated'}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.readOnlyField}>
            <Typography className={styles.fieldLabel}>
              {t('startDate')}
            </Typography>
            <Typography className={styles.fieldValue}>
              {formData?.startDate || '31/05/2023'}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.readOnlyField}>
            <Typography className={styles.fieldLabel}>
              {t('endDate')}
            </Typography>
            <Typography className={styles.fieldValue}>
              {formData?.endDate || '31/05/2023'}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.readOnlyField}>
            <Typography className={styles.fieldLabel}>
              {t('language')}
            </Typography>
            <Typography className={styles.fieldValue}>
              {formData?.language || 'South Africa'}
            </Typography>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.readOnlyField}>
            <Typography className={styles.fieldLabel}>
              {t('emailAddress')}
            </Typography>
            <Typography className={styles.fieldValue}>
              {formData?.emailAddress || 'Populated'}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Toggles for communication preferences */}
      <Box className={styles.togglesContainer}>
        {formData?.useForCommunication && (
          <Box className={styles.togglePill} style={{ backgroundColor: theme.palette.primary.main }}>
            <Icon name="check" width="16px" height="16px" bgColor="#fff" />
            <Typography className={styles.toggleLabel}>
              {t('useForCommunication')}
            </Typography>
          </Box>
        )}
        {formData?.allowMobileAccess && (
          <Box className={styles.togglePill} style={{ backgroundColor: theme.palette.primary.main }}>
            <Icon name="check" width="16px" height="16px" bgColor="#fff" />
            <Typography className={styles.toggleLabel}>
              {t('allowMobileAccess')}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );

  // Assigned user and roles section
  const renderAssignedUserRolesSection = () => (
    <Box className={styles.card}>
      <Box className={styles.sectionHeader}>
        <Icon
          name="user"
          width="20px"
          height="20px"
          bgColor={theme.palette.text.secondary}
        />
        <Typography className={styles.sectionTitle}>
          {t('assignedUserAndRoles')} 
        </Typography>
      </Box>

      {/* User selection with summary */}
      <Box className={styles.userSelectionContainer}>
        <Box className={styles.userSummary}>
          <Box className={styles.userAvatar}>
            <Icon name="user" width="24px" height="24px" bgColor={theme.palette.primary.main} />
          </Box>
          <Box>
            <Typography className={styles.userName}>{dummySelectedUser.name}</Typography>
            <Typography className={styles.userId}>{dummySelectedUser.userId}</Typography>
          </Box>
        </Box>
        <Box className={styles.userDetails}>
          <Box className={styles.userDetail}>
            <Typography className={styles.detailLabel}>Email address</Typography>
            <Typography className={styles.detailValue}>{dummySelectedUser.email}</Typography>
          </Box>
          <Box className={styles.userDetail}>
            <Typography className={styles.detailLabel}>Status</Typography>
            <Box className={styles.statusBadge}>
              <Typography className={styles.statusText}>{dummySelectedUser.status}</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Roles */}
      <Box className={styles.rolesContainer}>
        <Typography className={styles.rolesLabel}>
          {t('rolesAssignedToThisUser')}
        </Typography>
        <Box className={styles.rolesPills}>
          {dummySelectedRoles.map((role) => (
            <Chip
              key={role.id}
              label={role.label}
              className={styles.rolePill}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: '#fff',
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );

  // User profile details grid
  const renderUserProfileSection = () => (
    <Box className={styles.card}>
      <Box className={styles.infoGrid}>
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('userId')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.userId}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('firstName')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.firstName}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('dateOfBirth')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.dateOfBirth}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('language')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.language}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('addressDetails')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.addressLine1}
              </Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.countryRegion}
              </Typography>
            </Box>
          </Grid>

          {/* Right Column */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('status')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.status}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('lastName')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.lastName}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('idNumber')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.idNumber}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('gender')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.gender}
              </Typography>
            </Box>

            <Box className={styles.infoField}>
              <Typography className={styles.infoLabel}>{t('addressLine2')}</Typography>
              <Typography className={styles.infoValue}>
                {dummyUserProfileData.addressLine2}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );

  // Phone and email details section
  const renderPhoneEmailSection = () => (
    <Box className={styles.card}>
      <Box className={styles.sectionHeader}>
        <Typography className={styles.sectionTitle}>
          {t('phoneAndEmailDetails')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.infoField}>
            <Typography className={styles.infoLabel}>{t('phoneNumber')}</Typography>
            <Typography className={styles.infoValue}>
              {dummyUserProfileData.phoneNumber}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.infoField}>
            <Typography className={styles.infoLabel}>{t('communicationPreference')}</Typography>
            <Typography className={styles.infoValue}>
              {t('useForCommunication')}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.infoField}>
            <Typography className={styles.infoLabel}>{t('emailAddress')}</Typography>
            <Typography className={styles.infoValue}>
              {dummyUserProfileData.emailAddress}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <Box className={styles.infoField}>
            <Typography className={styles.infoLabel}>{t('communicationPreference')}</Typography>
            <Typography className={styles.infoValue}>
              {t('useForCommunication')}, {t('useForAlerts')}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box className={styles.container}>
      {renderReadOnlySection()}
      {renderAssignedUserRolesSection()}
      {renderUserProfileSection()}
      {renderPhoneEmailSection()}

      <Box className={styles.actionButtons}>
        <FormActionButtons
          nextText={t('next')}
          cancelText={t('cancel')}
          onCancel={onCancel}
          onNext={onNext}
        />
      </Box>
    </Box>
  );
};

export default CreateUserAccountStep2;
