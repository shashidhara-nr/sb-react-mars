'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import styles from './QRCodeAuth.module.scss';
import QrCodeCard from '../../atoms/QrCodeCard/QrCodeCard';
import {
  QRCodeTimer,
  QRCodePollingManager,
  handleQRCodeStatus,
  STRONG_AUTH_CONSTANTS,
  QRCodeStatus,
} from '../../../lib/utils/qrCodeAuth';
import { pollQRCodeStatus, cancelStrongAuth } from '../../../lib/api/authApi';
import { Button } from 'dist/standard-bank-react';
import { clearSessionCookies } from '../../../lib/utils/cookieUtils';

interface QRCodeAuthProps {
  qrCodeData: string;
  sessionId: string;
  userName: string;
  timeout?: number; // in seconds
  onSuccess: (digitalKey: string, userList?: any[]) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function QRCodeAuth({
  qrCodeData,
  sessionId,
  userName,
  timeout = STRONG_AUTH_CONSTANTS.STRONG_AUTH_QR_CODE_TIMEOUT,
  onSuccess,
  onError,
  onCancel,
}: QRCodeAuthProps) {
  const router = useRouter();
  const t = useTranslations('signinHub');
  
  // GROUPED STATES
  const [qrState, setQrState] = useState({
    timeRemaining: timeout,
    isScanned: false,
    qrCodeImage: '',
  })

  const [timerInstance] = useState(() => new QRCodeTimer());
  const [pollingManager] = useState(() => new QRCodePollingManager());
  
  // Store callback refs to prevent polling re-initialization
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onCancelRef = useRef(onCancel);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onCancelRef.current = onCancel;
  }, [onSuccess, onError, onCancel]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    return QRCodeTimer.formatTime(seconds);
  };

  const handleTimeout = useCallback(() => {
    pollingManager.stop();
    onErrorRef.current(t('qrSessionTimedOut'))
  }, [pollingManager, t])

  // Initialize QR code timer
  useEffect(() => {
    timerInstance.init(timeout, true);
    
    timerInstance.setOnTick((remaining: number) => {
      setQrState((prev) => ({ ...prev, timeRemaining: remaining }));
    });

    timerInstance.setOnTimeout(() => {
      handleTimeout();
    });

    timerInstance.start();

    return () => {
      timerInstance.stop();
    };
  }, [timeout, timerInstance, handleTimeout]);

  // Initialize polling
  useEffect(() => {
    pollingManager.setPollFunction(async () => {
      return await pollQRCodeStatus(sessionId, userName);
    });

    pollingManager.setOnStatusChange((status: QRCodeStatus) => {
      const result = handleQRCodeStatus(status);

      if (result.isScanned && !qrState.isScanned) {
        setQrState((prev) => ({ ...prev, isScanned: true }));
      }

      if (result.isApproved && result.shouldCompleteLogin) {
        timerInstance.stop();
        pollingManager.stop();
        
        if (status.digitalKey) {
          onSuccessRef.current(status.digitalKey, status.userList);
        } else {
          onErrorRef.current(t('qrNoDigitalKey'));
        }
      }

      if (result.isError) {
        timerInstance.stop();
        pollingManager.stop();
        onErrorRef.current(status.errorMessage || t('qrCodeAuthFailed'));
      }
    });

    pollingManager.setInterval(STRONG_AUTH_CONSTANTS.STRONG_AUTH_STATUS_PING_INTERVAL);
    pollingManager.start();

    return () => {
      pollingManager.stop();
    };
  }, [sessionId, qrState.isScanned, timerInstance, pollingManager]);

  // Generate QR code image from data
  useEffect(() => {
    // You can use a QR code library here (e.g., qrcode.react or qrcode)
    // For now, using the data as-is
    setQrState((prev) => ({ ...prev, qrCodeImage: qrCodeData }))
  }, [qrCodeData]);

  const handleCancelClick = useCallback(async () => {
    timerInstance.stop();
    pollingManager.stop();

    try {
      await cancelStrongAuth(sessionId);
    } catch (error) {

    }

    clearSessionCookies();

    onCancelRef.current();
  }, [sessionId, timerInstance, pollingManager]);

  return (
    <div data-testid="qrcode-auth-container">
      <QrCodeCard timeRemaining={qrState.timeRemaining} userName={userName}>
        {!qrState.isScanned ? (
          // Show QR code
          <div className={styles.qrCodeSection} data-testid="qrcode-display-section">
            <div style={{ marginLeft: '107px', marginRight: '106px' }}>
              {qrState.qrCodeImage ? (
                <Image
                  src={qrState.qrCodeImage}
                  alt="QR Code"
                  className={styles.qrCodeImage}
                  width={203}
                  height={203}
                />
              ) : (
                <div className={styles.qrCodePlaceholder}>
                  <p>{t('loadingQRCode')}</p>
                </div>
              )}
            </div>

            <p style={{ textAlign: 'center', fontSize: '14px', color: '#767676', marginTop: '53px', marginBottom: 0 }}>
              {t('otpExpiryMessage')} {formatTime(qrState.timeRemaining)}
            </p>
          </div>
        ) : (
          // Show waiting for approval
          <div className={styles.waitingSection} data-testid="qrcode-waiting-section">
            <div className={styles.progressBar}>
              <div
                className={styles.progressBarInner}
                style={{
                  animationDuration: `${qrState.timeRemaining}s`,
                }}
              />
            </div>

            <div className={styles.waitingContent}>
              <div className={styles.checkIcon}>✓</div>
              <h3>{t('qrCodeScanned')}</h3>
              <p>{t('approveOnDevice')}</p>
            </div>
          </div>
        )}

        <div className={styles.actions} data-testid="qrcode-actions">
          <Button
            buttonVariant="secondary"
            style={{ height: 48, width: '100%', minWidth: 106 }}
            onClick={handleCancelClick}
            data-testid="qrcode-cancel-button"
          >
            {t('cancelButton')}
          </Button>
        </div>
      </QrCodeCard>
    </div>
  );
}