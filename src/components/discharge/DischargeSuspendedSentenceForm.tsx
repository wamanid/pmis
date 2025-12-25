import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const DischargeSuspendedSentenceForm: React.FC<{ initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; }> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    prisoner_name: '',
    prisoner_number: '',
    court_name: '',
    discharge_datetime: '',
    duration_of_suspension: 0,
    conditions_for_suspension: '',
    conviction_date: '',
    remarks: '',
    prisoner: '',
    discharge_type: '',
    discharge_reason: '',
    court_details: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Prisoner *</Label>
          <Select value={formData.prisoner} onValueChange={(v) => setFormData({...formData, prisoner: v, prisoner_name: 'John Doe', prisoner_number: 'P-2024-001'})}>
            <SelectTrigger><SelectValue placeholder="Select prisoner" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prisoner-001">John Doe (P-2024-001)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Court *</Label>
          <Select value={formData.court_details} onValueChange={(v) => setFormData({...formData, court_details: v, court_name: 'High Court Kampala'})}>
            <SelectTrigger><SelectValue placeholder="Select court" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="court-001">High Court Kampala</SelectItem>
              <SelectItem value="court-002">Chief Magistrate Court</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Duration of Suspension (months) *</Label>
          <Input type="number" value={formData.duration_of_suspension} onChange={(e) => setFormData({...formData, duration_of_suspension: parseInt(e.target.value)})} required />
        </div>
        <div>
          <Label>Conviction Date *</Label>
          <Input type="date" value={formData.conviction_date} onChange={(e) => setFormData({...formData, conviction_date: e.target.value})} required />
        </div>
        <div>
          <Label>Discharge Date & Time *</Label>
          <Input type="datetime-local" value={formData.discharge_datetime.slice(0, 16)} onChange={(e) => setFormData({...formData, discharge_datetime: e.target.value + ':00Z'})} required />
        </div>
        <div className="col-span-2">
          <Label>Conditions for Suspension</Label>
          <Textarea value={formData.conditions_for_suspension} onChange={(e) => setFormData({...formData, conditions_for_suspension: e.target.value})} rows={3} />
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
