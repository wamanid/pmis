import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const DischargeOfficersForm: React.FC<{ initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; }> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    discharge_details: '',
    prisoner_name: '',
    officer_name: '',
    rank: '',
    force_number: '',
    role: '',
    signature: '',
    discharge: '',
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Discharge *</Label>
          <Select value={formData.discharge} onValueChange={(v) => setFormData({...formData, discharge: v, prisoner_name: 'John Doe'})}>
            <SelectTrigger><SelectValue placeholder="Select discharge" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="discharge-001">Discharge #001 - John Doe</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Officer Name *</Label>
          <Input value={formData.officer_name} onChange={(e) => setFormData({...formData, officer_name: e.target.value})} required />
        </div>
        <div>
          <Label>Rank *</Label>
          <Input value={formData.rank} onChange={(e) => setFormData({...formData, rank: e.target.value})} required />
        </div>
        <div>
          <Label>Force Number *</Label>
          <Input value={formData.force_number} onChange={(e) => setFormData({...formData, force_number: e.target.value})} required />
        </div>
        <div>
          <Label>Role *</Label>
          <Input value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required />
        </div>
        <div>
          <Label>Signature</Label>
          <Input type="file" onChange={(e) => setFormData({...formData, signature: e.target.files?.[0]?.name || ''})} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};
