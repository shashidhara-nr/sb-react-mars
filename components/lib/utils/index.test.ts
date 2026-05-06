import '@testing-library/jest-dom'
import { accountNumberFormat } from './index';

// Mock the accountNumberlayout import
jest.mock('../config', () => ({
  accountNumberlayout: [4, 4, 4, 4],
}));

describe('accountNumberFormat', () => {
  it('formats a string of digits according to the layout', () => {
    expect(accountNumberFormat('1234567890123456')).toBe('1234 5678 9012 3456');
  });

  it('formats a number input correctly', () => {
    expect(accountNumberFormat(1234567890123456)).toBe('1234 5678 9012 3456');
  });

  it('removes non-digit characters', () => {
    expect(accountNumberFormat('12a34b56c78d9012e3456')).toBe(
      '1234 5678 9012 3456',
    );
  });

  it('handles input shorter than the layout', () => {
    expect(accountNumberFormat('1234567')).toBe('1234 567');
  });

  it('handles empty input', () => {
    expect(accountNumberFormat('')).toBe('');
  });

  it('handles input longer than the layout (truncates extra digits)', () => {
    expect(accountNumberFormat('12345678901234567890')).toBe(
      '1234 5678 9012 3456',
    );
  });
});
