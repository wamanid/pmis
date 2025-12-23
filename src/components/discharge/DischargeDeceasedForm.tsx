import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const DischargeDeceasedForm: React.FC<{ initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; }> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    prisoner_name: '',
    prisoner_number: '',
    discharge_type_name: '',
    discharge_datetime: '',
    remarks: '',
    date_of_death: '',
    morgue_details: '',
    next_of_kin_available: false,
    next_of_kin_details: '',
    prisoner: '',
    discharge_type: '',
    discharge_reason: '',
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
          <Label>Prisoner *</Label>
          <Select value={formData.prisoner} onValueChange={(value) => {
            handleChange('prisoner', value);
            handleChange('prisoner_name', 'John Deceased');
            handleChange('prisoner_number', 'P-2024-999');
          }}>
            <SelectTrigger><SelectValue placeholder="Select prisoner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prisoner-999">John Deceased (P-2024-999)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Date of Death *</Label>
          <Input
            type="date"
            value={formData.date_of_death}
            onChange={(e) => handleChange('date_of_death', e.target.value)}
            required
          />
        </div>
        <div className="col-span-2">
          <Label>Morgue Details *</Label>
          <Input
            value={formData.morgue_details}
            onChange={(e) => handleChange('morgue_details', e.target.value)}
            required
          />
        </div>
        <div className="col-span-2 flex items-center space-x-2">
          <Checkbox
            checked={formData.next_of_kin_available}
            onCheckedChange={(checked) => handleChange('next_of_kin_available', checked)}
          />
          <Label>Next of Kin Available</Label>
        </div>
        {formData.next_of_kin_available && (
          <div className="col-span-2">
            <Label>Next of Kin Details</Label>
            <Textarea
              value={formData.next_of_kin_details}
              onChange={(e) => handleChange('next_of_kin_details', e.target.value)}
              rows={3}
            />
          </div>
        )}
        <div>
          <Label>Discharge Date & Time *</Label>
          <Input
            type="datetime-local"
            value={formData.discharge_datetime.slice(0, 16)}
            onChange={(e) => handleChange('discharge_datetime', e.target.value + ':00Z')}
            required
          />
        </div>
        <div className="col-span-2">
          <Label>Remarks</Label>
          <Textarea
            value={formData.remarks}
            onChange={(e) => handleChange('remarks', e.target.value)}
            rows={3}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'} Record</Button>
      </div>
    </form>
  );
};
