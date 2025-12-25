/**
 * ReligionSelect Component Usage Example
 * 
 * This example demonstrates how to use the ReligionSelect component
 * in a form with react-hook-form
 */

import { useForm, Controller } from 'react-hook-form';
import { ReligionSelect } from './ReligionSelect';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

interface FormData {
  religion: string;
  // ... other form fields
}

export function ReligionSelectExample() {
  const { control, handleSubmit, watch } = useForm<FormData>();

  const selectedReligion = watch('religion');

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    // The religion field will contain the religion ID
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="religion">Religion</Label>
        <Controller
          name="religion"
          control={control}
          render={({ field }) => (
            <ReligionSelect
              value={field.value}
              onValueChange={field.onChange}
              placeholder="Select religion"
            />
          )}
        />
      </div>

      {/* Alternative: Using with setValue and watch */}
      <div>
        <Label htmlFor="religion_alt">Religion (Alternative)</Label>
        <ReligionSelect
          value={selectedReligion}
          onValueChange={(value) => {
            // Handle value change
            console.log('Selected religion ID:', value);
          }}
          placeholder="Select religion"
        />
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}
