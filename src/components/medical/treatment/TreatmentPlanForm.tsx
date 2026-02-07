import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Calendar } from '../../ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../ui/popover';
import { Switch } from '../../ui/switch';
import { Plus, X, Save, Calendar as CalendarIcon, Pill } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../ui/utils';
import {
  TreatmentPlan,
  TreatmentMedication,
  MEDICATION_TYPES,
  QUANTITY_UNITS,
  DOSAGE_FREQUENCIES,
  DOSAGE_TIMING,
  DURATION_UNITS,
} from './TreatmentPlan.types';
import { mockCaseBooks, mockMedications } from './TreatmentPlan.mock';

interface TreatmentPlanFormProps {
  treatmentPlan?: TreatmentPlan;
  onSubmit: (plan: TreatmentPlan) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const TreatmentPlanForm: React.FC<TreatmentPlanFormProps> = ({
  treatmentPlan,
  onSubmit,
  onCancel,
  mode,
}) => {
  const isReadOnly = mode === 'view';

  const [formData, setFormData] = useState<TreatmentPlan>(
    treatmentPlan || {
      id: '',
      case_book_id: '',
      prescribed_by: 'staff-001',
      prescribed_by_name: 'Dr. Sarah Mukasa',
      date_prescribed: new Date().toISOString().split('T')[0],
      treatment_status: 'Active',
      general_notes: '',
      medications: [],
    }
  );

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Current medication being entered (before adding to list)
  const [currentMedication, setCurrentMedication] = useState<TreatmentMedication>({
    id: '',
    medication_name: '',
    medication_type: 'Tablet',
    is_quantifiable: true,
    quantity: undefined,
    quantity_unit: 'tablets',
    dosage_quantity: '',
    dosage_frequency: '1x daily',
    dosage_duration: undefined,
    dosage_duration_unit: 'days',
    dosage_timing: 'After food',
    additional_instructions: '',
  });

  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);

  // Add medication to list
  const handleAddMedication = () => {
    // Validate required fields
    if (!currentMedication.medication_name.trim()) {
      alert('Please enter medication name');
      return;
    }
    if (currentMedication.is_quantifiable && !currentMedication.quantity) {
      alert('Please enter quantity');
      return;
    }
    if (!currentMedication.dosage_quantity.trim()) {
      alert('Please enter dosage quantity');
      return;
    }

    if (editingMedicationId) {
      // Update existing medication
      setFormData({
        ...formData,
        medications: formData.medications.map((med) =>
          med.id === editingMedicationId ? { ...currentMedication, id: editingMedicationId } : med
        ),
      });
      setEditingMedicationId(null);
    } else {
      // Add new medication
      const newMedication = {
        ...currentMedication,
        id: `med-${Date.now()}`,
      };
      setFormData({
        ...formData,
        medications: [...formData.medications, newMedication],
      });
    }

    // Reset form for next entry
    setCurrentMedication({
      id: '',
      medication_name: '',
      medication_type: 'Tablet',
      is_quantifiable: true,
      quantity: undefined,
      quantity_unit: 'tablets',
      dosage_quantity: '',
      dosage_frequency: '1x daily',
      dosage_duration: undefined,
      dosage_duration_unit: 'days',
      dosage_timing: 'After food',
      additional_instructions: '',
    });
  };

