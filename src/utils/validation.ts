/**
 * Validation utilities for form fields
 * Reusable validation rules and patterns
 */

/**
 * Phone number validation pattern
 * Supports various formats:
 * - International: +256 700 000000, +256700000000
 * - Local: 0700000000, 0700 000 000, 0700-000-000
 * - With spaces, dashes, or no separators
 */
export const PHONE_NUMBER_PATTERN = /^(\+?256|0)?[7][0-9]{8}$/;

/**
 * Alternative phone number pattern (more flexible)
 * Accepts any phone number with 9-15 digits
 */
export const PHONE_NUMBER_PATTERN_FLEXIBLE = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;

/**
 * Uganda phone number validation
 * Validates Ugandan phone numbers in various formats
 */
export const phoneNumberValidation = {
  pattern: {
    value: PHONE_NUMBER_PATTERN,
    message: "Please enter a valid phone number (e.g., 0700000000 or +256700000000)",
  },
  minLength: {
    value: 10,
    message: "Phone number must be at least 10 digits",
  },
  maxLength: {
    value: 13,
    message: "Phone number must not exceed 15 digits",
  },
};

/**
 * Flexible phone number validation (international)
 * For forms that accept international phone numbers
 */
export const phoneNumberValidationFlexible = {
  pattern: {
    value: PHONE_NUMBER_PATTERN_FLEXIBLE,
    message: "Please enter a valid phone number",
  },
  minLength: {
    value: 9,
    message: "Phone number must be at least 9 digits",
  },
  maxLength: {
    value: 13,
    message: "Phone number must not exceed 13 digits",
  },
};

/**
 * Format phone number for display
 * Converts phone number to a consistent format
 * @param phoneNumber - Raw phone number string
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");
  
  // If starts with +256, format as +256 700 000 000
  if (cleaned.startsWith("+256")) {
    const number = cleaned.substring(4);
    if (number.length === 9) {
      return `+256 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  }
  
  // If starts with 0, format as 0700 000 000
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return `${cleaned.substring(0, 4)} ${cleaned.substring(4, 7)} ${cleaned.substring(7)}`;
  }
  
  return phoneNumber;
};

/**
 * Normalize phone number to standard format
 * Converts various formats to +256XXXXXXXXX
 * @param phoneNumber - Raw phone number string
 * @returns Normalized phone number
 */
export const normalizePhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return "";
  
  // Remove all non-digit characters except +
  const cleaned = phoneNumber.replace(/[^\d+]/g, "");
  
  // If already starts with +256, return as is
  if (cleaned.startsWith("+256")) {
    return cleaned;
  }
  
  // If starts with 256, add +
  if (cleaned.startsWith("256")) {
    return `+${cleaned}`;
  }
  
  // If starts with 0, replace with +256
  if (cleaned.startsWith("0")) {
    return `+256${cleaned.substring(1)}`;
  }
  
  // If starts with 7, add +256
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return `+256${cleaned}`;
  }
  
  return phoneNumber;
};

/**
 * Email validation pattern
 */
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Email validation rule
 */
export const emailValidation = {
  pattern: {
    value: EMAIL_PATTERN,
    message: "Please enter a valid email address",
  },
};

/**
 * National ID validation pattern (Uganda)
 * Format: CM12345678901234 (2 letters followed by 14 digits)
 */
export const NATIONAL_ID_PATTERN = /^[A-Z]{2}[0-9]{14}$/;

/**
 * National ID validation rule
 */
export const nationalIdValidation = {
  pattern: {
    value: NATIONAL_ID_PATTERN,
    message: "Please enter a valid National ID (e.g., CM12345678901234)",
  },
  minLength: {
    value: 16,
    message: "National ID must be 16 characters",
  },
  maxLength: {
    value: 16,
    message: "National ID must be 16 characters",
  },
};

/**
 * Passport number validation pattern
 * Alphanumeric, 6-9 characters
 */
export const PASSPORT_PATTERN = /^[A-Z0-9]{6,9}$/;

/**
 * Passport validation rule
 */
export const passportValidation = {
  pattern: {
    value: PASSPORT_PATTERN,
    message: "Please enter a valid passport number (6-9 alphanumeric characters)",
  },
  minLength: {
    value: 6,
    message: "Passport number must be at least 6 characters",
  },
  maxLength: {
    value: 9,
    message: "Passport number must not exceed 9 characters",
  },
};

/**
 * URL validation pattern
 */
export const URL_PATTERN = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;

/**
 * URL validation rule
 */
export const urlValidation = {
  pattern: {
    value: URL_PATTERN,
    message: "Please enter a valid URL",
  },
};

/**
 * Numeric validation rule
 */
export const numericValidation = {
  pattern: {
    value: /^[0-9]+$/,
    message: "Please enter only numbers",
  },
};

