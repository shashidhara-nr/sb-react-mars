export const sanitizeTestIdPart = (value: string | number): string =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const buildTestId = (
  prefix: string,
  ...parts: Array<string | number | undefined | null>
): string => {
  const normalizedParts = parts
    .filter((part): part is string | number => part !== undefined && part !== null)
    .map((part) => sanitizeTestIdPart(part))
    .filter(Boolean);

  return [sanitizeTestIdPart(prefix), ...normalizedParts].join('-');
};
