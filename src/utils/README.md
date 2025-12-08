# Validation Utilities

A comprehensive collection of reusable validation rules for form fields across the PMIS application.

## 📁 Files

- **`validation.ts`** - Main validation utilities and rules
- **`validation-examples.md`** - Usage examples and patterns

## 🎯 Features

### Phone Number Validation
- ✅ Uganda phone number format validation
- ✅ International phone number support
- ✅ Multiple format support (with/without spaces, dashes)
- ✅ Phone number formatting and normalization functions

### Email Validation
- ✅ Standard email format validation
- ✅ RFC-compliant pattern matching

### ID Validation
- ✅ National ID validation (Uganda format)
- ✅ Passport number validation

### Date Validation
- ✅ Past date validation (for DOB, admission dates)
- ✅ Future date validation (for court dates, release dates)
- ✅ Minimum age validation

### Text Validation
- ✅ Alphabetic (letters only)
- ✅ Alphanumeric
- ✅ Numeric (integers)
- ✅ Decimal numbers

### Length Validation
- ✅ Minimum length
- ✅ Maximum length
- ✅ Required field helpers

## 🚀 Quick Start

### 1. Import the validation rules

```tsx
import { phoneNumberValidation } from '@/utils/validation';
```

### 2. Use with react-hook-form

```tsx
<Input
  {...register("phone", {
    ...phoneNumberValidation,
    required: "Phone number is required",
  })}
/>
```

### 3. Display error messages

```tsx
{errors.phone && (
  <p className="text-red-500 text-sm">{errors.phone.message}</p>
)}
```

## 📋 Available Validation Rules

| Validation | Import | Use Case |
|------------|--------|----------|
| `phoneNumberValidation` | Phone numbers | Uganda format (0700000000, +256700000000) |
| `phoneNumberValidationFlexible` | Phone numbers | International format |
| `emailValidation` | Email addresses | Standard email format |
| `nationalIdValidation` | National IDs | Uganda National ID (CM12345678901234) |
| `passportValidation` | Passport numbers | Alphanumeric 6-9 chars |
| `urlValidation` | URLs | Web addresses |
| `numericValidation` | Numbers | Integers only |
| `decimalValidation` | Numbers | Decimal numbers |
| `alphabeticValidation` | Text | Letters only |
| `alphanumericValidation` | Text | Letters and numbers |
| `pastDateValidation` | Dates | Must be in the past |
| `futureDateValidation` | Dates | Must be in the future |
| `minimumAgeValidation(age)` | Dates | Minimum age requirement |

## 🛠️ Utility Functions

### Format Phone Number
```tsx
import { formatPhoneNumber } from '@/utils/validation';

const formatted = formatPhoneNumber("0700123456");
// Output: "0700 123 456"
```

### Normalize Phone Number
```tsx
import { normalizePhoneNumber } from '@/utils/validation';

const normalized = normalizePhoneNumber("0700123456");
// Output: "+256700123456"
```

## 💡 Best Practices

1. **Combine validations** - Use spread operator to combine multiple rules
2. **Normalize before submission** - Use `normalizePhoneNumber()` before API calls
3. **Consistent error messages** - Use the built-in error messages
4. **Optional fields** - Omit `required` for optional fields
5. **Custom messages** - Override default messages when needed

## 🔧 Customization

### Override Error Messages

```tsx
<Input
  {...register("phone", {
    pattern: {
      value: PHONE_NUMBER_PATTERN,
      message: "Custom error message here",
    },
  })}
/>
```

### Create Custom Validation

```tsx
<Input
  {...register("field", {
    validate: (value) => {
      // Custom validation logic
      return value.length > 5 || "Must be longer than 5 characters";
    },
  })}
/>
```

## 📚 Examples

See `validation-examples.md` for comprehensive usage examples including:
- Basic phone number validation
- Email validation
- Date validations
- Combining multiple validations
- Complete form examples

## 🤝 Contributing

When adding new validation rules:
1. Add the pattern/rule to `validation.ts`
2. Export the validation object
3. Add usage examples to `validation-examples.md`
4. Update this README with the new rule

## 📝 Notes

- All validation rules are compatible with `react-hook-form`
- Phone number validation is optimized for Uganda formats
- Use flexible validation for international scenarios
- All patterns are tested and production-ready
