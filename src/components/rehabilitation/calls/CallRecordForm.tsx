import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Phone, Save, X, Upload, User } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CallRecord {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  call_type_name?: string;
  relation_name?: string;
  welfare_officer_name?: string;
  caller: string;
  phone_number: string;
  call_date: string;
  call_duration: number;
  call_notes: string;
  recorded_call?: string;
  prisoner: string;
  call_type: string;
  relation_to_prisoner: string;
  welfare_officer: number;
}

interface CallRecordFormProps {
  callRecord?: CallRecord | null;
  onSubmit: (callRecord: CallRecord) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const CallRecordForm: React.FC<CallRecordFormProps> = ({
  callRecord,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<CallRecord>({
    caller: '',
    phone_number: '',
    call_date: new Date().toISOString().split('T')[0],
    call_duration: 0,
    call_notes: '',
    prisoner: '',
    call_type: '',
    relation_to_prisoner: '',
    welfare_officer: 0,
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [callTypes, setCallTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (callRecord) {
      setFormData(callRecord);
    }
  }, [callRecord]);

  const loadDropdownData = () => {
    // Mock data - replace with actual API calls
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
    ]);

    setCallTypes([
      { id: '1', name: 'Incoming Call' },
      { id: '2', name: 'Outgoing Call' },
      { id: '3', name: 'Emergency Call' },
      { id: '4', name: 'Welfare Check' },
    ]);

    setRelationships([
      { id: '1', name: 'Parent' },
      { id: '2', name: 'Spouse' },
      { id: '3', name: 'Sibling' },
      { id: '4', name: 'Child' },
      { id: '5', name: 'Other Relative' },
      { id: '6', name: 'Friend' },
      { id: '7', name: 'Legal Representative' },
    ]);

    setOfficers([
      { id: 1, name: 'Officer David Wilson' },
      { id: 2, name: 'Officer Sarah Brown' },
      { id: 3, name: 'Officer James Taylor' },
    ]);
  };

  const handleInputChange = (field: keyof CallRecord, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.call_type) {
      toast.error('Please select a call type');
      return;
    }
    if (!formData.caller.trim()) {
      toast.error('Please enter caller name');
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error('Please enter phone number');
      return;
    }
    if (!formData.call_date) {
      toast.error('Please select call date');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedCallType = callTypes.find((ct) => ct.id === formData.call_type);
      const selectedRelation = relationships.find((r) => r.id === formData.relation_to_prisoner);
      const selectedOfficer = officers.find((o) => o.id === formData.welfare_officer);

      const submitData: CallRecord = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        call_type_name: selectedCallType?.name || '',
        relation_name: selectedRelation?.name || '',
        welfare_officer_name: selectedOfficer?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);
      
      if (mode === 'create') {
        toast.success('Call record created successfully');
        // Reset form
        setFormData({
          caller: '',
          phone_number: '',
          call_date: new Date().toISOString().split('T')[0],
          call_duration: 0,
          call_notes: '',
          prisoner: '',
          call_type: '',
          relation_to_prisoner: '',
          welfare_officer: 0,
        });
        setSelectedFile(null);
      } else {
        toast.success('Call record updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Phone className="h-5 w-5" />
          {mode === 'create' && 'New Call Record'}
          {mode === 'edit' && 'Edit Call Record'}
          {mode === 'view' && 'View Call Record'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prisoner Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.prisoner}
                  onValueChange={(value) => handleInputChange('prisoner', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="prisoner">
                    <SelectValue placeholder="Select prisoner" />
                  </SelectTrigger>
                  <SelectContent>
                    {prisoners.map((prisoner) => (
                      <SelectItem key={prisoner.id} value={prisoner.id}>
                        {prisoner.prisoner_number} - {prisoner.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Call Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Call Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="call_type">
                  Call Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.call_type}
                  onValueChange={(value) => handleInputChange('call_type', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="call_type">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    {callTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="call_date">
                  Call Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="call_date"
                  type="date"
                  value={formData.call_date}
                  onChange={(e) => handleInputChange('call_date', e.target.value)}
                  disabled={isReadOnly}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caller">
                  Caller Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="caller"
                  value={formData.caller}
                  onChange={(e) => handleInputChange('caller', e.target.value)}
                  placeholder="Enter caller name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="+256 XXX XXX XXX"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relation_to_prisoner">Relationship to Prisoner</Label>
                <Select
                  value={formData.relation_to_prisoner}
                  onValueChange={(value) => handleInputChange('relation_to_prisoner', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="relation_to_prisoner">
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    {relationships.map((relation) => (
                      <SelectItem key={relation.id} value={relation.id}>
                        {relation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="call_duration">Call Duration (minutes)</Label>
                <Input
                  id="call_duration"
                  type="number"
                  min="0"
                  value={formData.call_duration}
                  onChange={(e) => handleInputChange('call_duration', parseInt(e.target.value) || 0)}
                  placeholder="Enter duration in minutes"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welfare_officer">Welfare Officer</Label>
                <Select
                  value={formData.welfare_officer.toString()}
                  onValueChange={(value) => handleInputChange('welfare_officer', parseInt(value))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="welfare_officer">
                    <SelectValue placeholder="Select welfare officer" />
                  </SelectTrigger>
                  <SelectContent>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id.toString()}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!isReadOnly && (
                <div className="space-y-2">
                  <Label htmlFor="recorded_call">Recorded Call (Audio File)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="recorded_call"
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      disabled={isReadOnly}
                    />
                    <Upload className="h-4 w-4 text-gray-400" />
                  </div>
                  {selectedFile && (
                    <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                  )}
                </div>
              )}

              {isReadOnly && formData.recorded_call && (
                <div className="space-y-2">
                  <Label>Recorded Call</Label>
                  <div className="text-sm text-blue-600 underline cursor-pointer">
                    {formData.recorded_call}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="call_notes">Call Notes</Label>
              <Textarea
                id="call_notes"
                value={formData.call_notes}
                onChange={(e) => handleInputChange('call_notes', e.target.value)}
                placeholder="Enter notes about the call..."
                rows={4}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Call Record' : 'Update Call Record'}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex items-center justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CallRecordForm;
