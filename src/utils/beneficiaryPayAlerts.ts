import type { AlertDetail, AlertDetailsListTO } from 'types/beneficiary';

export const MAX_PAY_ALERTS = 5;

export type PayAlertType = 'SMS' | 'Email' | '';

export interface PayAlertRow {
  alertId: number;
  alertType: PayAlertType;
  titleAndName: string;
  emailOrNumber: string;
  notify: boolean;
  entityKey?: number;
  whenModified?: string;
  alertStatus?: string;
  dateAndTimeSent?: string;
  instructionKey?: number;
  transactionId?: number;
}

export interface PayAlertRowErrors {
  alertType?: string;
  titleAndName?: string;
  emailOrNumber?: string;
}

export type PayAlertErrors = Record<number, PayAlertRowErrors>;

export interface ValidatePayAlertsOptions {
  beneficiaryPhone?: string;
  beneficiaryEmail?: string;
}

export interface ValidatePayAlertsResult {
  isValid: boolean;
  errors: PayAlertErrors;
  messages: string[];
}

const EMAIL_PATTERN =
  /^(?:[a-zA-Z0-9_'^&\-])+(?:\.(?:[a-zA-Z0-9_'^&\-])+)*@(?:(?:[a-zA-Z0-9\-]+\.)+[a-zA-Z]{2,})$/;

const emptyAlertRow = (alertId: number): PayAlertRow => ({
  alertId,
  alertType: '',
  titleAndName: '',
  emailOrNumber: '',
  notify: false,
});

const normalizeAlertType = (value: unknown): PayAlertType => {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text) return '';
  if (text === 'sms' || text === 'number' || text === 'mobile') return 'SMS';
  if (text === 'email') return 'Email';
  return '';
};

const normalizePhoneForComparison = (value: string): string => {
  if (!value) return '';
  const compact = value.replace(/\s+/g, '');
  return compact.replace(/^\+/, '').replace(/\D/g, '');
};

const hasSpecialPhoneCharacters = (value: string): boolean => {
  if (!value) return false;
  return !/^\+?\d[\d\s]*$/.test(value.trim());
};

const isMeaningfulAlertDetail = (row: AlertDetail | null | undefined): boolean => {
  if (!row) return false;
  const hasAlertType = String(row.alertType ?? '').trim().length > 0;
  const hasTitleAndName = String(row.titleAndName ?? '').trim().length > 0;
  const hasAddress = String(row.emailOrNumber ?? '').trim().length > 0;
  return hasAlertType || hasTitleAndName || hasAddress;
};

export const reindexPayAlertRows = (rows: PayAlertRow[]): PayAlertRow[] =>
  rows.slice(0, MAX_PAY_ALERTS).map((row, index) => ({
    ...row,
    alertId: index + 1,
  }));

const mapAlertDetailToRow = (row: AlertDetail, index: number): PayAlertRow => ({
  alertId: index + 1,
  alertType: normalizeAlertType(row.alertType),
  titleAndName: String(row.titleAndName ?? ''),
  emailOrNumber: String(row.emailOrNumber ?? ''),
  notify: String(row.notify ?? '')
    .toLowerCase()
    .trim()
    .match(/^(y|yes|true|1)$/)
    ? true
    : false,
  entityKey: row.entityKey,
  whenModified: row.whenModified,
  alertStatus: row.alertStatus,
  dateAndTimeSent: row.dateAndTimeSent,
  instructionKey: row.instructionKey,
  transactionId: row.transactionId,
});

export const normalizePayAlertRows = (
  alertDetailsList?: AlertDetail[] | null,
  countHint?: number | null,
): PayAlertRow[] => {
  const list = Array.isArray(alertDetailsList) ? alertDetailsList : [];
  const safeCount = Math.max(
    0,
    Math.min(MAX_PAY_ALERTS, Number.isFinite(Number(countHint)) ? Number(countHint) : 0),
  );

  // If we know the intended count from payload metadata, keep rows even when still blank.
  if (safeCount > 0) {
    const baseRows = list.slice(0, safeCount).map((row, index) => mapAlertDetailToRow(row, index));
    while (baseRows.length < safeCount) {
      baseRows.push(emptyAlertRow(baseRows.length + 1));
    }
    return reindexPayAlertRows(baseRows);
  }

  return reindexPayAlertRows(
    list.filter((row) => isMeaningfulAlertDetail(row)).map((row, index) => mapAlertDetailToRow(row, index)),
  );
};

export const resizePayAlertRows = (rows: PayAlertRow[], count: number): PayAlertRow[] => {
  const safeCount = Math.max(0, Math.min(MAX_PAY_ALERTS, Number.isFinite(count) ? count : 0));
  const normalized = reindexPayAlertRows(rows);
  if (safeCount <= normalized.length) {
    return reindexPayAlertRows(normalized.slice(0, safeCount));
  }
  const additions = Array.from({ length: safeCount - normalized.length }, (_, index) =>
    emptyAlertRow(normalized.length + index + 1),
  );
  return reindexPayAlertRows([...normalized, ...additions]);
};

export const removePayAlertRow = (rows: PayAlertRow[], indexToDelete: number): PayAlertRow[] =>
  reindexPayAlertRows(rows.filter((_, index) => index !== indexToDelete));

export const toAlertDetailsPayload = (rows: PayAlertRow[]): AlertDetail[] =>
  reindexPayAlertRows(rows).map((row) => ({
    alertId: String(row.alertId),
    alertType: row.alertType,
    notify: row.notify ? 'Y' : 'N',
    titleAndName: row.titleAndName.trim(),
    emailOrNumber: row.emailOrNumber.trim(),
    entityKey: row.entityKey ?? 0,
    whenModified: row.whenModified || new Date().toISOString(),
    alertStatus: row.alertStatus || '',
    dateAndTimeSent: row.dateAndTimeSent || '',
    instructionKey: row.instructionKey ?? 0,
    transactionId: row.transactionId ?? 0,
  }));

