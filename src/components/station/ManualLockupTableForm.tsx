import { useState } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { toast } from 'sonner@2.0.3';

const mockLockupTypes = [
  { id: '660e8400-e29b-41d4-a716-446655440001', name: 'Morning Lockup' },
  { id: '660e8400-e29b-41d4-a716-446655440002', name: 'Midday' },
  { id: '660e8400-e29b-41d4-a716-446655440003', name: 'Evening Lockup' },
];

const mockStations = [
  { id: '550e8400-e29b-41d4-a716-446655440001', name: 'Central Station' },
  { id: '550e8400-e29b-41d4-a716-446655440002', name: 'East Wing Station' },
  { id: '550e8400-e29b-41d4-a716-446655440003', name: 'West Wing Station' },
];

// Category and sex mappings
const categoryMap: Record<string, string> = {
  'convict': '770e8400-e29b-41d4-a716-446655440001',
  'remand': '770e8400-e29b-41d4-a716-446655440002',
  'debtor': '770e8400-e29b-41d4-a716-446655440003',
  'lodger': '770e8400-e29b-41d4-a716-446655440004', // Using Awaiting Trial ID
};

const sexMap: Record<string, string> = {
  'male': '880e8400-e29b-41d4-a716-446655440001',
  'female': '880e8400-e29b-41d4-a716-446655440002',
};

interface ManualLockup {
  id: string;
  is_active: boolean;
  date: string;
  lockup_time: string;
  location: 'court' | 'labour' | 'station';
  count: number;
  station: string;
  type: string;
  prisoner_category: string;
  sex: string;
}

interface LockupCounts {
  station: {
    convict_male: string;
    convict_female: string;
    remand_male: string;
    remand_female: string;
    debtor_male: string;
    debtor_female: string;
    lodger_male: string;
    lodger_female: string;
  };
  court: {
    convict_male: string;
    convict_female: string;
    remand_male: string;
    remand_female: string;
    debtor_male: string;
    debtor_female: string;
    lodger_male: string;
    lodger_female: string;
  };
  labour: {
    convict_male: string;
    convict_female: string;
    remand_male: string;
    remand_female: string;
    debtor_male: string;
    debtor_female: string;
    lodger_male: string;
    lodger_female: string;
  };
}

interface ManualLockupTableFormProps {
  onRecordsCreated?: (records: ManualLockup[]) => void;
  selectedStation?: string;
}