/**
 * Decimal validation rule
 */
export const decimalValidation = {
  pattern: {
    value: /^[0-9]+(\.[0-9]+)?$/,
    message: "Please enter a valid number",
  },
};

/**
 * Alphabetic validation rule (letters only)
 */
export const alphabeticValidation = {
  pattern: {
    value: /^[a-zA-Z\s]+$/,
    message: "Please enter only letters",
  },
};

/**
 * Name validation rule (letters, apostrophes, hyphens)
 * Allows proper names like O'Brien, Mary-Jane, etc.
 */
export const nameValidation = {
  pattern: {
    value: /^[a-zA-Z\s'-]+$/,
    message: "Please enter only letters, spaces, apostrophes, and hyphens",
  },
};

/**
 * Alphanumeric validation rule
 */
export const alphanumericValidation = {
  pattern: {
    value: /^[a-zA-Z0-9\s]+$/,
    message: "Please enter only letters and numbers",
  },
};

/**
 * Date validation - must be in the past
 */
export const pastDateValidation = {
  validate: (value: string) => {
    if (!value) return true;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today || "Date must be in the past";
  },
};

/**
 * Date validation - must be in the past or today
 */
export const pastOrTodayDateValidation = {
  validate: (value: string) => {
    if (!value) return true;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate <= today || "Date cannot be in the future";
  },
};

/**
 * Date validation - must be in the future
 */
export const futureDateValidation = {
  validate: (value: string) => {
    if (!value) return true;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today || "Date must be in the future";
  },
};

/**
 * Date validation - must be in the future or today
 */
export const futureOrTodayDateValidation = {
  validate: (value: string) => {
    if (!value) return true;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today || "Date cannot be in the past";
  },
};

/**
 * Date range validation - start date must be before end date
 * @param startDate - The start date to compare against
 * @param fieldName - Optional custom field name for error message
 */
export const dateRangeValidation = (startDate: string, fieldName?: string) => ({
  validate: (endDate: string) => {
    if (!endDate || !startDate) return true;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start || `${fieldName || "End date"} must be after start date`;
  },
});

/**
 * Date validation - must be within a specific range
 * @param minDate - Minimum allowed date (ISO string or Date)
 * @param maxDate - Maximum allowed date (ISO string or Date)
 * @param fieldName - Optional custom field name for error message
 */
export const dateWithinRangeValidation = (
  minDate: string | Date,
  maxDate: string | Date,
  fieldName?: string
) => ({
  validate: (value: string) => {
    if (!value) return true;
    const selectedDate = new Date(value);
    const min = new Date(minDate);
    const max = new Date(maxDate);
    
    if (selectedDate < min) {
      return `${fieldName || "Date"} must be after ${min.toLocaleDateString()}`;
    }
    if (selectedDate > max) {
      return `${fieldName || "Date"} must be before ${max.toLocaleDateString()}`;
    }
    return true;
  },
});

/**
 * Date validation - must be at least X days/months/years from today
 * @param amount - Number of time units
 * @param unit - Time unit ('days', 'months', 'years')
 * @param direction - 'past' or 'future'
 */
export const dateOffsetValidation = (
  amount: number,
  unit: 'days' | 'months' | 'years',
  direction: 'past' | 'future'
) => ({
  validate: (value: string) => {
    if (!value) return true;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const compareDate = new Date(today);
    if (unit === 'days') {
      compareDate.setDate(compareDate.getDate() + (direction === 'future' ? amount : -amount));
    } else if (unit === 'months') {
      compareDate.setMonth(compareDate.getMonth() + (direction === 'future' ? amount : -amount));
    } else if (unit === 'years') {
      compareDate.setFullYear(compareDate.getFullYear() + (direction === 'future' ? amount : -amount));
    }
    
    if (direction === 'future') {
      return selectedDate >= compareDate || `Date must be at least ${amount} ${unit} in the future`;
    } else {
      return selectedDate <= compareDate || `Date must be at least ${amount} ${unit} in the past`;
    }
  },
});

/**
 * Age validation - must be at least minimum age
 */
export const minimumAgeValidation = (minAge: number) => ({
  validate: (value: string) => {
    if (!value) return true;
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= minAge || `Must be at least ${minAge} years old`;
  },
});

/**
 * Required field validation
 */
export const requiredValidation = (fieldName: string) => ({
  required: `${fieldName} is required`,
});

/**
 * Min length validation
 */
export const minLengthValidation = (length: number, fieldName?: string) => ({
  minLength: {
    value: length,
    message: `${fieldName || "Field"} must be at least ${length} characters`,
  },
});

/**
 * Max length validation
 */
export const maxLengthValidation = (length: number, fieldName?: string) => ({
  maxLength: {
    value: length,
    message: `${fieldName || "Field"} must not exceed ${length} characters`,
  },
});
