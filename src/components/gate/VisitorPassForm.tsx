import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Check, ChevronsUpDown, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import {Pass} from "../../services/stationServices/visitorsServices/visitorPass";

interface VisitorPass {
  id?: string;
  prisoner_name?: string;
  visitor_name?: string;
  suspended_by_username?: string;
  visitor_tag_number: string;
  valid_from: string;
  valid_until: string;
  purpose: string;
  issue_date: string;
  is_suspended: boolean;
  suspended_date: string;
  suspended_reason: string;
  is_valid?: boolean;
  prisoner: string;
  visitor: string;
  suspended_by: number;
}

interface VisitorPassFormProps {
  pass?: VisitorPass | null;
  onSubmit: (data: VisitorPass) => void;
  onCancel: () => void;
  disabledFields?: {
    prisoner?: boolean;
    visitor?: boolean;
  };
  onAddNewVisitor?: () => void;
  visitors?: Array<{ id: string; name: string; id_number: string }>;
}

// Mock data for dropdowns
const mockPrisoners = [
  { id: 'prisoner-uuid-1', name: 'John Doe', prisoner_number: 'P-2024-001' },
  { id: 'prisoner-uuid-2', name: 'Michael Brown', prisoner_number: 'P-2024-002' },
  { id: 'prisoner-uuid-3', name: 'Robert Wilson', prisoner_number: 'P-2024-003' },
  { id: 'prisoner-uuid-4', name: 'David Martinez', prisoner_number: 'P-2024-004' },
  { id: 'prisoner-uuid-5', name: 'James Anderson', prisoner_number: 'P-2024-005' }
];

const mockVisitors = [
  { id: 'visitor-uuid-1', name: 'Jane Smith', id_number: 'ID-001' },
  { id: 'visitor-uuid-2', name: 'Sarah Johnson', id_number: 'ID-002' },
  { id: 'visitor-uuid-3', name: 'Emily Davis', id_number: 'ID-003' },
  { id: 'visitor-uuid-4', name: 'Lisa Thompson', id_number: 'ID-004' },
  { id: 'visitor-uuid-5', name: 'Maria Garcia', id_number: 'ID-005' }
];

