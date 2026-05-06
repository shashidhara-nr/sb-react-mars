import React from 'react'

export default function FormFooterActionsMock({
  onCancel,
  onSaveDraft,
  onReviewSubmit,
  saving,
  submitting,
  reviewMode,
  labels,
}: any) {
  return (
    <div data-testid="footer-actions">
      <div data-testid="footer-flags">{JSON.stringify({ saving, submitting, reviewMode })}</div>
      <button data-testid="footer-cancel" onClick={onCancel}>
        {labels?.cancel ?? 'Cancel'}
      </button>
      <button data-testid="footer-save-draft" onClick={onSaveDraft}>
        {labels?.save ?? 'Save Draft'}
      </button>
      <button data-testid="footer-review-submit" onClick={onReviewSubmit}>
        {labels?.submit ?? 'Review/Submit'}
      </button>
    </div>
  )
}
