import React from 'react'

export default function CancellationConfirmationDialogMock({ open, onClose, onCancel, testIdPrefix }: any) {
  if (!open) return null

  return (
    <div data-testid={`${testIdPrefix}-dialog`}>
      <button data-testid={`${testIdPrefix}-close`} onClick={onClose}>
        Close
      </button>
      <button data-testid={`${testIdPrefix}-confirm`} onClick={onCancel}>
        Confirm
      </button>
    </div>
  )
}