export default function VisitorPassForm({ pass, onSubmit, onCancel, disabledFields, onAddNewVisitor, visitors }: VisitorPassFormProps) {
  const [formData, setFormData] = useState<Pass>({
    is_active: true,
    is_valid: true,
    visitor_tag_number: '',
    valid_from: '',
    valid_until: '',
    purpose: '',
    issue_date: new Date().toISOString().slice(0, 16),
    is_suspended: false,
    suspended_date: '',
    suspended_reason: '',
    prisoner: '',
    visitor: '',
    suspended_by: '',
    deleted_by: null,
    deleted_datetime: null
  });

  const [prisonerOpen, setPrisonerOpen] = useState(false);
  const [visitorOpen, setVisitorOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visitorList = visitors || mockVisitors;

  useEffect(() => {
    if (pass) {
      setFormData({
        ...pass,
        valid_from: pass.valid_from ? new Date(pass.valid_from).toISOString().slice(0, 16) : '',
        valid_until: pass.valid_until ? new Date(pass.valid_until).toISOString().slice(0, 16) : '',
        issue_date: pass.issue_date ? new Date(pass.issue_date).toISOString().slice(0, 16) : '',
        suspended_date: pass.suspended_date ? new Date(pass.suspended_date).toISOString().slice(0, 16) : ''
      });
    }
  }, [pass]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.prisoner) newErrors.prisoner = 'Prisoner is required';
    if (!formData.visitor) newErrors.visitor = 'Visitor is required';
    if (!formData.visitor_tag_number) newErrors.visitor_tag_number = 'Tag number is required';
    if (!formData.valid_from) newErrors.valid_from = 'Valid from date is required';
    if (!formData.valid_until) newErrors.valid_until = 'Valid until date is required';
    if (!formData.purpose) newErrors.purpose = 'Purpose is required';
    if (!formData.issue_date) newErrors.issue_date = 'Issue date is required';

    if (formData.valid_from && formData.valid_until) {
      if (new Date(formData.valid_from) >= new Date(formData.valid_until)) {
        newErrors.valid_until = 'Valid until must be after valid from';
      }
    }

    if (formData.is_suspended) {
      if (!formData.suspended_date) newErrors.suspended_date = 'Suspended date is required';
      if (!formData.suspended_reason) newErrors.suspended_reason = 'Suspended reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    onSubmit(formData);
  };

  const selectedPrisoner = mockPrisoners.find(p => p.id === formData.prisoner) || 
    (pass?.prisoner_name && formData.prisoner ? { id: formData.prisoner, name: pass.prisoner_name, prisoner_number: '' } : null);
  const selectedVisitor = visitorList.find(v => v.id === formData.visitor) || 
    (pass?.visitor_name && formData.visitor ? { id: formData.visitor, name: pass.visitor_name, id_number: '' } : null);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Prisoner Selection */}
        <div className="space-y-2">
          <Label>
            Prisoner <span className="text-red-500">*</span>
          </Label>
          <Popover open={prisonerOpen} onOpenChange={setPrisonerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={prisonerOpen}
                disabled={disabledFields?.prisoner}
                className={`w-full justify-between ${errors.prisoner ? 'border-red-500' : ''} ${disabledFields?.prisoner ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                {selectedPrisoner
                  ? selectedPrisoner.prisoner_number 
                    ? `${selectedPrisoner.name} (${selectedPrisoner.prisoner_number})`
                    : selectedPrisoner.name
                  : 'Select prisoner...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search prisoner..." />
                <CommandList>
                  <CommandEmpty>No prisoner found.</CommandEmpty>
                  <CommandGroup>
                    {mockPrisoners.map((prisoner) => (
                      <CommandItem
                        key={prisoner.id}
                        value={`${prisoner.name} ${prisoner.prisoner_number}`}
                        onSelect={() => {
                          setFormData({ ...formData, prisoner: prisoner.id });
                          setPrisonerOpen(false);
                          setErrors({ ...errors, prisoner: '' });
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            formData.prisoner === prisoner.id ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        {prisoner.name} ({prisoner.prisoner_number})
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.prisoner && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.prisoner}
            </p>
          )}
        </div>

        {/* Visitor Selection */}
        <div className="space-y-2">
          <Label>
            Visitor <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Popover open={visitorOpen} onOpenChange={setVisitorOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={visitorOpen}
                  disabled={disabledFields?.visitor}
                  className={`flex-1 justify-between ${errors.visitor ? 'border-red-500' : ''} ${disabledFields?.visitor ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  {selectedVisitor
                    ? selectedVisitor.id_number 
                      ? `${selectedVisitor.name} (${selectedVisitor.id_number})`
                      : selectedVisitor.name
                    : 'Select visitor...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search visitor..." />
                  <CommandList>
                    <CommandEmpty>No visitor found.</CommandEmpty>
                    <CommandGroup>
                      {visitorList.map((visitor) => (
                        <CommandItem
                          key={visitor.id}
                          value={`${visitor.name} ${visitor.id_number}`}
                          onSelect={() => {
                            setFormData({ ...formData, visitor: visitor.id });
                            setVisitorOpen(false);
                            setErrors({ ...errors, visitor: '' });
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              formData.visitor === visitor.id ? 'opacity-100' : 'opacity-0'
                            }`}
                          />
                          {visitor.name} ({visitor.id_number})
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {onAddNewVisitor && (
              <Button
                type="button"
                onClick={onAddNewVisitor}
                className="shrink-0 h-10 w-10 p-0 flex items-center justify-center border border-[#650000] hover:opacity-80 transition-opacity"
                style={{ 
                  backgroundColor: '#650000',
                  color: 'white',
                  minWidth: '40px',
                  minHeight: '40px'
                }}
                title="Register New Visitor"
              >
                <Plus className="h-6 w-6" style={{ color: 'white', strokeWidth: 2.5 }} />
              </Button>
            )}
          </div>
          {errors.visitor && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.visitor}
            </p>
          )}
        </div>

        {/* Visitor Tag Number */}
        <div className="space-y-2">
          <Label>
            Visitor Tag Number <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.visitor_tag_number}
            onChange={(e) => {
              setFormData({ ...formData, visitor_tag_number: e.target.value });
              setErrors({ ...errors, visitor_tag_number: '' });
            }}
            placeholder="e.g., VT-2024-001"
            className={errors.visitor_tag_number ? 'border-red-500' : ''}
          />
          {errors.visitor_tag_number && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.visitor_tag_number}
            </p>
          )}
        </div>

        {/* Issue Date */}
        <div className="space-y-2">
          <Label>
            Issue Date <span className="text-red-500">*</span>
          </Label>
          <Input
            type="datetime-local"
            value={formData.issue_date}
            onChange={(e) => {
              setFormData({ ...formData, issue_date: e.target.value });
              setErrors({ ...errors, issue_date: '' });
            }}
            className={errors.issue_date ? 'border-red-500' : ''}
          />
          {errors.issue_date && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.issue_date}
            </p>
          )}
        </div>

        {/* Valid From */}
        <div className="space-y-2">
          <Label>
            Valid From <span className="text-red-500">*</span>
          </Label>
          <Input
            type="datetime-local"
            value={formData.valid_from}
            onChange={(e) => {
              setFormData({ ...formData, valid_from: e.target.value });
              setErrors({ ...errors, valid_from: '' });
            }}
            className={errors.valid_from ? 'border-red-500' : ''}
          />
          {errors.valid_from && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.valid_from}
            </p>
          )}
        </div>

        {/* Valid Until */}
        <div className="space-y-2">
          <Label>
            Valid Until <span className="text-red-500">*</span>
          </Label>
          <Input
            type="datetime-local"
            value={formData.valid_until}
            onChange={(e) => {
              setFormData({ ...formData, valid_until: e.target.value });
              setErrors({ ...errors, valid_until: '' });
            }}
            className={errors.valid_until ? 'border-red-500' : ''}
          />
          {errors.valid_until && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.valid_until}
            </p>
          )}
        </div>

        {/* Purpose */}
        <div className="space-y-2 col-span-2">
          <Label>
            Purpose <span className="text-red-500">*</span>
          </Label>
          <Textarea
            value={formData.purpose}
            onChange={(e) => {
              setFormData({ ...formData, purpose: e.target.value });
              setErrors({ ...errors, purpose: '' });
            }}
            placeholder="Enter purpose of visit..."
            rows={2}
            className={errors.purpose ? 'border-red-500' : ''}
          />
          {errors.purpose && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.purpose}
            </p>
          )}
        </div>
      </div>

      {/* Suspension Section */}
      <Card className="border-2">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Suspend Pass</Label>
                <p className="text-sm text-gray-500">
                  Mark this visitor pass as suspended
                </p>
              </div>
              <Switch
                checked={formData.is_suspended}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_suspended: checked })
                }
              />
            </div>

            {formData.is_suspended && (
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div className="space-y-2 col-span-2">
                  <Label>
                    Suspension Reason <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={formData.suspended_reason}
                    onChange={(e) => {
                      setFormData({ ...formData, suspended_reason: e.target.value });
                      setErrors({ ...errors, suspended_reason: '' });
                    }}
                    placeholder="Enter reason for suspension..."
                    rows={2}
                    className={errors.suspended_reason ? 'border-red-500' : ''}
                  />
                  {errors.suspended_reason && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.suspended_reason}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Suspension Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formData.suspended_date}
                    onChange={(e) => {
                      setFormData({ ...formData, suspended_date: e.target.value });
                      setErrors({ ...errors, suspended_date: '' });
                    }}
                    className={errors.suspended_date ? 'border-red-500' : ''}
                  />
                  {errors.suspended_date && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.suspended_date}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-3 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" style={{ backgroundColor: '#650000' }}>
          {pass ? 'Update Visitor Pass' : 'Create Visitor Pass'}
        </Button>
      </div>
    </form>
  );
}