export const buildAlertDetailsListTO = (
  rows: PayAlertRow[],
  existing?: AlertDetailsListTO | null,
): AlertDetailsListTO => {
  const alertDetailsList = toAlertDetailsPayload(rows);
  const count = alertDetailsList.length;
  return {
    lastPage: true,
    pageCount: existing?.pageCount ?? 0,
    postition: existing?.postition ?? 0,
    pageSize: count,
    rowCount: count,
    alertDetailsList,
  };
};

const ensureErrorRow = (errors: PayAlertErrors, rowIndex: number): PayAlertRowErrors => {
  if (!errors[rowIndex]) {
    errors[rowIndex] = {};
  }
  return errors[rowIndex];
};

const pushMessage = (messages: string[], message: string) => {
  if (!messages.includes(message)) {
    messages.push(message);
  }
};

export const validatePayAlertRows = (
  rows: PayAlertRow[],
  options?: ValidatePayAlertsOptions,
): ValidatePayAlertsResult => {
  const errors: PayAlertErrors = {};
  const messages: string[] = [];

  if (!rows.length) {
    return { isValid: true, errors, messages };
  }

  const normalizedRows = reindexPayAlertRows(rows);
  const smsCandidates: Array<{ rowIndex: number; normalizedValue: string }> = [];
  const emailCandidates: Array<{ rowIndex: number; normalizedValue: string }> = [];

  normalizedRows.forEach((row, rowIndex) => {
    const alertId = rowIndex + 1;
    const title = row.titleAndName.trim();
    const destination = row.emailOrNumber.trim();
    const hasValidAlertType = row.alertType === 'SMS' || row.alertType === 'Email';

    if (!hasValidAlertType) {
      const rowErrors = ensureErrorRow(errors, rowIndex);
      rowErrors.alertType = `Please select an alert type for alert id ${alertId}.`;
      pushMessage(messages, rowErrors.alertType);
    }

    if (!title || title.length > 30) {
      const rowErrors = ensureErrorRow(errors, rowIndex);
      rowErrors.titleAndName = `Please enter in a title and name between 1 and 30 characters for alert id ${alertId}.`;
      pushMessage(messages, rowErrors.titleAndName);
    }

    if (!destination) {
      const rowErrors = ensureErrorRow(errors, rowIndex);
      rowErrors.emailOrNumber = `Please enter in a mobile phone number or email address for alert id ${alertId}.`;
      pushMessage(messages, rowErrors.emailOrNumber);
      return;
    }

    if (row.alertType === 'SMS') {
      const normalized = normalizePhoneForComparison(destination);
      const isLengthValid = /^\d{8,15}$/.test(normalized);
      const hasInvalidCharacters = hasSpecialPhoneCharacters(destination);
      if (!normalized || !isLengthValid || hasInvalidCharacters) {
        const rowErrors = ensureErrorRow(errors, rowIndex);
        rowErrors.emailOrNumber =
          'Please enter a valid PAY_IN mobile number (no special characters allowed) for the selected pay alert.';
        pushMessage(messages, rowErrors.emailOrNumber);
      } else {
        smsCandidates.push({ rowIndex, normalizedValue: normalized });
      }
    }

    if (row.alertType === 'Email') {
      const normalized = destination.toLowerCase();
      if (!EMAIL_PATTERN.test(normalized)) {
        const rowErrors = ensureErrorRow(errors, rowIndex);
        rowErrors.emailOrNumber = 'Please enter a valid email address for the selected pay alert.';
        pushMessage(messages, rowErrors.emailOrNumber);
      } else {
        emailCandidates.push({ rowIndex, normalizedValue: normalized });
      }
    }
  });

  const existingPhone = normalizePhoneForComparison(String(options?.beneficiaryPhone ?? ''));
  const existingEmail = String(options?.beneficiaryEmail ?? '').trim().toLowerCase();

  const smsCount = smsCandidates.reduce<Record<string, number>>((acc, candidate) => {
    acc[candidate.normalizedValue] = (acc[candidate.normalizedValue] || 0) + 1;
    return acc;
  }, {});

  smsCandidates.forEach(({ rowIndex, normalizedValue }) => {
    const isDuplicateInRows = smsCount[normalizedValue] > 1;
    const isDuplicateWithBeneficiary = Boolean(existingPhone) && normalizedValue === existingPhone;
    if (!isDuplicateInRows && !isDuplicateWithBeneficiary) return;
    const rowErrors = ensureErrorRow(errors, rowIndex);
    rowErrors.emailOrNumber = 'Please note that this beneficiary PAY_IN mobile number already exists.';
    pushMessage(messages, rowErrors.emailOrNumber);
  });

  const emailCount = emailCandidates.reduce<Record<string, number>>((acc, candidate) => {
    acc[candidate.normalizedValue] = (acc[candidate.normalizedValue] || 0) + 1;
    return acc;
  }, {});

  emailCandidates.forEach(({ rowIndex, normalizedValue }) => {
    const isDuplicateInRows = emailCount[normalizedValue] > 1;
    const isDuplicateWithBeneficiary = Boolean(existingEmail) && normalizedValue === existingEmail;
    if (!isDuplicateInRows && !isDuplicateWithBeneficiary) return;
    const rowErrors = ensureErrorRow(errors, rowIndex);
    rowErrors.emailOrNumber = 'Please note that this beneficiary email address already exists.';
    pushMessage(messages, rowErrors.emailOrNumber);
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    messages,
  };
};
