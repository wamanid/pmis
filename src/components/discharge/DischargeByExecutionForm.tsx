import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const DischargeByExecutionForm: React.FC<{ initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; }> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    prisoner_name: '',
    prisoner_number: '',
    discharge_type_name: '',
    approving_authority_name: '',
    discharge_datetime: '',
    datetime_of_execution: '',
    remarks: '',
    prisoner: '',
    discharge_type: '',
    discharge_reason: '',
    approving_authority: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Prisoner *</Label>
          <Select value={formData.prisoner} onValueChange={(v) => setFormData({...formData, prisoner: v, prisoner_name: 'Prisoner Name', prisoner_number: 'P-2024-001'})}>
            <SelectTrigger><SelectValue placeholder="Select prisoner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prisoner-001">Prisoner Name (P-2024-001)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Execution Date & Time *</Label>
          <Input type="datetime-local" value={formData.datetime_of_execution.slice(0, 16)} onChange={(e) => setFormData({...formData, datetime_of_execution: e.target.value + ':00Z'})} required />
        </div>
        <div>
          <Label>Approving Authority *</Label>
          <Select value={formData.approving_authority} onValueChange={(v) => setFormData({...formData, approving_authority: v, approving_authority_name: 'Officer Name'})}>
            <SelectTrigger><SelectValue placeholder="Select authority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="auth-001">Officer Name</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Discharge Date & Time *</Label>
          <Input type="datetime-local" value={formData.discharge_datetime.slice(0, 16)} onChange={(e) => setFormData({...formData, discharge_datetime: e.target.value + ':00Z'})} required />
        </div>
        <div className="col-span-2">
          <Label>Remarks</Label>
          <Textarea value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})} rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};
