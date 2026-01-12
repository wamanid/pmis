import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Stethoscope, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Ailment {
  id?: string;
  prisoner_name?: string;
  ailment_name?: string;
  regiment_name?: string;
  remarks: string;
  supporting_document: string;
  prisoner_medical_record: string;
  ailment: string;
  regiment: string;
}

interface AilmentFormProps {
  ailment?: Ailment | null;
  onSubmit: (ailment: Ailment) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const AilmentForm: React.FC<AilmentFormProps> = ({ ailment, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<Ailment>({
    remarks: '',
    supporting_document: '',
    prisoner_medical_record: '',
    ailment: '',
    regiment: '',
  });

  const [medicalRecords, setMedicalRecords] = useState<any[]>([]);
  const [ailments, setAilments] = useState<any[]>([]);
  const [regiments, setRegiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (ailment && dataLoaded) {
      setFormData(ailment);
    }
  }, [ailment, dataLoaded]);

  const loadDropdownData = () => {
    setMedicalRecords([
      { id: '1', prisoner_name: 'John Doe', prisoner_number: 'PR-2024-001' },
      { id: '2', prisoner_name: 'Jane Smith', prisoner_number: 'PR-2024-002' },
      { id: '3', prisoner_name: 'Michael Johnson', prisoner_number: 'PR-2024-003' },
    ]);

    setAilments([
      { id: '1', name: 'Hypertension', description: 'High blood pressure' },
      { id: '2', name: 'Diabetes Type 2', description: 'Blood sugar disorder' },
      { id: '3', name: 'Asthma', description: 'Respiratory condition' },
      { id: '4', name: 'Arthritis', description: 'Joint inflammation' },
      { id: '5', name: 'Migraine', description: 'Severe headaches' },
    ]);

    setRegiments([
      { id: '1', name: 'Daily Medication', description: 'Take medication once daily' },
      { id: '2', name: 'Twice Daily', description: 'Take medication twice daily' },
      { id: '3', name: 'As Needed', description: 'Take when symptoms appear' },
      { id: '4', name: 'Weekly Treatment', description: 'Treatment once per week' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof Ailment, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, supporting_document: file.name }));
      toast.success('Document uploaded successfully');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner_medical_record) {
      toast.error('Please select a medical record');
      return;
    }
    if (!formData.ailment) {
      toast.error('Please select an ailment');
      return;
    }
    if (!formData.regiment) {
      toast.error('Please select a treatment regiment');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedRecord = medicalRecords.find((r) => r.id === formData.prisoner_medical_record);
      const selectedAilment = ailments.find((a) => a.id === formData.ailment);
      const selectedRegiment = regiments.find((r) => r.id === formData.regiment);

      const submitData: Ailment = {
        ...formData,
        prisoner_name: selectedRecord?.prisoner_name || '',
        ailment_name: selectedAilment?.name || '',
        regiment_name: selectedRegiment?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Ailment record created successfully');
        setFormData({
          remarks: '',
          supporting_document: '',
          prisoner_medical_record: '',
          ailment: '',
          regiment: '',
        });
      } else {
        toast.success('Ailment record updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Stethoscope className="h-5 w-5" />
          {mode === 'create' && 'New Ailment Record'}
          {mode === 'edit' && 'Edit Ailment Record'}
          {mode === 'view' && 'View Ailment Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Medical Record
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner_medical_record">
                  Medical Record <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.prisoner_medical_record}
                  onValueChange={(value) => handleInputChange('prisoner_medical_record', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="prisoner_medical_record">
                    <SelectValue placeholder="Select medical record" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicalRecords.map((record) => (
                      <SelectItem key={record.id} value={record.id}>
                        {record.prisoner_number} - {record.prisoner_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Ailment Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ailment">
                  Ailment/Disease <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.ailment}
                  onValueChange={(value) => handleInputChange('ailment', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="ailment">
                    <SelectValue placeholder="Select ailment" />
                  </SelectTrigger>
                  <SelectContent>
                    {ailments.map((ailment) => (
                      <SelectItem key={ailment.id} value={ailment.id}>
                        {ailment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="regiment">
                  Treatment Regiment <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.regiment}
                  onValueChange={(value) => handleInputChange('regiment', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="regiment">
                    <SelectValue placeholder="Select regiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {regiments.map((regiment) => (
                      <SelectItem key={regiment.id} value={regiment.id}>
                        {regiment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Enter any additional remarks..."
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supporting_document">Supporting Document</Label>
                {isReadOnly ? (
                  <Input
                    id="supporting_document"
                    value={formData.supporting_document}
                    disabled
                    placeholder="No document uploaded"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="supporting_document"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                {formData.supporting_document && (
                  <p className="text-sm text-gray-600">
                    Current file: {formData.supporting_document}
                  </p>
                )}
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : mode === 'create' ? 'Create Record' : 'Update Record'}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex items-center justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Close
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default AilmentForm;