export function ManualLockupTableForm({ onRecordsCreated, selectedStation }: ManualLockupTableFormProps) {
  const [lockupType, setLockupType] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [station, setStation] = useState(selectedStation || '');
  const [loading, setLoading] = useState(false);

  const [counts, setCounts] = useState<LockupCounts>({
    station: {
      convict_male: '',
      convict_female: '',
      remand_male: '',
      remand_female: '',
      debtor_male: '',
      debtor_female: '',
      lodger_male: '',
      lodger_female: '',
    },
    court: {
      convict_male: '',
      convict_female: '',
      remand_male: '',
      remand_female: '',
      debtor_male: '',
      debtor_female: '',
      lodger_male: '',
      lodger_female: '',
    },
    labour: {
      convict_male: '',
      convict_female: '',
      remand_male: '',
      remand_female: '',
      debtor_male: '',
      debtor_female: '',
      lodger_male: '',
      lodger_female: '',
    },
  });

  const handleCountChange = (location: keyof LockupCounts, field: string, value: string) => {
    setCounts({
      ...counts,
      [location]: {
        ...counts[location],
        [field]: value,
      },
    });
  };

  // Calculate how many records will be created
  const calculateRecordCount = () => {
    let count = 0;
    const locations: Array<keyof LockupCounts> = ['station', 'court', 'labour'];
    const categories = ['convict', 'remand', 'debtor', 'lodger'];
    const sexes = ['male', 'female'];

    locations.forEach((location) => {
      categories.forEach((category) => {
        sexes.forEach((sex) => {
          const fieldName = `${category}_${sex}` as keyof typeof counts[typeof location];
          const value = counts[location][fieldName];
          const cellCount = value ? parseInt(value) : 0;
          if (cellCount > 0) {
            count++;
          }
        });
      });
    });

    return count;
  };

  const handleSave = async () => {
    // Validation
    if (!lockupType || !date || !time) {
      toast.error('Please fill in Lockup Type, Date, and Time');
      return;
    }

    if (!station) {
      toast.error('Please select a Station');
      return;
    }

    setLoading(true);

    try {
      // Build individual records for each non-empty/non-zero cell
      const records: ManualLockup[] = [];
      let recordCount = 0;

      // Process each location
      const locations: Array<keyof LockupCounts> = ['station', 'court', 'labour'];
      const categories = ['convict', 'remand', 'debtor', 'lodger'];
      const sexes = ['male', 'female'];

      locations.forEach((location) => {
        categories.forEach((category) => {
          sexes.forEach((sex) => {
            const fieldName = `${category}_${sex}` as keyof typeof counts[typeof location];
            const value = counts[location][fieldName];
            const count = value ? parseInt(value) : 0;

            if (count > 0) {
              records.push({
                id: `${Date.now()}-${recordCount++}`,
                is_active: true,
                date,
                lockup_time: time,
                location: location as 'court' | 'labour' | 'station',
                count,
                station,
                type: lockupType,
                prisoner_category: categoryMap[category],
                sex: sexMap[sex],
              });
            }
          });
        });
      });

      if (records.length === 0) {
        toast.error('Please enter at least one count');
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the parent callback with the created records
      if (onRecordsCreated) {
        onRecordsCreated(records);
      }

      toast.success(`Successfully created ${records.length} lockup record${records.length > 1 ? 's' : ''}`);
      
      // Reset form
      setCounts({
        station: {
          convict_male: '',
          convict_female: '',
          remand_male: '',
          remand_female: '',
          debtor_male: '',
          debtor_female: '',
          lodger_male: '',
          lodger_female: '',
        },
        court: {
          convict_male: '',
          convict_female: '',
          remand_male: '',
          remand_female: '',
          debtor_male: '',
          debtor_female: '',
          lodger_male: '',
          lodger_female: '',
        },
        labour: {
          convict_male: '',
          convict_female: '',
          remand_male: '',
          remand_female: '',
          debtor_male: '',
          debtor_female: '',
          lodger_male: '',
          lodger_female: '',
        },
      });
    } catch (error) {
      toast.error('Failed to save lockup records');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-4 rounded-lg border">
        <div className="space-y-2">
          <Label htmlFor="station">
            Station <span className="text-red-500">*</span>
          </Label>
          <Select value={station} onValueChange={setStation}>
            <SelectTrigger id="station">
              <SelectValue placeholder="Select station" />
            </SelectTrigger>
            <SelectContent>
              {mockStations.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lockup_type">
            Lockup Type <span className="text-red-500">*</span>
          </Label>
          <Select value={lockupType} onValueChange={setLockupType}>
            <SelectTrigger id="lockup_type">
              <SelectValue placeholder="Select lockup type" />
            </SelectTrigger>
            <SelectContent>
              {mockLockupTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">
            Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">
            Time <span className="text-red-500">*</span>
          </Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>
      </div>

      {/* Lockup Count Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="border-r p-3 text-left min-w-[120px]">Location</th>
              <th className="border-r p-3 text-center" colSpan={2}>Convict</th>
              <th className="border-r p-3 text-center" colSpan={2}>Remand</th>
              <th className="border-r p-3 text-center" colSpan={2}>Debtor</th>
              <th className="p-3 text-center" colSpan={2}>Lodger</th>
            </tr>
            <tr className="border-b bg-muted/30">
              <th className="border-r p-2"></th>
              <th className="border-r p-2 text-center text-sm">Male</th>
              <th className="border-r p-2 text-center text-sm">Female</th>
              <th className="border-r p-2 text-center text-sm">Male</th>
              <th className="border-r p-2 text-center text-sm">Female</th>
              <th className="border-r p-2 text-center text-sm">Male</th>
              <th className="border-r p-2 text-center text-sm">Female</th>
              <th className="border-r p-2 text-center text-sm">Male</th>
              <th className="p-2 text-center text-sm">Female</th>
            </tr>
          </thead>
          <tbody>
            {/* Station Row */}
            <tr className="border-b hover:bg-muted/20">
              <td className="border-r p-3">Station</td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.convict_male}
                  onChange={(e) => handleCountChange('station', 'convict_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.convict_female}
                  onChange={(e) => handleCountChange('station', 'convict_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.remand_male}
                  onChange={(e) => handleCountChange('station', 'remand_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.remand_female}
                  onChange={(e) => handleCountChange('station', 'remand_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.debtor_male}
                  onChange={(e) => handleCountChange('station', 'debtor_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.debtor_female}
                  onChange={(e) => handleCountChange('station', 'debtor_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.lodger_male}
                  onChange={(e) => handleCountChange('station', 'lodger_male', e.target.value)}
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.station.lodger_female}
                  onChange={(e) => handleCountChange('station', 'lodger_female', e.target.value)}
                />
              </td>
            </tr>

            {/* Court Row */}
            <tr className="border-b hover:bg-muted/20">
              <td className="border-r p-3">Court</td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.convict_male}
                  onChange={(e) => handleCountChange('court', 'convict_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.convict_female}
                  onChange={(e) => handleCountChange('court', 'convict_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.remand_male}
                  onChange={(e) => handleCountChange('court', 'remand_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.remand_female}
                  onChange={(e) => handleCountChange('court', 'remand_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.debtor_male}
                  onChange={(e) => handleCountChange('court', 'debtor_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.debtor_female}
                  onChange={(e) => handleCountChange('court', 'debtor_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.lodger_male}
                  onChange={(e) => handleCountChange('court', 'lodger_male', e.target.value)}
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.court.lodger_female}
                  onChange={(e) => handleCountChange('court', 'lodger_female', e.target.value)}
                />
              </td>
            </tr>

            {/* Labour Row */}
            <tr className="hover:bg-muted/20">
              <td className="border-r p-3">Labour</td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.convict_male}
                  onChange={(e) => handleCountChange('labour', 'convict_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.convict_female}
                  onChange={(e) => handleCountChange('labour', 'convict_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.remand_male}
                  onChange={(e) => handleCountChange('labour', 'remand_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.remand_female}
                  onChange={(e) => handleCountChange('labour', 'remand_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.debtor_male}
                  onChange={(e) => handleCountChange('labour', 'debtor_male', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.debtor_female}
                  onChange={(e) => handleCountChange('labour', 'debtor_female', e.target.value)}
                />
              </td>
              <td className="border-r p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.lodger_male}
                  onChange={(e) => handleCountChange('labour', 'lodger_male', e.target.value)}
                />
              </td>
              <td className="p-2">
                <Input
                  type="number"
                  min="0"
                  className="h-9 text-center"
                  value={counts.labour.lodger_female}
                  onChange={(e) => handleCountChange('labour', 'lodger_female', e.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Record Count Info */}
      {calculateRecordCount() > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-sm text-blue-800">
            {calculateRecordCount()} record{calculateRecordCount() > 1 ? 's' : ''} will be created
          </p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 min-w-[200px]"
        >
          {loading ? 'Saving...' : 'SAVE'}
        </Button>
      </div>
    </div>
  );
}
