import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { toast } from 'sonner@2.0.3';
import { 
  Check, 
  ChevronsUpDown, 
  Upload,
  X,
  User,
  Activity,
  UserCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { cn } from '../ui/utils';

interface AfterCare {
  id?: string;
  prisoner_name?: string;
  prisoner_number?: string;
  activity_name?: string;
  officer_name?: string;
  description: string;
  photo?: string;
  prisoner: string;
  after_care_activity: string;
  officer: number;
}

interface Prisoner {
  id: string;
  full_name: string;
  prisoner_number: string;
}

interface AfterCareActivity {
  id: string;
  name: string;
  description?: string;
}

interface Officer {
  id: number;
  full_name: string;
  rank?: string;
}

interface AfterCareFormProps {
  afterCare?: AfterCare | null;
  mode: 'create' | 'edit' | 'view';
  onSubmit: (data: AfterCare) => void;
  onCancel: () => void;
}

const AfterCareForm: React.FC<AfterCareFormProps> = ({
  afterCare,
  mode,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<AfterCare>({
    description: '',
    prisoner: '',
    after_care_activity: '',
    officer: 0,
    photo: ''
  });

  // Mock data
  const [prisoners] = useState<Prisoner[]>([
    { id: '1', full_name: 'John Doe', prisoner_number: 'PR-2024-001' },
    { id: '2', full_name: 'Jane Smith', prisoner_number: 'PR-2024-002' },
    { id: '3', full_name: 'Michael Johnson', prisoner_number: 'PR-2024-003' },
    { id: '4', full_name: 'Robert Williams', prisoner_number: 'PR-2024-004' },
    { id: '5', full_name: 'Mary Brown', prisoner_number: 'PR-2024-005' }
  ]);

  const [activities] = useState<AfterCareActivity[]>([
    { id: '1', name: 'Job Placement Assistance', description: 'Help with finding employment' },
    { id: '2', name: 'Housing Support', description: 'Assistance with accommodation' },
    { id: '3', name: 'Family Reunification', description: 'Support for family reconnection' },
    { id: '4', name: 'Mental Health Counseling', description: 'Ongoing mental health support' },
    { id: '5', name: 'Skills Training Follow-up', description: 'Continue skills development' },
    { id: '6', name: 'Substance Abuse Support', description: 'Ongoing recovery support' }
  ]);

  const [officers] = useState<Officer[]>([
    { id: 1, full_name: 'Officer Sarah Johnson', rank: 'Senior Officer' },
    { id: 2, full_name: 'Officer David Brown', rank: 'Rehabilitation Officer' },
    { id: 3, full_name: 'Officer Emily Davis', rank: 'Senior Counselor' },
    { id: 4, full_name: 'Officer Michael Wilson', rank: 'Case Manager' },
    { id: 5, full_name: 'Officer Jennifer Martinez', rank: 'Support Coordinator' }
  ]);

  const [openPrisoner, setOpenPrisoner] = useState(false);
  const [openActivity, setOpenActivity] = useState(false);
  const [openOfficer, setOpenOfficer] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  useEffect(() => {
    if (afterCare) {
      setFormData({
        ...afterCare,
        prisoner: afterCare.prisoner || '',
        after_care_activity: afterCare.after_care_activity || '',
        officer: afterCare.officer || 0
      });
      if (afterCare.photo) {
        setPhotoPreview(afterCare.photo);
      }
    }
  }, [afterCare]);

  const handleInputChange = (field: keyof AfterCare, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        handleInputChange('photo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview('');
    handleInputChange('photo', '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.after_care_activity) {
      toast.error('Please select an after care activity');
      return;
    }
    if (!formData.officer) {
      toast.error('Please select a responsible officer');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    onSubmit(formData);
  };

  const isDisabled = mode === 'view';

  const selectedPrisoner = prisoners.find(p => p.id === formData.prisoner);
  const selectedActivity = activities.find(a => a.id === formData.after_care_activity);
  const selectedOfficer = officers.find(o => o.id === formData.officer);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prisoner Selection */}
        <div className="space-y-2">
          <Label htmlFor="prisoner">
            Prisoner <span className="text-red-600">*</span>
          </Label>
          <Popover open={openPrisoner} onOpenChange={setOpenPrisoner}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPrisoner}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedPrisoner ? (
                  <span className="truncate">
                    {selectedPrisoner.full_name} ({selectedPrisoner.prisoner_number})
                  </span>
                ) : (
                  <span className="text-gray-500">Select prisoner...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search prisoner..." />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No prisoner found.</CommandEmpty>
                  <CommandGroup>
                    {prisoners.map((prisoner) => (
                      <CommandItem
                        key={prisoner.id}
                        value={prisoner.id}
                        onSelect={() => {
                          handleInputChange('prisoner', prisoner.id);
                          setOpenPrisoner(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.prisoner === prisoner.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div>{prisoner.full_name}</div>
                          <div className="text-sm text-gray-500">{prisoner.prisoner_number}</div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* After Care Activity Selection */}
        <div className="space-y-2">
          <Label htmlFor="after_care_activity">
            After Care Activity <span className="text-red-600">*</span>
          </Label>
          <Popover open={openActivity} onOpenChange={setOpenActivity}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openActivity}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedActivity ? (
                  <span className="truncate">{selectedActivity.name}</span>
                ) : (
                  <span className="text-gray-500">Select activity...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search activity..." />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No activity found.</CommandEmpty>
                  <CommandGroup>
                    {activities.map((activity) => (
                      <CommandItem
                        key={activity.id}
                        value={activity.id}
                        onSelect={() => {
                          handleInputChange('after_care_activity', activity.id);
                          setOpenActivity(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.after_care_activity === activity.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div>{activity.name}</div>
                          {activity.description && (
                            <div className="text-sm text-gray-500">{activity.description}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Responsible Officer Selection */}
        <div className="space-y-2">
          <Label htmlFor="officer">
            Responsible Officer <span className="text-red-600">*</span>
          </Label>
          <Popover open={openOfficer} onOpenChange={setOpenOfficer}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openOfficer}
                className="w-full justify-between"
                disabled={isDisabled}
              >
                {selectedOfficer ? (
                  <span className="truncate">
                    {selectedOfficer.full_name}
                    {selectedOfficer.rank && ` - ${selectedOfficer.rank}`}
                  </span>
                ) : (
                  <span className="text-gray-500">Select officer...</span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Search officer..." />
                <CommandList className="max-h-[300px] overflow-y-auto">
                  <CommandEmpty>No officer found.</CommandEmpty>
                  <CommandGroup>
                    {officers.map((officer) => (
                      <CommandItem
                        key={officer.id}
                        value={officer.id.toString()}
                        onSelect={() => {
                          handleInputChange('officer', officer.id);
                          setOpenOfficer(false);
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            formData.officer === officer.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div>{officer.full_name}</div>
                          {officer.rank && (
                            <div className="text-sm text-gray-500">{officer.rank}</div>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">
          Description <span className="text-red-600">*</span>
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter detailed description of the after care activity and progress..."
          rows={5}
          disabled={isDisabled}
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label htmlFor="photo">Activity Photo</Label>
        {photoPreview ? (
          <div className="space-y-2">
            <div className="relative w-full h-64 border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={photoPreview}
                alt="Activity preview"
                className="w-full h-full object-contain"
              />
              {!isDisabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG or JPEG (max. 5MB)
              </p>
            </div>
            {!isDisabled && (
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            )}
            {!isDisabled && (
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => document.getElementById('photo')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Form Actions */}
      {mode !== 'view' && (
        <div className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" style={{ backgroundColor: '#650000' }} className="text-white">
            {mode === 'create' ? 'Create After Care Record' : 'Update After Care Record'}
          </Button>
        </div>
      )}

      {mode === 'view' && (
        <div className="flex justify-end pt-4">
          <Button type="button" onClick={onCancel}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
};

export default AfterCareForm;
