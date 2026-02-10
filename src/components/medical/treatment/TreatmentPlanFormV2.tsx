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
import { Plus, X, Save, Calendar as CalendarIcon, Pill, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../ui/utils';
import {
  TreatmentPlan,
  TreatmentMedication,
  MEDICATION_FORMS,
  DISPENSING_UNITS,
  DISPENSING_UNIT_LABELS,
  QUANTITY_UNITS,
  DOSAGE_FREQUENCIES,
  DOSAGE_TIMING,
  DURATION_UNITS,
} from './TreatmentPlan.types';
import { mockCaseBooks, mockMedications } from './TreatmentPlan.mock';

interface TreatmentPlanFormV2Props {
  treatmentPlan?: TreatmentPlan;
  onSubmit: (plan: TreatmentPlan) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const TreatmentPlanFormV2: React.FC<TreatmentPlanFormV2Props> = ({
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

  // Current medication being entered
  const [currentMed, setCurrentMed] = useState<TreatmentMedication>({
    id: '',
    medication_name: '',
    medication_form: 'Tablet',
    is_quantifiable: true,
    quantity_dispensed: undefined,
    dispensing_unit: 'Individual',
    dosage_quantity: '',
    dosage_frequency: '1x daily',
    dosage_duration: undefined,
    dosage_duration_unit: 'days',
    dosage_timing: 'After food',
    additional_instructions: '',
  });

  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Reset medication form
  const resetMedicationForm = () => {
    setCurrentMed({
      id: '',
      medication_name: '',
      medication_form: 'Tablet',
      is_quantifiable: true,
      quantity_dispensed: undefined,
      dispensing_unit: 'Individual',
      dosage_quantity: '',
      dosage_frequency: '1x daily',
      dosage_duration: undefined,
      dosage_duration_unit: 'days',
      dosage_timing: 'After food',
      additional_instructions: '',
    });
    setEditingMedId(null);
  };

  // Add or update medication
  const handleAddToList = () => {
    // Validation
    if (!currentMed.medication_name.trim()) {
      alert('Please enter medication name');
      return;
    }
    if (currentMed.is_quantifiable && !currentMed.quantity_dispensed) {
      alert('Please enter quantity for quantifiable medication');
      return;
    }
    if (!currentMed.dosage_quantity.trim()) {
      alert('Please enter dosage quantity');
      return;
    }

    if (editingMedId) {
      // Update existing
      setFormData({
        ...formData,
        medications: formData.medications.map((m) =>
          m.id === editingMedId ? { ...currentMed, id: editingMedId } : m
        ),
      });
    } else {
      // Add new
      const newMed = { ...currentMed, id: `med-${Date.now()}` };
      setFormData({
        ...formData,
        medications: [...formData.medications, newMed],
      });
    }

    resetMedicationForm();
  };

  // Edit medication from table
  const handleEditFromTable = (med: TreatmentMedication) => {
    setCurrentMed(med);
    setEditingMedId(med.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Remove medication from table
  const handleRemoveFromTable = (id: string) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((m) => m.id !== id),
    });
    if (editingMedId === id) {
      resetMedicationForm();
    }
  };

  // Format dosage display
  const formatDosage = (med: TreatmentMedication): string => {
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

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.case_book_id) {
      alert('Please select a case book');
      return;
    }
    
    if (formData.medications.length === 0) {
      alert('Please add at least one medication');
      return;
    }
    
    onSubmit(formData);
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
                    {formData.case_book_reference || 'N/A'} - {formData.prisoner_name} ({formData.prisoner_number})
                  </div>
                ) : (
                  <Select value={formData.case_book_id} onValueChange={handleCaseBookChange}>
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
                        onSelect={(date: Date | undefined) => {
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

            {/* Medication Entry Form (only in create/edit mode) */}
            {!isReadOnly && (
              <Card className="border-2" style={{ borderColor: '#650000' }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">
                      {editingMedId ? 'Edit Medication' : 'Enter Medication Details'}
                    </h4>
                    {editingMedId && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetMedicationForm}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Medication Name */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>
                        Medication Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        value={currentMed.medication_name}
                        onChange={(e) =>
                          setCurrentMed({ ...currentMed, medication_name: e.target.value })
                        }
                        placeholder="Enter or select medication name"
                        list="medications-datalist"
                      />
                      <datalist id="medications-datalist">
                        {mockMedications.map((med) => (
                          <option key={med} value={med} />
                        ))}
                      </datalist>
                    </div>

                    {/* Form & Quantifiable */}
                    <div className="space-y-2">
                      <Label>
                        Form <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={currentMed.medication_form}
                        onValueChange={(value: any) => {
                          const firstUnit = DISPENSING_UNITS[value]?.[0];
                          setCurrentMed({ 
                            ...currentMed, 
                            medication_form: value,
                            // Reset dispensing unit to first option when form changes
                            dispensing_unit: firstUnit as any
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MEDICATION_FORMS.map((form) => (
                            <SelectItem key={form} value={form}>
                              {form}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 flex items-center gap-2 pt-8">
                      <Switch
                        checked={currentMed.is_quantifiable}
                        onCheckedChange={(checked: boolean) =>
                          setCurrentMed({ ...currentMed, is_quantifiable: checked })
                        }
                      />
                      <Label>Quantifiable</Label>
                    </div>

                    {/* Quantity Dispensed & Dispensing Unit */}
                    {currentMed.is_quantifiable && (
                      <>
                        <div className="space-y-2">
                          <Label>
                            Quantity Dispensed <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            value={currentMed.quantity_dispensed || ''}
                            onChange={(e) =>
                              setCurrentMed({
                                ...currentMed,
                                quantity_dispensed: parseFloat(e.target.value),
                              })
                            }
                            placeholder="Enter quantity"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>
                            Dispensing Unit <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={currentMed.dispensing_unit}
                            onValueChange={(value: any) =>
                              setCurrentMed({ ...currentMed, dispensing_unit: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(DISPENSING_UNITS[currentMed.medication_form] || ['Individual']).map((unit) => (
                                <SelectItem key={unit} value={unit}>
                                  {DISPENSING_UNIT_LABELS[unit] || unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {/* Dosage Instructions */}
                    <div className="md:col-span-2 space-y-3">
                      <h5 className="font-medium text-sm">Dosage Instructions</h5>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <Input
                            value={currentMed.dosage_quantity}
                            onChange={(e) =>
                              setCurrentMed({
                                ...currentMed,
                                dosage_quantity: e.target.value,
                              })
                            }
                            placeholder="e.g., 2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <Select
                            value={currentMed.dosage_frequency}
                            onValueChange={(value: string) =>
                              setCurrentMed({ ...currentMed, dosage_frequency: value })
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
                        </div>

                        <div className="space-y-2">
                          <Label>Duration</Label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={currentMed.dosage_duration || ''}
                              onChange={(e) =>
                                setCurrentMed({
                                  ...currentMed,
                                  dosage_duration: e.target.value
                                    ? parseInt(e.target.value)
                                    : undefined,
                                })
                              }
                              placeholder="#"
                              className="w-20"
                            />
                            <Select
                              value={currentMed.dosage_duration_unit}
                              onValueChange={(value: string) =>
                                setCurrentMed({
                                  ...currentMed,
                                  dosage_duration_unit: value,
                                })
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
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Timing</Label>
                          <Select
                            value={currentMed.dosage_timing}
                            onValueChange={(value: string) =>
                              setCurrentMed({ ...currentMed, dosage_timing: value })
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
                        </div>
                      </div>

                      {/* Display Preview */}
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm">
                          <span className="font-medium">Preview: </span>
                          <span className="text-blue-900">{formatDosage(currentMed)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Additional Instructions */}
                    <div className="space-y-2 md:col-span-2">
                      <Label>Additional Instructions</Label>
                      <Textarea
                        value={currentMed.additional_instructions}
                        onChange={(e) =>
                          setCurrentMed({
                            ...currentMed,
                            additional_instructions: e.target.value,
                          })
                        }
                        placeholder="Enter any additional instructions..."
                        rows={2}
                      />
                    </div>

                    {/* Add to List Button */}
                    <div className="md:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        onClick={handleAddToList}
                        style={{ backgroundColor: '#650000' }}
                        className="text-white"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {editingMedId ? 'Update in List' : 'Add to List'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medications Table */}
            {formData.medications.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b px-4 py-2 flex items-center justify-between">
                  <h4 className="font-semibold">
                    Medications Added ({formData.medications.length})
                  </h4>
                </div>
                <div className="p-4">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">#</th>
                        <th className="text-left p-3 text-sm font-semibold">Medication</th>
                        <th className="text-left p-3 text-sm font-semibold">Form</th>
                        <th className="text-left p-3 text-sm font-semibold">Dispensed</th>
                        <th className="text-left p-3 text-sm font-semibold">Dosage</th>
                        <th className="text-left p-3 text-sm font-semibold">Instructions</th>
                        {!isReadOnly && (
                          <th className="text-left p-3 text-sm font-semibold">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {formData.medications.map((med, idx) => (
                        <tr key={med.id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm text-muted-foreground">{idx + 1}</td>
                          <td className="p-3">
                            <div className="font-medium">{med.medication_name}</div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {med.medication_form}
                          </td>
                          <td className="p-3 text-sm">
                            {med.is_quantifiable && med.quantity_dispensed
                              ? `${med.quantity_dispensed} ${med.dispensing_unit || ''}`
                              : '—'}
                          </td>
                          <td className="p-3 text-sm">
                            <div>{formatDosage(med)}</div>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground max-w-xs truncate">
                            {med.additional_instructions || '—'}
                          </td>
                          {!isReadOnly && (
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditFromTable(med)}
                                  className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFromTable(med.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">
                  No medications added yet.{' '}
                  {!isReadOnly && 'Fill the form above and click "Add to List".'}
                </p>
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

export default TreatmentPlanFormV2;
