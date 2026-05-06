'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Box,
  Paper,
  Typography,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import { Button, TextField, Select } from 'components/lib/Forms';
import { useForm, Controller } from 'react-hook-form';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import BreadcrumbList from 'components/lib/Page/Breadcrumb';
import styles from './CreatUserAccountNew.module.scss';

// Types
interface UserAccountFormData {
  userAccountName: string;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  authorisationClass: string;
  language: string;
  emailAddress: string;
  useForCommunication: boolean;
  allowMobileAccess: boolean;
  searchUsers: string;
  rolesAssigned: string;
}

// Dummy data
const AUTHORIZATION_CLASSES = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Standard User', value: 'standard' },
  { label: 'Limited User', value: 'limited' },
  { label: 'View Only', value: 'view_only' },
];

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Afrikaans', value: 'af' },
  { label: 'French', value: 'fr' },
  { label: 'Spanish', value: 'es' },
];

const USERS_LIST = [
  { label: 'John Doe', value: 'john_doe' },
  { label: 'Jane Smith', value: 'jane_smith' },
  { label: 'Robert Johnson', value: 'robert_johnson' },
  { label: 'Maria Garcia', value: 'maria_garcia' },
];

const ROLES_LIST = [
  { label: 'Admin', value: 'admin' },
  { label: 'Manager', value: 'manager' },
  { label: 'User', value: 'user' },
  { label: 'Approver', value: 'approver' },
];

