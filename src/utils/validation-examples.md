# Validation Utilities Usage Examples

## Phone Number Validation

### Basic Usage with react-hook-form

```tsx
import { phoneNumberValidation } from '../utils/validation';

// In your component
<Input
  id="phone"
  {...register("phone", {
    ...phoneNumberValidation,
    required: "Phone number is required",
  })}
  placeholder="0700000000"
/>
```

### Flexible International Phone Number

```tsx
import { phoneNumberValidationFlexible } from '../utils/validation';

<Input
  id="phone"
  {...register("phone", phoneNumberValidationFlexible)}
  placeholder="+256 700 000 000"
/>
```

### Optional Phone Number

```tsx
import { phoneNumberValidation } from '../utils/validation';

<Input
  id="phone"
  {...register("phone", {
    ...phoneNumberValidation,
    // No required field - makes it optional
  })}
  placeholder="0700000000"
/>
```

## Email Validation

```tsx
import { emailValidation } from '../utils/validation';

<Input
  id="email"
  type="email"
  {...register("email", {
    ...emailValidation,
    required: "Email is required",
  })}
  placeholder="example@email.com"
/>
```

## National ID Validation

```tsx
import { nationalIdValidation } from '../utils/validation';

<Input
  id="national_id"
  {...register("national_id", {
    ...nationalIdValidation,
    required: "National ID is required",
  })}
  placeholder="CM12345678901234"
/>
```

## Date Validations

### Past Date (e.g., Date of Birth)

```tsx
import { pastDateValidation, minimumAgeValidation } from '../utils/validation';

<Input
  id="date_of_birth"
  type="date"
  {...register("date_of_birth", {
    required: "Date of birth is required",
    ...pastDateValidation,
    ...minimumAgeValidation(18), // Must be at least 18 years old
  })}
/>
```

### Future Date (e.g., Court Date)

```tsx
import { futureDateValidation } from '../utils/validation';

<Input
  id="court_date"
  type="date"
  {...register("court_date", {
    required: "Court date is required",
    ...futureDateValidation,
  })}
/>
```

## Numeric Validations

### Integer Only

```tsx
import { numericValidation } from '../utils/validation';

<Input
  id="age"
  {...register("age", {
    ...numericValidation,
    required: "Age is required",
  })}
  placeholder="25"
/>
```

### Decimal Numbers

```tsx
import { decimalValidation } from '../utils/validation';

<Input
  id="height"
  {...register("height", {
    ...decimalValidation,
    required: "Height is required",
  })}
  placeholder="175.5"
/>
```

## Text Validations

### Letters Only

```tsx
import { alphabeticValidation } from '../utils/validation';

<Input
  id="first_name"
  {...register("first_name", {
    ...alphabeticValidation,
    required: "First name is required",
  })}
  placeholder="John"
/>
```

### Alphanumeric

```tsx
import { alphanumericValidation } from '../utils/validation';

<Input
  id="prisoner_number"
  {...register("prisoner_number", {
    ...alphanumericValidation,
    required: "Prisoner number is required",
  })}
  placeholder="ABC123"
/>
```

## Length Validations

```tsx
import { minLengthValidation, maxLengthValidation } from '../utils/validation';

<Input
  id="description"
  {...register("description", {
    ...minLengthValidation(10, "Description"),
    ...maxLengthValidation(500, "Description"),
  })}
  placeholder="Enter description"
/>
```

## Combining Multiple Validations

```tsx
import { 
  phoneNumberValidation, 
  requiredValidation 
} from '../utils/validation';

<Input
  id="emergency_contact"
  {...register("emergency_contact", {
    ...requiredValidation("Emergency contact"),
    ...phoneNumberValidation,
  })}
  placeholder="0700000000"
/>
```

## Using Format and Normalize Functions

```tsx
import { formatPhoneNumber, normalizePhoneNumber } from '../utils/validation';

// Format for display
const displayPhone = formatPhoneNumber("0700123456"); // "0700 123 456"

// Normalize for API submission
const apiPhone = normalizePhoneNumber("0700123456"); // "+256700123456"

// In form submission
const handleSubmit = (data) => {
  const submissionData = {
    ...data,
    phone: normalizePhoneNumber(data.phone),
  };
  // Submit to API
};
```

## Complete Example in a Form Component

```tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  phoneNumberValidation,
  emailValidation,
  nationalIdValidation,
  pastDateValidation,
  minimumAgeValidation,
  requiredValidation,
  normalizePhoneNumber
} from '../utils/validation';

interface FormData {
  first_name: string;
  email: string;
  phone: string;
  national_id: string;
  date_of_birth: string;
}

const ExampleForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    const submissionData = {
      ...data,
      phone: normalizePhoneNumber(data.phone),
    };
    console.log(submissionData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor="first_name">First Name *</Label>
        <Input
          id="first_name"
          {...register("first_name", {
            ...requiredValidation("First name"),
          })}
        />
        {errors.first_name && (
          <p className="text-red-500 text-sm">{errors.first_name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register("email", {
            ...emailValidation,
            required: "Email is required",
          })}
        />
        {errors.email && (
          <p className="text-red-500 text-sm">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          {...register("phone", {
            ...phoneNumberValidation,
            required: "Phone number is required",
          })}
          placeholder="0700000000"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="national_id">National ID</Label>
        <Input
          id="national_id"
          {...register("national_id", nationalIdValidation)}
          placeholder="CM12345678901234"
        />
        {errors.national_id && (
          <p className="text-red-500 text-sm">{errors.national_id.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="date_of_birth">Date of Birth *</Label>
        <Input
          id="date_of_birth"
          type="date"
          {...register("date_of_birth", {
            required: "Date of birth is required",
            ...pastDateValidation,
            ...minimumAgeValidation(18),
          })}
        />
        {errors.date_of_birth && (
          <p className="text-red-500 text-sm">{errors.date_of_birth.message}</p>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default ExampleForm;
```