  // Remove medication
  const handleRemoveMedication = (id: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((med) => med.id !== id),
    });
    // If currently editing this medication, clear the form
    if (editingMedicationId === id) {
      setEditingMedicationId(null);
      setCurrentMedication({
        id: '',
        medication_name: '',
        medication_type: 'Tablet',
        is_quantifiable: true,
        quantity: undefined,
        quantity_unit: 'tablets',
        dosage_quantity: '',
        dosage_frequency: '1x daily',
        dosage_duration: undefined,
        dosage_duration_unit: 'days',
        dosage_timing: 'After food',
        additional_instructions: '',
      });
    }
  };

  // Edit medication - load into form
  const handleEditMedication = (med: TreatmentMedication) => {
    setCurrentMedication(med);
    setEditingMedicationId(med.id);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingMedicationId(null);
    setCurrentMedication({
      id: '',
      medication_name: '',
      medication_type: 'Tablet',
      is_quantifiable: true,
      quantity: undefined,
      quantity_unit: 'tablets',
      dosage_quantity: '',
      dosage_frequency: '1x daily',
      dosage_duration: undefined,
      dosage_duration_unit: 'days',
      dosage_timing: 'After food',
      additional_instructions: '',
    });
  };

  // Update medication field
  const handleMedicationFieldChange = (
    field: keyof TreatmentMedication,
    value: any
  ) => {
    setCurrentMedication({
      ...currentMedication,
      [field]: value,
    });
  };

  // Format dosage display
  const formatDosageDisplay = (med: TreatmentMedication): string => {
    const parts = [];
    if (med.dosage_quantity) parts.push(med.dosage_quantity);
    if (med.dosage_frequency) parts.push(med.dosage_frequency);
    if (med.dosage_duration && med.dosage_duration_unit) {
      parts.push(`for ${med.dosage_duration} ${med.dosage_duration_unit}`);
    } else if (med.dosage_duration_unit && !med.dosage_duration) {
      parts.push(med.dosage_duration_unit);
    }
    if (med.dosage_timing && med.dosage_timing !== 'Not applicable') {
      parts.push(`(${med.dosage_timing.toLowerCase()})`);
    }
    return parts.join(', ') || 'Not specified';
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Handle case book selection
  const handleCaseBookChange = (caseBookId: string) => {
    const selectedCase = mockCaseBooks.find((cb) => cb.id === caseBookId);
    if (selectedCase) {
      setFormData({
        ...formData,
        case_book_id: caseBookId,
        case_book_reference: selectedCase.reference,
        prisoner_number: selectedCase.prisoner_number,
        prisoner_name: selectedCase.prisoner_name,
        diagnosis_name: selectedCase.diagnosis,
      });
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Pill className="h-5 w-5" />
          {mode === 'create' && 'New Treatment Plan'}
          {mode === 'edit' && 'Edit Treatment Plan'}
          {mode === 'view' && 'View Treatment Plan'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Case Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Case Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  Medical Case Book <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.case_book_reference || 'N/A'} -{' '}
                    {formData.prisoner_name} ({formData.prisoner_number})
                  </div>
                ) : (
                  <Select
                    value={formData.case_book_id}
                    onValueChange={handleCaseBookChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case book..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCaseBooks.map((cb) => (
                        <SelectItem key={cb.id} value={cb.id}>
                          {cb.reference} - {cb.prisoner_name} ({cb.prisoner_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label>Diagnosis</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {formData.diagnosis_name || 'Auto-filled from case'}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Prescribed By</Label>
                <div className="p-2 bg-gray-50 rounded border">
                  {formData.prescribed_by_name}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date Prescribed</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {format(new Date(formData.date_prescribed), 'PPP')}
                  </div>
                ) : (
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.date_prescribed && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date_prescribed
                          ? format(new Date(formData.date_prescribed), 'PPP')
                          : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          formData.date_prescribed
                            ? new Date(formData.date_prescribed)
                            : undefined
                        }
                        onSelect={(date) => {
                          if (date) {
                            setFormData({
                              ...formData,
                              date_prescribed: date.toISOString().split('T')[0],
                            });
                            setDatePickerOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label>Treatment Status</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.treatment_status}
                  </div>
                ) : (
                  <Select
                    value={formData.treatment_status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, treatment_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Medications Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              {isReadOnly ? 'Medications' : 'Add Medications'}
            </h3>

            {!isReadOnly && (
              <Card className="border-2 border-dashed" style={{ borderColor: '#650000' }}>
                <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="font-semibold">Medication {index + 1}</h4>
                        {!isReadOnly && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMedication(med.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Medication Name */}
                        <div className="space-y-2 md:col-span-2">
                          <Label>
                            Medication Name <span className="text-red-500">*</span>
                          </Label>
                          {isReadOnly ? (
                            <div className="p-2 bg-gray-50 rounded border">
                              {med.medication_name || 'N/A'}
                            </div>
                          ) : (
                            <Input
                              value={med.medication_name}
                              onChange={(e) =>
                                handleMedicationChange(
                                  med.id,
                                  'medication_name',
                                  e.target.value
                                )
                              }
                              placeholder="Enter or select medication name"
                              list={`medications-${med.id}`}
                            />
                          )}
                          <datalist id={`medications-${med.id}`}>
                            {mockMedications.map((medication) => (
                              <option key={medication} value={medication} />
                            ))}
                          </datalist>
                        </div>

                        {/* Medication Type */}
                        <div className="space-y-2">
                          <Label>
                            Type <span className="text-red-500">*</span>
                          </Label>
                          {isReadOnly ? (
                            <div className="p-2 bg-gray-50 rounded border">
                              {med.medication_type}
                            </div>
                          ) : (
                            <Select
                              value={med.medication_type}
                              onValueChange={(value: any) =>
                                handleMedicationChange(med.id, 'medication_type', value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {MEDICATION_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>

                        {/* Quantifiable Toggle */}
                        <div className="space-y-2 flex items-center gap-2 pt-8">
                          {!isReadOnly && (
                            <>
                              <Switch
                                checked={med.is_quantifiable}
                                onCheckedChange={(checked) =>
                                  handleMedicationChange(med.id, 'is_quantifiable', checked)
                                }
                              />
                              <Label>Quantifiable Medication</Label>
                            </>
                          )}
                          {isReadOnly && med.is_quantifiable && (
                            <span className="text-sm text-muted-foreground">
                              Quantifiable
                            </span>
                          )}
                        </div>

                        {/* Quantity & Unit (if quantifiable) */}
                        {med.is_quantifiable && (
                          <>
                            <div className="space-y-2">
                              <Label>
                                Quantity <span className="text-red-500">*</span>
                              </Label>
                              {isReadOnly ? (
                                <div className="p-2 bg-gray-50 rounded border">
                                  {med.quantity || 'N/A'}
                                </div>
                              ) : (
                                <Input
                                  type="number"
                                  value={med.quantity || ''}
                                  onChange={(e) =>
                                    handleMedicationChange(
                                      med.id,
                                      'quantity',
                                      parseFloat(e.target.value)
                                    )
                                  }
                                  placeholder="Enter quantity"
                                />
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label>
                                Unit <span className="text-red-500">*</span>
                              </Label>
                              {isReadOnly ? (
                                <div className="p-2 bg-gray-50 rounded border">
                                  {med.quantity_unit || 'N/A'}
                                </div>
                              ) : (
                                <Select
                                  value={med.quantity_unit}
                                  onValueChange={(value) =>
                                    handleMedicationChange(med.id, 'quantity_unit', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {QUANTITY_UNITS.map((unit) => (
                                      <SelectItem key={unit} value={unit}>
                                        {unit}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </>
                        )}

                        {/* Dosage Instructions Header */}
                        <div className="md:col-span-2 mt-4">
                          <h5 className="font-medium text-sm mb-3">Dosage Instructions</h5>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Dosage Quantity */}
                            <div className="space-y-2">
                              <Label>Quantity</Label>
                              {isReadOnly ? (
                                <div className="p-2 bg-gray-50 rounded border text-sm">
                                  {med.dosage_quantity || 'N/A'}
                                </div>
                              ) : (
                                <Input
                                  value={med.dosage_quantity}
                                  onChange={(e) =>
                                    handleMedicationChange(
                                      med.id,
                                      'dosage_quantity',
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g., 2"
                                />
                              )}
                            </div>

                            {/* Frequency */}
                            <div className="space-y-2">
                              <Label>Frequency</Label>
                              {isReadOnly ? (
                                <div className="p-2 bg-gray-50 rounded border text-sm">
                                  {med.dosage_frequency}
                                </div>
                              ) : (
                                <Select
                                  value={med.dosage_frequency}
                                  onValueChange={(value) =>
                                    handleMedicationChange(med.id, 'dosage_frequency', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DOSAGE_FREQUENCIES.map((freq) => (
                                      <SelectItem key={freq} value={freq}>
                                        {freq}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                              <Label>Duration</Label>
                              <div className="flex gap-2">
                                {isReadOnly ? (
                                  <div className="p-2 bg-gray-50 rounded border text-sm flex-1">
                                    {med.dosage_duration
                                      ? `${med.dosage_duration} ${med.dosage_duration_unit || ''}`
                                      : med.dosage_duration_unit || 'N/A'}
                                  </div>
                                ) : (
                                  <>
                                    <Input
                                      type="number"
                                      value={med.dosage_duration || ''}
                                      onChange={(e) =>
                                        handleMedicationChange(
                                          med.id,
                                          'dosage_duration',
                                          e.target.value ? parseInt(e.target.value) : undefined
                                        )
                                      }
                                      placeholder="#"
                                      className="w-20"
                                    />
                                    <Select
                                      value={med.dosage_duration_unit}
                                      onValueChange={(value) =>
                                        handleMedicationChange(
                                          med.id,
                                          'dosage_duration_unit',
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="flex-1">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {DURATION_UNITS.map((unit) => (
                                          <SelectItem key={unit} value={unit}>
                                            {unit}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Timing */}
                            <div className="space-y-2">
                              <Label>Timing</Label>
                              {isReadOnly ? (
                                <div className="p-2 bg-gray-50 rounded border text-sm">
                                  {med.dosage_timing || 'N/A'}
                                </div>
                              ) : (
                                <Select
                                  value={med.dosage_timing}
                                  onValueChange={(value) =>
                                    handleMedicationChange(med.id, 'dosage_timing', value)
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DOSAGE_TIMING.map((timing) => (
                                      <SelectItem key={timing} value={timing}>
                                        {timing}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>

                          {/* Display Preview */}
                          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm">
                              <span className="font-medium">Display Preview: </span>
                              <span className="text-blue-900">
                                {formatDosageDisplay(med)}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Additional Instructions */}
                        <div className="space-y-2 md:col-span-2 mt-2">
                          <Label>Additional Instructions</Label>
                          {isReadOnly ? (
                            <div className="p-2 bg-gray-50 rounded border min-h-[60px]">
                              {med.additional_instructions || 'None'}
                            </div>
                          ) : (
                            <Textarea
                              value={med.additional_instructions}
                              onChange={(e) =>
                                handleMedicationChange(
                                  med.id,
                                  'additional_instructions',
                                  e.target.value
                                )
                              }
                              placeholder="Enter any additional instructions..."
                              rows={2}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* General Treatment Notes */}
          <div className="space-y-2">
            <Label>General Treatment Notes</Label>
            {isReadOnly ? (
              <div className="p-2 bg-gray-50 rounded border min-h-[80px]">
                {formData.general_notes || 'None'}
              </div>
            ) : (
              <Textarea
                value={formData.general_notes}
                onChange={(e) =>
                  setFormData({ ...formData, general_notes: e.target.value })
                }
                placeholder="Enter general notes about the treatment plan..."
                rows={3}
              />
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button
                type="submit"
                style={{ backgroundColor: '#650000' }}
                className="text-white hover:opacity-90"
              >
                <Save className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Treatment Plan' : 'Update Treatment Plan'}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TreatmentPlanForm;
