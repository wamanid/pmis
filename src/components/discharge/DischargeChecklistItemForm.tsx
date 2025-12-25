import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface DischargeChecklistItemFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DischargeChecklistItemForm: React.FC<DischargeChecklistItemFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    discharge_details: '',
    checklist_item_name: '',
    prisoner_name: '',
    completed: false,
    completed_date: '',
    notes: '',
    discharge: '',
    checklist_item: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="discharge">Discharge *</Label>
          <Select
            value={formData.discharge}
            onValueChange={(value) => {
              handleChange('discharge', value);
              handleChange('discharge_details', `Discharge #${value.slice(-3)} - Prisoner`);
              handleChange('prisoner_name', 'John Doe');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select discharge" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="discharge-001">Discharge #001 - John Doe</SelectItem>
              <SelectItem value="discharge-002">Discharge #002 - Jane Smith</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="checklist_item">Checklist Item *</Label>
          <Select
            value={formData.checklist_item}
            onValueChange={(value) => {
              handleChange('checklist_item', value);
              const items: Record<string, string> = {
                'checklist-001': 'Property Return',
                'checklist-002': 'Final Medical Check',
                'checklist-003': 'Documentation Review',
                'checklist-004': 'Final Clearance',
              };
              handleChange('checklist_item_name', items[value] || '');
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select checklist item" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checklist-001">Property Return</SelectItem>
              <SelectItem value="checklist-002">Final Medical Check</SelectItem>
              <SelectItem value="checklist-003">Documentation Review</SelectItem>
              <SelectItem value="checklist-004">Final Clearance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="completed"
            checked={formData.completed}
            onCheckedChange={(checked) => handleChange('completed', checked)}
          />
          <Label htmlFor="completed" className="cursor-pointer">
            Mark as Completed
          </Label>
        </div>

        {formData.completed && (
          <div>
            <Label htmlFor="completed_date">Completed Date *</Label>
            <Input
              id="completed_date"
              type="datetime-local"
              value={formData.completed_date.slice(0, 16)}
              onChange={(e) => handleChange('completed_date', e.target.value + ':00Z')}
              required
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={4}
          placeholder="Enter any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? 'Update' : 'Create'} Checklist Item
        </Button>
      </div>
    </form>
  );
};
