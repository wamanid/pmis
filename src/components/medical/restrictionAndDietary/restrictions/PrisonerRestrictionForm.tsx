import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { ShieldAlert, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { format } from 'date-fns';

interface PrisonerRestriction {
  id?: string;
  prisoner_name?: string;
  reason_name?: string;
  station_name?: string;
  state_of_prisoner: string;
  start_date: string;
  end_date: string;
  prisoner: string;
  reason: string;
  place_of_medical_attention: string;
}

interface PrisonerRestrictionFormProps {
  restriction?: PrisonerRestriction | null;
  onSubmit: (restriction: PrisonerRestriction) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const PrisonerRestrictionForm: React.FC<PrisonerRestrictionFormProps> = ({ restriction, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<PrisonerRestriction>({
    state_of_prisoner: '',
    start_date: '',
    end_date: '',
    prisoner: '',
    reason: '',
    place_of_medical_attention: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [restrictionReasons, setRestrictionReasons] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
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
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setRestrictionReasons([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', name: 'Medical Condition', code: 'MED-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', name: 'Security Risk', code: 'SEC-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', name: 'Behavioral Issues', code: 'BEH-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', name: 'Injury Recovery', code: 'INJ-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', name: 'Mental Health', code: 'MH-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb6', name: 'Infectious Disease', code: 'INF-001' },
    ]);

    setStations([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc1', name: 'Central Prison Hospital', code: 'CPH-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc2', name: 'East Wing Medical Center', code: 'EWMC-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc3', name: 'West Block Infirmary', code: 'WBI-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc4', name: 'North Facility Clinic', code: 'NFC-001' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc5', name: 'South Station Medical Unit', code: 'SSMU-001' },
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
    if (!formData.state_of_prisoner) {
      toast.error('Please enter state of prisoner');
      return;
    }
    if (!formData.reason) {
      toast.error('Please select a restriction reason');
      return;
    }
    if (!formData.start_date) {
      toast.error('Please select a start date');
      return;
    }
    if (!formData.place_of_medical_attention) {
      toast.error('Please select place of medical attention');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedReason = restrictionReasons.find((r) => r.id === formData.reason);
      const selectedStation = stations.find((s) => s.id === formData.place_of_medical_attention);

      const submitData: PrisonerRestriction = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        reason_name: selectedReason?.name || '',
        station_name: selectedStation?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Restriction created successfully');
        setFormData({
          state_of_prisoner: '',
          start_date: '',
          end_date: '',
          prisoner: '',
          reason: '',
          place_of_medical_attention: '',
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
      case 'reason':
        const reason = restrictionReasons.find(r => r.id === id);
        return reason ? `${reason.name} (${reason.code})` : id;
      case 'place_of_medical_attention':
        const station = stations.find(s => s.id === id);
        return station ? `${station.name} (${station.code})` : id;
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
                <Label htmlFor="state_of_prisoner">
                  State of Prisoner <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.state_of_prisoner || 'N/A'}
                  </div>
                ) : (
                  <Input
                    id="state_of_prisoner"
                    value={formData.state_of_prisoner}
                    onChange={(e) => handleInputChange('state_of_prisoner', e.target.value)}
                    placeholder="Enter state of prisoner"
                  />
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
                <Label htmlFor="reason">
                  Restriction Reason <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('reason', formData.reason)}
                  </div>
                ) : (
                  <Select
                    value={formData.reason}
                    onValueChange={(value) => handleInputChange('reason', value)}
                  >
                    <SelectTrigger id="reason">
                      <SelectValue placeholder="Select restriction reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {restrictionReasons.map((reason) => (
                        <SelectItem key={reason.id} value={reason.id}>
                          {reason.name} ({reason.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="place_of_medical_attention">
                  Place of Medical Attention <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('place_of_medical_attention', formData.place_of_medical_attention)}
                  </div>
                ) : (
                  <Select
                    value={formData.place_of_medical_attention}
                    onValueChange={(value) => handleInputChange('place_of_medical_attention', value)}
                  >
                    <SelectTrigger id="place_of_medical_attention">
                      <SelectValue placeholder="Select place of medical attention" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station.id} value={station.id}>
                          {station.name} ({station.code})
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
