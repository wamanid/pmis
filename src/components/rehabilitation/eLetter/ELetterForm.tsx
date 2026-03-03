import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Mail, Save, X, Upload } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ELetter {
  id?: string;
  prisoner_name?: string;
  letter_type_name?: string;
  prisoner_number?: string;
  censored_by_name?: string;
  welfare_officer_name?: string;
  delivered_by_name?: string;
  handled_by_name?: string;
  relation_name?: string;
  subject: string;
  letter_tracking_number?: string;
  letter_date: string;
  letter_content: string;
  letter_document?: string;
  recipient_email: string;
  sender_email: string;
  sender_name: string;
  recipient_name: string;
  comment: string;
  prisoner: string;
  letter_type: string;
  censored_by: number;
  welfare_officer: number;
  relation_to_prisoner: string;
  delivered_by: number;
  handled_by: number;
}

interface ELetterFormProps {
  eLetter?: ELetter | null;
  onSubmit: (eLetter: ELetter) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const ELetterForm: React.FC<ELetterFormProps> = ({
  eLetter,
  onSubmit,
  onCancel,
  mode,
}) => {
  const [formData, setFormData] = useState<ELetter>({
    subject: '',
    letter_date: new Date().toISOString().split('T')[0],
    letter_content: '',
    recipient_email: '',
    sender_email: '',
    sender_name: '',
    recipient_name: '',
    comment: '',
    prisoner: '',
    letter_type: '',
    censored_by: 0,
    welfare_officer: 0,
    relation_to_prisoner: '',
    delivered_by: 0,
    handled_by: 0,
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [letterTypes, setLetterTypes] = useState<any[]>([]);
  const [relationships, setRelationships] = useState<any[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (eLetter) {
      setFormData(eLetter);
    }
  }, [eLetter]);

  const loadDropdownData = () => {
    // Mock data - replace with actual API calls
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
    ]);

    setLetterTypes([
      { id: '1', name: 'Incoming Letter' },
      { id: '2', name: 'Outgoing Letter' },
      { id: '3', name: 'Official Correspondence' },
      { id: '4', name: 'Legal Document' },
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
      { id: 4, name: 'Officer Mary Johnson' },
    ]);
  };