const CreatUserAccountNew = () => {
  const t = useTranslations('userAccounts') || {};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<UserAccountFormData>({
    mode: 'onBlur',
    defaultValues: {
      userAccountName: '',
      startDate: null,
      endDate: null,
      authorisationClass: '',
      language: '',
      emailAddress: '',
      useForCommunication: true,
      allowMobileAccess: true,
      searchUsers: '',
      rolesAssigned: '',
    },
  });

  const breadcrumbLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/user-accounts', label: 'User accounts' },
    { href: '/user-accounts/create', label: 'Create a user account' },
  ];

  const onSubmit = async (data: UserAccountFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('Form submitted with data:', data);
      setSubmitMessage({
        type: 'success',
        message: 'User account created successfully!',
      });
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Failed to create user account. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
  };

  return (
    <div className={styles.container}>
      <BreadcrumbList links={breadcrumbLinks} />

      {/* Page Header */}
      <Box className={styles.pageHeader}>
        <Typography variant="h4" className={styles.pageTitle}>
          Create a user account
        </Typography>
      </Box>

      {/* Main Form Content */}
      <Box className={styles.formContent}>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Submission Message */}
          {submitMessage && (
            <Paper className={`${styles.message} ${styles[submitMessage.type]}`}>
              <Typography>{submitMessage.message}</Typography>
            </Paper>
          )}

          {/* User Account Details Section */}
          <Paper className={styles.formSection}>
            <Box className={styles.sectionHeader}>
              <Box className={styles.sectionIcon}></Box>
              <Typography className={styles.sectionTitle}>
                User account details
              </Typography>
            </Box>

            <Box className={styles.formGrid}>
              {/* User Account Name */}
              <Box className={styles.formField}>
                <Controller
                  name="userAccountName"
                  control={control}
                  rules={{
                    required: 'User account name is required',
                    minLength: {
                      value: 3,
                      message: 'Must be at least 3 characters',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="User account name"
                      placeholder="Enter user account name"
                      error={!!errors.userAccountName}
                      helperText={errors.userAccountName?.message}
                      fullWidth
                    />
                  )}
                />
              </Box>

              {/* Date Range */}
              <Box className={styles.dateRangeContainer}>
                {/* Start Date */}
                <Box className={styles.formField}>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{
                      required: 'Start date is required',
                    }}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label="Start date"
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.startDate,
                              helperText: errors.startDate?.message,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Box>

                {/* End Date */}
                <Box className={styles.formField}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          {...field}
                          label="End date"
                          format="DD/MM/YYYY"
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: !!errors.endDate,
                              helperText: errors.endDate?.message,
                            },
                          }}
                        />
                      </LocalizationProvider>
                    )}
                  />
                </Box>
              </Box>

              {/* Authorization Class */}
              <Box className={styles.formField}>
                <Controller
                  name="authorisationClass"
                  control={control}
                  rules={{
                    required: 'Authorization class is required',
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      formOptions={{ fullWidth: true }}
                      selectProps={{
                        label: 'Authorisation class',
                        labelId: 'authorisation-class-label',
                      }}
                      options={AUTHORIZATION_CLASSES}
                      error={!!errors.authorisationClass}
                      helperText={errors.authorisationClass?.message}
                    />
                  )}
                />
              </Box>

              {/* Language */}
              <Box className={styles.formField}>
                <Controller
                  name="language"
                  control={control}
                  rules={{
                    required: 'Language is required',
                  }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      formOptions={{ fullWidth: true }}
                      selectProps={{
                        label: 'Language',
                        labelId: 'language-label',
                      }}
                      options={LANGUAGES}
                      error={!!errors.language}
                      helperText={errors.language?.message}
                    />
                  )}
                />
              </Box>

              {/* Email Address */}
              <Box className={styles.formField}>
                <Controller
                  name="emailAddress"
                  control={control}
                  rules={{
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email address"
                      type="email"
                      placeholder="Enter email address"
                      error={!!errors.emailAddress}
                      helperText={errors.emailAddress?.message}
                      fullWidth
                    />
                  )}
                />
              </Box>

              {/* Toggle Buttons */}
              <Box className={styles.toggleContainer}>
                <FormControlLabel
                  control={
                    <Controller
                      name="useForCommunication"
                      control={control}
                      render={({ field }) => <Switch {...field} checked={field.value} />}
                    />
                  }
                  label="Use for communication"
                  className={styles.toggleLabel}
                />

                <FormControlLabel
                  control={
                    <Controller
                      name="allowMobileAccess"
                      control={control}
                      render={({ field }) => <Switch {...field} checked={field.value} />}
                    />
                  }
                  label="Allow mobile access"
                  className={styles.toggleLabel}
                />
              </Box>
            </Box>
          </Paper>

          {/* Assigned User and Roles Section */}
          <Paper className={styles.formSection}>
            <Box className={styles.sectionHeader}>
              <Box className={styles.sectionIcon}></Box>
              <Typography className={styles.sectionTitle}>
                {t('assignedUserAndRoles')}
              </Typography>
            </Box>

            <Box className={styles.formGrid}>
              {/* Search Users */}
              <Box className={styles.formField}>
                <Controller
                  name="searchUsers"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      formOptions={{ fullWidth: true }}
                      selectProps={{
                        label: 'Search users',
                        labelId: 'search-users-label',
                      }}
                      options={USERS_LIST}
                      error={!!errors.searchUsers}
                      helperText={errors.searchUsers?.message}
                    />
                  )}
                />
              </Box>

              {/* Roles Assigned Dropdown */}
              <Box className={styles.formField}>
                <Controller
                  name="rolesAssigned"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      formOptions={{ fullWidth: true }}
                      selectProps={{
                        label: 'Roles assigned to this user',
                        labelId: 'roles-assigned-label',
                      }}
                      options={ROLES_LIST}
                      error={!!errors.rolesAssigned}
                      helperText={errors.rolesAssigned?.message}
                    />
                  )}
                />
              </Box>
            </Box>
          </Paper>

          {/* Action Buttons */}
          <Box className={styles.actionButtons}>
            <Button
              buttonVariant="tertiary"
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              CANCEL
            </Button>
            <Button
              buttonVariant="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  Submitting...
                </Box>
              ) : (
                'NEXT'
              )}
            </Button>
          </Box>

          {/* Review and Submit Note */}
          <Box className={styles.reviewNote}>
            <Box className={styles.stepIndicator}>2</Box>
            <Typography className={styles.stepLabel}>Review and submit</Typography>
            <Typography className={styles.stepDescription}>Description</Typography>
          </Box>
        </form>
      </Box>
    </div>
  );
};

export default CreatUserAccountNew;
