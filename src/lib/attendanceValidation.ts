export interface AttendanceInput {
  fullName: string;
  phoneNumber: string;
  regNumber: string;
  dateOfBirth: string;
}

export type AttendanceErrors = Partial<Record<keyof AttendanceInput, string>>;

export const REG_NUMBER_PATTERN = /^\d{12}[A-Z]{2}$/;

export function normalizeAttendanceInput(input: AttendanceInput): AttendanceInput {
  return {
    fullName: input.fullName.trim().replace(/\s+/g, ' '),
    phoneNumber: input.phoneNumber.trim(),
    regNumber: input.regNumber.replace(/\s+/g, '').toUpperCase(),
    dateOfBirth: input.dateOfBirth.trim(),
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
    errors.regNumber = 'Use 12 digits followed by 2 letters, for example 202612345678AB.';
  }

  if (!normalized.dateOfBirth) {
    errors.dateOfBirth = 'Please enter your date of birth.';
  } else {
    const dob = new Date(normalized.dateOfBirth);
    const today = new Date();
    if (isNaN(dob.getTime())) {
      errors.dateOfBirth = 'Please enter a valid date.';
    } else if (dob > today) {
      errors.dateOfBirth = 'Date of birth cannot be in the future.';
    }
  }

  return errors;
}