  const handleInputChange = (field: keyof ELetter, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const generateTrackingNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ELT-${year}-${random}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.letter_type) {
      toast.error('Please select a letter type');
      return;
    }
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    if (!formData.letter_content.trim()) {
      toast.error('Please enter letter content');
      return;
    }
    if (!formData.sender_name.trim()) {
      toast.error('Please enter sender name');
      return;
    }
    if (!formData.recipient_name.trim()) {
      toast.error('Please enter recipient name');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.sender_email && !emailRegex.test(formData.sender_email)) {
      toast.error('Please enter a valid sender email');
      return;
    }
    if (formData.recipient_email && !emailRegex.test(formData.recipient_email)) {
      toast.error('Please enter a valid recipient email');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedLetterType = letterTypes.find((lt) => lt.id === formData.letter_type);
      const selectedRelation = relationships.find((r) => r.id === formData.relation_to_prisoner);
      const censoredByOfficer = officers.find((o) => o.id === formData.censored_by);
      const welfareOfficer = officers.find((o) => o.id === formData.welfare_officer);
      const deliveredByOfficer = officers.find((o) => o.id === formData.delivered_by);
      const handledByOfficer = officers.find((o) => o.id === formData.handled_by);

      const submitData: ELetter = {
        ...formData,
        letter_tracking_number: formData.letter_tracking_number || generateTrackingNumber(),
        prisoner_name: selectedPrisoner?.full_name || '',
        prisoner_number: selectedPrisoner?.prisoner_number || '',
        letter_type_name: selectedLetterType?.name || '',
        relation_name: selectedRelation?.name || '',
        censored_by_name: censoredByOfficer?.name || '',
        welfare_officer_name: welfareOfficer?.name || '',
        delivered_by_name: deliveredByOfficer?.name || '',
        handled_by_name: handledByOfficer?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('e-Letter created successfully');
        // Reset form
        setFormData({
          subject: '',
          letter_date: new Date().toISOString().split('T')[0],
          letter_content: '',
          recipient_email: '',
          sender_email: '',
          sender_name: '',
          recipient_name: '',
          comment: '',
          prisoner: '',
          letter_type: '',
          censored_by: 0,
          welfare_officer: 0,
          relation_to_prisoner: '',
          delivered_by: 0,
          handled_by: 0,
        });
        setSelectedFile(null);
      } else {
        toast.success('e-Letter updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Mail className="h-5 w-5" />
          {mode === 'create' && 'New e-Letter'}
          {mode === 'edit' && 'Edit e-Letter'}
          {mode === 'view' && 'View e-Letter'}
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
            </div>
          </div>

          {/* Letter Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Letter Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="letter_type">
                  Letter Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.letter_type}
                  onValueChange={(value) => handleInputChange('letter_type', value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="letter_type">
                    <SelectValue placeholder="Select letter type" />
                  </SelectTrigger>
                  <SelectContent>
                    {letterTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="letter_date">
                  Letter Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="letter_date"
                  type="date"
                  value={formData.letter_date}
                  onChange={(e) => handleInputChange('letter_date', e.target.value)}
                  disabled={isReadOnly}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {mode === 'view' && formData.letter_tracking_number && (
                <div className="space-y-2">
                  <Label htmlFor="tracking_number">Tracking Number</Label>
                  <Input
                    id="tracking_number"
                    value={formData.letter_tracking_number}
                    disabled
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter letter subject"
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Sender & Recipient Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Sender & Recipient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sender_name">
                  Sender Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="sender_name"
                  value={formData.sender_name}
                  onChange={(e) => handleInputChange('sender_name', e.target.value)}
                  placeholder="Enter sender name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender_email">Sender Email</Label>
                <Input
                  id="sender_email"
                  type="email"
                  value={formData.sender_email}
                  onChange={(e) => handleInputChange('sender_email', e.target.value)}
                  placeholder="sender@example.com"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_name">
                  Recipient Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient_name"
                  value={formData.recipient_name}
                  onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                  placeholder="Enter recipient name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_email">Recipient Email</Label>
                <Input
                  id="recipient_email"
                  type="email"
                  value={formData.recipient_email}
                  onChange={(e) => handleInputChange('recipient_email', e.target.value)}
                  placeholder="recipient@example.com"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>

          {/* Letter Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Letter Content
            </h3>
            <div className="space-y-2">
              <Label htmlFor="letter_content">
                Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="letter_content"
                value={formData.letter_content}
                onChange={(e) => handleInputChange('letter_content', e.target.value)}
                placeholder="Enter letter content..."
                rows={8}
                disabled={isReadOnly}
              />
            </div>

            {!isReadOnly && (
              <div className="space-y-2">
                <Label htmlFor="letter_document">Letter Document (PDF, DOCX, etc.)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="letter_document"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
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

            {isReadOnly && formData.letter_document && (
              <div className="space-y-2">
                <Label>Letter Document</Label>
                <div className="text-sm text-blue-600 underline cursor-pointer">
                  {formData.letter_document}
                </div>
              </div>
            )}
          </div>

          {/* Officers & Processing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Processing Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="0">None</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id.toString()}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="censored_by">Censored By</Label>
                <Select
                  value={formData.censored_by.toString()}
                  onValueChange={(value) => handleInputChange('censored_by', parseInt(value))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="censored_by">
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id.toString()}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="handled_by">Handled By</Label>
                <Select
                  value={formData.handled_by.toString()}
                  onValueChange={(value) => handleInputChange('handled_by', parseInt(value))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="handled_by">
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id.toString()}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivered_by">Delivered By</Label>
                <Select
                  value={formData.delivered_by.toString()}
                  onValueChange={(value) => handleInputChange('delivered_by', parseInt(value))}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="delivered_by">
                    <SelectValue placeholder="Select officer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
                    {officers.map((officer) => (
                      <SelectItem key={officer.id} value={officer.id.toString()}>
                        {officer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comments</Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Enter any additional comments..."
                rows={3}
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create e-Letter' : 'Update e-Letter'}
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

export default ELetterForm;
