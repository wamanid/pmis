import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Save, 
  X, 
  Fingerprint,
  Loader2
} from 'lucide-react';
import PrisonerSearchScreen from '../common/PrisonerSearchScreen';
import BiometricCapture from '../common/BiometricCapture';

interface BiometricField {
  id: string;
  name: string;
  description: string;
  field_type: string;
}

interface BiometricRecordFormData {
  id?: string;
  prisoner: string;
  prisoner_name: string;
  prisoner_number: string;
  biometric_field: string;
  biometric_field_name: string;
  remark: string;
  quality_score: number;
  capture_datetime: string;
  biometric_data?: string;
}

interface BiometricRecordFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: BiometricRecordFormData | null;
  mode?: 'create' | 'edit';
}

// Mock biometric fields data
const mockBiometricFields: BiometricField[] = [
  { id: 'bf1', name: 'Left Thumb', description: 'Left thumb fingerprint', field_type: 'fingerprint' },
  { id: 'bf2', name: 'Left Index Finger', description: 'Left index fingerprint', field_type: 'fingerprint' },
  { id: 'bf3', name: 'Left Middle Finger', description: 'Left middle fingerprint', field_type: 'fingerprint' },
  { id: 'bf4', name: 'Left Ring Finger', description: 'Left ring fingerprint', field_type: 'fingerprint' },
  { id: 'bf5', name: 'Left Little Finger', description: 'Left little fingerprint', field_type: 'fingerprint' },
  { id: 'bf6', name: 'Right Thumb', description: 'Right thumb fingerprint', field_type: 'fingerprint' },
  { id: 'bf7', name: 'Right Index Finger', description: 'Right index fingerprint', field_type: 'fingerprint' },
  { id: 'bf8', name: 'Right Middle Finger', description: 'Right middle fingerprint', field_type: 'fingerprint' },
  { id: 'bf9', name: 'Right Ring Finger', description: 'Right ring fingerprint', field_type: 'fingerprint' },
  { id: 'bf10', name: 'Right Little Finger', description: 'Right little fingerprint', field_type: 'fingerprint' },
  { id: 'bf11', name: 'Facial Recognition', description: 'Facial biometric data', field_type: 'face' },
  { id: 'bf12', name: 'Iris Scan', description: 'Iris biometric data', field_type: 'iris' }
];

