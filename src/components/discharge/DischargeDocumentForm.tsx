import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export const DischargeDocumentForm: React.FC<{ initialData?: any; onSubmit: (data: any) => void; onCancel: () => void; }> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    discharge_details: '',
    prisoner_name: '',
    document_type: '',
    document: '',
    description: '',
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
          <Label>Document Type *</Label>
          <Input value={formData.document_type} onChange={(e) => setFormData({...formData, document_type: e.target.value})} required />
        </div>
        <div className="col-span-2">
          <Label>Document File</Label>
          <Input type="file" onChange={(e) => setFormData({...formData, document: e.target.files?.[0]?.name || ''})} />
        </div>
        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{initialData ? 'Update' : 'Upload'} Document</Button>
      </div>
    </form>
  );
};
