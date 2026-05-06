import OTPInput from '@atoms/ForgotPasswordCard/OtpInput';
import { Button, TextField, Snackbar } from 'dist/standard-bank-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import styles from '../Signin/Signin.module.scss';

interface OTPAuthProps {
  username: string;
  setUsername: (username: string) => void;
  onOTPComplete?: (otp: string) => void;
  onResendOTP?: () => void;
  onCancel?: () => void;
  otpLength?: number;
}

export default function OTPAuth({
  username,
  setUsername,
  onOTPComplete,
  onResendOTP,
  onCancel,
  otpLength = 5,
}: OTPAuthProps) {
  const [otpValue, setOtpValue] = useState('');
  const t = useTranslations('signinHub');

  return (
    <>
      <div className={`${styles.snackbarWrapper} ${styles.longMessage} ${styles.otpSnackbar}`} data-testid="snackbar-static">
        <Snackbar
          snackBarMessage={t('otpSentMsg')}
          snackbarTheme={"info" as any}
          hideIcon={true}
          buttons={[]}
        />
      </div>
      <form className={styles.form} data-testid="otp-auth-container">

      <div className={styles.formGroup}>
        <div className={styles.textField} data-testid="otp-username-input">
          <TextField
            type="text"
            value={username}
            placeholder={t('usernamePlaceholder')}
            onChange={(e) => setUsername((e.target as HTMLInputElement).value)}
            disabled={true}
            label={t('usernameLabel')}
            name="username"
          />
        </div>
      </div>

      <div className={styles.otpInputWrapper}>
        <OTPInput length={otpLength} onComplete={setOtpValue} onResend={onResendOTP} data-testid="otp-input-component" />
      </div>

      <div className={styles.buttonGroup} data-testid="otp-button-group">
        <Button
          type="button"
          buttonVariant="primary"
          onClick={() => otpValue && onOTPComplete?.(otpValue)}
          disabled={otpValue.length < otpLength}
          style={{ width: '100%', height: '48px', minHeight: '48px' }}
          data-testid="otp-signin-button"
        >
          {t('signInButton')}
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          buttonVariant="secondary"
          style={{ width: '100%', height: '48px', minHeight: '48px' }}
          disabled={false}
          data-testid="otp-cancel-button"
        >
          {t('cancelButton')}
        </Button>
      </div>
    </form>
  </>
  );
}