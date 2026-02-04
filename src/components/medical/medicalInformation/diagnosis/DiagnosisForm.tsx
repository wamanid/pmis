import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { ClipboardList, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Diagnosis {
  id?: string;
  prisoner_name?: string;
  disease_name?: string;
  regiment_name?: string;
  differential: boolean;
  unfit_for_labor: boolean;
  remarks: string;
  medical_case_book: string;
  disease: string;
  regiment: string;
}

interface DiagnosisFormProps {
  diagnosis?: Diagnosis | null;
  onSubmit: (diagnosis: Diagnosis) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DiagnosisForm: React.FC<DiagnosisFormProps> = ({ diagnosis, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<Diagnosis>({
    differential: false,
    unfit_for_labor: false,
    remarks: '',
    medical_case_book: '',
    disease: '',
    regiment: '',
  });

  const [caseBooks, setCaseBooks] = useState<any[]>([]);
  const [diseases, setDiseases] = useState<any[]>([]);
  const [regiments, setRegiments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (diagnosis && dataLoaded) {
      setFormData(diagnosis);
    }
  }, [diagnosis, dataLoaded]);

  const loadDropdownData = () => {
    setCaseBooks([
      { id: '1', prisoner_name: 'John Doe', case_number: 'CB-2024-001' },
      { id: '2', prisoner_name: 'Jane Smith', case_number: 'CB-2024-002' },
      { id: '3', prisoner_name: 'Michael Johnson', case_number: 'CB-2024-003' },
    ]);

    setDiseases([
      { id: '1', name: 'Tuberculosis', category: 'Infectious' },
      { id: '2', name: 'Malaria', category: 'Infectious' },
      { id: '3', name: 'Pneumonia', category: 'Respiratory' },
      { id: '4', name: 'Hepatitis B', category: 'Infectious' },
      { id: '5', name: 'COVID-19', category: 'Infectious' },
    ]);

    setRegiments([
      { id: '1', name: 'Antibiotic Course', description: '14 days treatment' },
      { id: '2', name: 'Antiviral Medication', description: '21 days treatment' },
      { id: '3', name: 'Isolation Protocol', description: 'Quarantine required' },
      { id: '4', name: 'Observation', description: 'Monitor symptoms' },
    ]);
    
    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof Diagnosis, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medical_case_book) {
      toast.error('Please select a case book');
      return;
    }
    if (!formData.disease) {
      toast.error('Please select a disease');
      return;
    }
    if (!formData.regiment) {
      toast.error('Please select a treatment regiment');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedCaseBook = caseBooks.find((cb) => cb.id === formData.medical_case_book);
      const selectedDisease = diseases.find((d) => d.id === formData.disease);
      const selectedRegiment = regiments.find((r) => r.id === formData.regiment);

      const submitData: Diagnosis = {
        ...formData,
        prisoner_name: selectedCaseBook?.prisoner_name || '',
        disease_name: selectedDisease?.name || '',
        regiment_name: selectedRegiment?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Diagnosis created successfully');
        setFormData({
          differential: false,
          unfit_for_labor: false,
          remarks: '',
          medical_case_book: '',
          disease: '',
          regiment: '',
        });
      } else {
        toast.success('Diagnosis updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <ClipboardList className="h-5 w-5" />
          {mode === 'create' && 'New Diagnosis'}
          {mode === 'edit' && 'Edit Diagnosis'}
          {mode === 'view' && 'View Diagnosis'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Case Book Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medical_case_book">
                  Medical Case Book <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.medical_case_book}
                  onValueChange={(value) => handleInputChange('medical_case_book', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="medical_case_book">
                    <SelectValue placeholder="Select case book" />
                  </SelectTrigger>
                  <SelectContent>
                    {caseBooks.map((cb) => (
                      <SelectItem key={cb.id} value={cb.id}>
                        {cb.case_number} - {cb.prisoner_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Diagnosis Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="disease">
                  Disease <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.disease}
                  onValueChange={(value) => handleInputChange('disease', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="disease">
                    <SelectValue placeholder="Select disease" />
                  </SelectTrigger>
                  <SelectContent>
                    {diseases.map((disease) => (
                      <SelectItem key={disease.id} value={disease.id}>
                        {disease.name} ({disease.category})
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
              Status Flags
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="differential">Differential Diagnosis</Label>
                  <p className="text-sm text-gray-600">Mark if diagnosis is differential</p>
                </div>
                <Switch
                  id="differential"
                  checked={formData.differential}
                  onCheckedChange={(checked) => handleInputChange('differential', checked)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="unfit_for_labor">Unfit for Labor</Label>
                  <p className="text-sm text-gray-600">Mark if prisoner unfit for work</p>
                </div>
                <Switch
                  id="unfit_for_labor"
                  checked={formData.unfit_for_labor}
                  onCheckedChange={(checked) => handleInputChange('unfit_for_labor', checked)}
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Enter any additional remarks or observations..."
                rows={4}
                disabled={isReadOnly}
              />
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Diagnosis' : 'Update Diagnosis'}
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

export default DiagnosisForm;