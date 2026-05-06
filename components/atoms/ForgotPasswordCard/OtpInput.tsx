'use client'

import React, { useState, useRef, KeyboardEvent, ClipboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import styles from './OtpInput.module.scss'

interface OTPInputProps {
  length?:  number
  onComplete?: (otp: string) => void
  onResend?: () => void
}

export default function OTPInput({ 
  length = 5, 
  onComplete,
  onResend 
}: OTPInputProps) {
  const t = useTranslations('signinHub')
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index:  number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    if (!/^\d*$/.test(value)) {
      return
    }

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newOtp.every(digit => digit !== '')) {
      onComplete?.(newOtp.join(''))
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && ! otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, length)
    
    if (!/^\d+$/.test(pastedData)) {
      return
    }

    const newOtp = [...otp]
    pastedData.split('').forEach((digit, index) => {
      if (index < length) {
        newOtp[index] = digit
      }
    })
    setOtp(newOtp)

    const lastFilledIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[lastFilledIndex]?.focus()

    if (newOtp. every(digit => digit !== '')) {
      onComplete?.(newOtp.join(''))
    }
  }

  const handleResend = () => {
    setOtp(Array(length).fill(''))
    inputRefs.current[0]?. focus()
    onResend?.()
  }

  return (
    <div className={styles.container} data-testid="otp-input-container">
      <div className={styles.label} data-testid="otp-input-label">
        {t('otpLabel')}
      </div>
      
      <div className={styles.inputContainer} data-testid="otp-input-fields-container">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={styles.input}
            data-testid={`otp-input-field-${index}`}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={handleResend}
        className={styles.resendButton}
        data-testid="otp-resend-button"
      >
        {t('resendOTPButton')}
      </button>
    </div>
  )
}