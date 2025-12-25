import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const SubsistenceAllowancesForm: React.FC<{ initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; }> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    prisoner_name: '',
    prisoner_number: '',
    allowance_amount: '',
    creditor_details: '',
    disposal_date: '',
    remarks: '',
    prisoner: '',
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
          <Label>Allowance Amount (UGX) *</Label>
          <Input type="number" step="0.01" value={formData.allowance_amount} onChange={(e) => setFormData({...formData, allowance_amount: e.target.value})} required />
        </div>
        <div className="col-span-2">
          <Label>Creditor Details *</Label>
          <Input value={formData.creditor_details} onChange={(e) => setFormData({...formData, creditor_details: e.target.value})} required />
        </div>
        <div>
          <Label>Disposal Date *</Label>
          <Input type="date" value={formData.disposal_date} onChange={(e) => setFormData({...formData, disposal_date: e.target.value})} required />
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
