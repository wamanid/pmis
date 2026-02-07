import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { ClipboardCheck, Save, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ExamResult {
  id?: string;
  prisoner_name?: string;
  exam_name?: string;
  notes: string;
  medical_case_book: string;
  medical_exam: string;
}

interface ExamResultFormProps {
  examResult?: ExamResult | null;
  onSubmit: (examResult: ExamResult) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const ExamResultForm: React.FC<ExamResultFormProps> = ({ examResult, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<ExamResult>({
    notes: '',
    medical_case_book: '',
    medical_exam: '',
  });

  const [caseBooks, setCaseBooks] = useState<any[]>([]);
  const [medicalExams, setMedicalExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (examResult && dataLoaded) {
      setFormData(examResult);
    }
  }, [examResult, dataLoaded]);

  const loadDropdownData = () => {
    setCaseBooks([
      { id: '1', prisoner_name: 'John Doe', case_number: 'CB-2024-001' },
      { id: '2', prisoner_name: 'Jane Smith', case_number: 'CB-2024-002' },
      { id: '3', prisoner_name: 'Michael Johnson', case_number: 'CB-2024-003' },
    ]);

    setMedicalExams([
      { id: '1', name: 'Blood Test', description: 'Complete blood count' },
      { id: '2', name: 'X-Ray', description: 'Chest X-Ray examination' },
      { id: '3', name: 'ECG', description: 'Electrocardiogram' },
      { id: '4', name: 'Urinalysis', description: 'Urine test' },
      { id: '5', name: 'CT Scan', description: 'CT scan imaging' },
      { id: '6', name: 'MRI', description: 'Magnetic resonance imaging' },
    ]);
    
    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof ExamResult, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medical_case_book) {
      toast.error('Please select a case book');
      return;
    }
    if (!formData.medical_exam) {
      toast.error('Please select a medical exam');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedCaseBook = caseBooks.find((cb) => cb.id === formData.medical_case_book);
      const selectedExam = medicalExams.find((exam) => exam.id === formData.medical_exam);

      const submitData: ExamResult = {
        ...formData,
        prisoner_name: selectedCaseBook?.prisoner_name || '',
        exam_name: selectedExam?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Exam result created successfully');
        setFormData({
          notes: '',
          medical_case_book: '',
          medical_exam: '',
        });
      } else {
        toast.success('Exam result updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <ClipboardCheck className="h-5 w-5" />
          {mode === 'create' && 'New Exam Result'}
          {mode === 'edit' && 'Edit Exam Result'}
          {mode === 'view' && 'View Exam Result'}
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
              Exam Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medical_exam">
                  Medical Exam <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.medical_exam}
                  onValueChange={(value) => handleInputChange('medical_exam', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="medical_exam">
                    <SelectValue placeholder="Select medical exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicalExams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.name} - {exam.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Results and Notes
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter exam results, findings, and observations..."
                rows={6}
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Result' : 'Update Result'}
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

export default ExamResultForm;