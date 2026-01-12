import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ShieldAlert, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface PrisonerRestriction {
  id?: string;
  prisoner_name?: string;
  restriction_type_name?: string;
  restriction_category_name?: string;
  start_date: string;
  end_date: string;
  reason: string;
  restrictions_details: string;
  status: string;
  approved_by: string;
  remarks: string;
  prisoner: string;
  restriction_type: string;
  restriction_category: string;
}

interface PrisonerRestrictionFormProps {
  restriction?: PrisonerRestriction | null;
  onSubmit: (restriction: PrisonerRestriction) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const PrisonerRestrictionForm: React.FC<PrisonerRestrictionFormProps> = ({ restriction, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<PrisonerRestriction>({
    start_date: '',
    end_date: '',
    reason: '',
    restrictions_details: '',
    status: 'Active',
    approved_by: '',
    remarks: '',
    prisoner: '',
    restriction_type: '',
    restriction_category: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [restrictionTypes, setRestrictionTypes] = useState<any[]>([]);
  const [restrictionCategories, setRestrictionCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (restriction && dataLoaded) {
      setFormData(restriction);
    }
  }, [restriction, dataLoaded]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setRestrictionTypes([
      { id: '1', name: 'Movement Restriction', description: 'Limited movement within facility' },
      { id: '2', name: 'Communication Restriction', description: 'Limited phone/mail access' },
      { id: '3', name: 'Activity Restriction', description: 'Restricted from certain activities' },
      { id: '4', name: 'Visitor Restriction', description: 'Limited or no visitors' },
      { id: '5', name: 'Work Restriction', description: 'Limited work assignments' },
    ]);

    setRestrictionCategories([
      { id: '1', name: 'Security Risk', code: 'SEC' },
      { id: '2', name: 'Medical Reason', code: 'MED' },
      { id: '3', name: 'Disciplinary Action', code: 'DIS' },
      { id: '4', name: 'Protective Custody', code: 'PRO' },
      { id: '5', name: 'Investigation', code: 'INV' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof PrisonerRestriction, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.restriction_type) {
      toast.error('Please select a restriction type');
      return;
    }
    if (!formData.restriction_category) {
      toast.error('Please select a restriction category');
      return;
    }
    if (!formData.start_date) {
      toast.error('Please select a start date');
      return;
    }
    if (!formData.reason) {
      toast.error('Please enter a reason');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedType = restrictionTypes.find((t) => t.id === formData.restriction_type);
      const selectedCategory = restrictionCategories.find((c) => c.id === formData.restriction_category);

      const submitData: PrisonerRestriction = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        restriction_type_name: selectedType?.name || '',
        restriction_category_name: selectedCategory?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Restriction created successfully');
        setFormData({
          start_date: '',
          end_date: '',
          reason: '',
          restrictions_details: '',
          status: 'Active',
          approved_by: '',
          remarks: '',
          prisoner: '',
          restriction_type: '',
          restriction_category: '',
        });
      } else {
        toast.success('Restriction updated successfully');
      }
    }, 500);
  };

  const isReadOnly = mode === 'view';

  // Get display values for view mode
  const getDisplayValue = (field: string, id: string) => {
    if (!id) return 'N/A';
    
    switch (field) {
      case 'prisoner':
        const prisoner = prisoners.find(p => p.id === id);
        return prisoner ? `${prisoner.prisoner_number} - ${prisoner.full_name}` : id;
      case 'restriction_type':
        const type = restrictionTypes.find(t => t.id === id);
        return type ? type.name : id;
      case 'restriction_category':
        const category = restrictionCategories.find(c => c.id === id);
        return category ? `${category.name} (${category.code})` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <ShieldAlert className="h-5 w-5" />
          {mode === 'create' && 'New Prisoner Restriction'}
          {mode === 'edit' && 'Edit Prisoner Restriction'}
          {mode === 'view' && 'View Prisoner Restriction'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Prisoner Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prisoner">
                  Prisoner <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('prisoner', formData.prisoner)}
                  </div>
                ) : (
                  <Select
                    value={formData.prisoner}
                    onValueChange={(value) => handleInputChange('prisoner', value)}
                  >
                    <SelectTrigger id="prisoner">
                      <SelectValue placeholder="Select prisoner" />
                    </SelectTrigger>
                    <SelectContent>
                      {prisoners.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.prisoner_number} - {p.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.status || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Restriction Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="restriction_type">
                  Restriction Type <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('restriction_type', formData.restriction_type)}
                  </div>
                ) : (
                  <Select
                    value={formData.restriction_type}
                    onValueChange={(value) => handleInputChange('restriction_type', value)}
                  >
                    <SelectTrigger id="restriction_type">
                      <SelectValue placeholder="Select restriction type" />
                    </SelectTrigger>
                    <SelectContent>
                      {restrictionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="restriction_category">
                  Restriction Category <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('restriction_category', formData.restriction_category)}
                  </div>
                ) : (
                  <Select
                    value={formData.restriction_category}
                    onValueChange={(value) => handleInputChange('restriction_category', value)}
                  >
                    <SelectTrigger id="restriction_category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {restrictionCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.start_date ? format(new Date(formData.start_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.start_date ? format(new Date(formData.start_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.start_date ? new Date(formData.start_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('start_date', format(date, 'yyyy-MM-dd'));
                            setStartDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.end_date ? format(new Date(formData.end_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.end_date ? format(new Date(formData.end_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.end_date ? new Date(formData.end_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('end_date', format(date, 'yyyy-MM-dd'));
                            setEndDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                placeholder="Enter reason for restriction..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restrictions_details">Restriction Details</Label>
              <Textarea
                id="restrictions_details"
                value={formData.restrictions_details}
                onChange={(e) => handleInputChange('restrictions_details', e.target.value)}
                placeholder="Enter detailed restriction information..."
                rows={3}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Information
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="approved_by">Approved By</Label>
                <Input
                  id="approved_by"
                  value={formData.approved_by}
                  onChange={(e) => handleInputChange('approved_by', e.target.value)}
                  placeholder="Enter approver name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  placeholder="Enter additional remarks..."
                  rows={3}
                  disabled={isReadOnly}
                />
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Restriction' : 'Update Restriction'}
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

export default PrisonerRestrictionForm;
