export interface AttendanceInput {
  fullName: string;
  phoneNumber: string;
  regNumber: string;
}

export type AttendanceErrors = Partial<Record<keyof AttendanceInput, string>>;

export const REG_NUMBER_PATTERN = /^\d{12}[A-Z]{2}$/;

export function normalizeAttendanceInput(input: AttendanceInput): AttendanceInput {
  return {
    fullName: input.fullName.trim().replace(/\s+/g, ' '),
    phoneNumber: input.phoneNumber.trim(),
    regNumber: input.regNumber.replace(/\s+/g, '').toUpperCase(),
  };
}

export function validateAttendanceInput(input: AttendanceInput): AttendanceErrors {
  const normalized = normalizeAttendanceInput(input);
  const errors: AttendanceErrors = {};

  if (normalized.fullName.length < 2) {
    errors.fullName = 'Please enter your full name.';
  } else if (normalized.fullName.length > 100) {
    errors.fullName = 'Name must be 100 characters or fewer.';
  }

  const digitCount = normalized.phoneNumber.replace(/\D/g, '').length;
  if (!/^[0-9+()\- ]{7,20}$/.test(normalized.phoneNumber) || digitCount < 7 || digitCount > 15) {
    errors.phoneNumber = 'Enter a valid phone number.';
  }

  if (!REG_NUMBER_PATTERN.test(normalized.regNumber)) {
    errors.regNumber = 'Use 12 digits followed by 2 letters, for example 202660623441GA.';
  }

  return errors;
}