export default function BiometricRecordForm({ 
  open, 
  onClose, 
  onSuccess, 
  editData, 
  mode = 'create' 
}: BiometricRecordFormProps) {
  const [formData, setFormData] = useState<BiometricRecordFormData>({
    prisoner: '',
    prisoner_name: '',
    prisoner_number: '',
    biometric_field: '',
    biometric_field_name: '',
    remark: '',
    quality_score: 0,
    capture_datetime: new Date().toISOString(),
    biometric_data: ''
  });

  const [biometricFields, setBiometricFields] = useState<BiometricField[]>(mockBiometricFields);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load biometric fields
  useEffect(() => {
    const fetchBiometricFields = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/biometrics/fields/');
        // const data = await response.json();
        // setBiometricFields(data.results || data);
        setBiometricFields(mockBiometricFields);
      } catch (error) {
        console.error('Error fetching biometric fields:', error);
      }
    };

    if (open) {
      fetchBiometricFields();
    }
  }, [open]);

  // Populate form when editing
  useEffect(() => {
    if (editData && mode === 'edit') {
      setFormData({
        ...editData,
        capture_datetime: editData.capture_datetime || new Date().toISOString()
      });
    } else {
      // Reset form for create mode
      setFormData({
        prisoner: '',
        prisoner_name: '',
        prisoner_number: '',
        biometric_field: '',
        biometric_field_name: '',
        remark: '',
        quality_score: 0,
        capture_datetime: new Date().toISOString(),
        biometric_data: ''
      });
    }
    setErrors({});
  }, [editData, mode, open]);

  const handleChange = (field: keyof BiometricRecordFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePrisonerSelect = (prisonerId: string, prisoner: any) => {
    if (prisoner) {
      setFormData(prev => ({
        ...prev,
        prisoner: prisonerId,
        prisoner_name: prisoner.full_name,
        prisoner_number: prisoner.prisoner_number
      }));
    }
  };

  const handleBiometricFieldChange = (fieldId: string) => {
    const field = biometricFields.find(f => f.id === fieldId);
    if (field) {
      setFormData(prev => ({
        ...prev,
        biometric_field: fieldId,
        biometric_field_name: field.name
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.prisoner) {
      newErrors.prisoner = 'Prisoner is required';
    }
    if (!formData.biometric_field) {
      newErrors.biometric_field = 'Biometric field is required';
    }
    if (!formData.biometric_data && mode === 'create') {
      newErrors.biometric_data = 'Biometric capture is required';
    }
    if (formData.quality_score < 0 || formData.quality_score > 100) {
      newErrors.quality_score = 'Quality score must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      const url = mode === 'edit' && editData?.id
        ? `/api/biometrics/records/${editData.id}/`
        : '/api/biometrics/records/';

      const method = mode === 'edit' ? 'PUT' : 'POST';

      const payload = {
        prisoner: formData.prisoner,
        biometric_field: formData.biometric_field,
        remark: formData.remark,
        quality_score: formData.quality_score,
        capture_datetime: formData.capture_datetime,
        biometric_data: formData.biometric_data
      };

      console.log(`${method} ${url}`, payload);

      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(
        mode === 'edit' 
          ? 'Biometric record updated successfully' 
          : 'Biometric record created successfully'
      );
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error saving biometric record:', error);
      toast.error(error.message || 'Failed to save biometric record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1270px] h-[95vh] overflow-hidden p-0 flex flex-col">
        {/* Fixed Header */}
        <DialogHeader style={{ borderBottom: '2px solid #650000', padding: '0.75rem 1.5rem' }} className="shrink-0">
          <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            <Fingerprint className="h-5 w-5" />
            {mode === 'edit' ? 'Edit Biometric Record' : 'Create Biometric Record'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'edit' 
              ? 'Update biometric record information' 
              : 'Capture and register new biometric data for a prisoner'}
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          <form onSubmit={handleSubmit} id="biometric-form">
            <div className="space-y-3">
              {/* Prisoner Information */}
              <div>
                {mode === 'edit' && editData ? (
                  <div className="p-2 bg-gray-50 rounded border" style={{ borderColor: '#650000' }}>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Prisoner Name</p>
                        <p className="text-sm font-medium">{formData.prisoner_name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Prisoner Number</p>
                        <p className="text-sm font-medium">{formData.prisoner_number}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Label className="text-sm mb-1 block">Prisoner *</Label>
                    <PrisonerSearchScreen
                      value={formData.prisoner}
                      onChange={handlePrisonerSelect}
                      showTitle={false}
                      required={true}
                    />
                    {errors.prisoner && (
                      <p className="text-xs text-red-600 mt-1">{errors.prisoner}</p>
                    )}
                  </>
                )}
              </div>

              {/* Biometric Field and Quality Score Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Biometric Field */}
                <div className="space-y-1">
                  <Label htmlFor="biometric_field" className="text-sm">
                    Biometric Field *
                  </Label>
                  <Select
                    value={formData.biometric_field}
                    onValueChange={handleBiometricFieldChange}
                    disabled={mode === 'edit'}
                  >
                    <SelectTrigger 
                      id="biometric_field"
                      className="h-9"
                      style={{ 
                        borderColor: formData.biometric_field ? '#650000' : undefined,
                        borderWidth: formData.biometric_field ? '2px' : '1px'
                      }}
                    >
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {biometricFields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.biometric_field && (
                    <p className="text-xs text-red-600">{errors.biometric_field}</p>
                  )}
                </div>

                {/* Quality Score */}
                <div className="space-y-1">
                  <Label htmlFor="quality_score" className="text-sm">
                    Quality Score
                  </Label>
                  <Input
                    id="quality_score"
                    type="number"
                    min="0"
                    max="100"
                    className="h-9"
                    value={formData.quality_score}
                    onChange={(e) => handleChange('quality_score', parseInt(e.target.value) || 0)}
                    disabled
                    style={{ 
                      borderColor: formData.quality_score > 0 ? '#650000' : undefined,
                      borderWidth: formData.quality_score > 0 ? '2px' : '1px'
                    }}
                  />
                  {errors.quality_score && (
                    <p className="text-xs text-red-600">{errors.quality_score}</p>
                  )}
                </div>
              </div>

              {/* Remark */}
              <div className="space-y-1">
                <Label htmlFor="remark" className="text-sm">
                  Remark
                </Label>
                <Textarea
                  id="remark"
                  value={formData.remark}
                  onChange={(e) => handleChange('remark', e.target.value)}
                  placeholder="Add any additional notes..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Biometric Capture */}
              <div className="space-y-1 pt-2 border-t">
                <Label className="text-sm">Biometric Capture *</Label>
                <BiometricCapture
                  value={formData.biometric_data || ''}
                  onChange={(value) => handleChange('biometric_data', value)}
                  label={`Capture ${formData.biometric_field_name || 'Biometric'}`}
                />
                {errors.biometric_data && (
                  <p className="text-xs text-red-600 mt-1">{errors.biometric_data}</p>
                )}
            </div>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="border-t px-6 py-3 flex justify-end gap-2 shrink-0 bg-white">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="h-9"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            type="submit"
            form="biometric-form"
            disabled={isSubmitting}
            className="h-9"
            style={{ backgroundColor: '#650000' }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {mode === 'edit' ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {mode === 'edit' ? 'Update Record' : 'Create Record'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
