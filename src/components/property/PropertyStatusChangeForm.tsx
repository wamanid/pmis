import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Calendar } from '../ui/calendar';
import { toast } from 'sonner@2.0.3';
import { 
  Check, 
  ChevronsUpDown, 
  CalendarIcon,
  Package,
  AlertCircle
} from 'lucide-react';
import { cn } from '../ui/utils';
import { format } from 'date-fns';

interface PropertyStatusChangeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  editData?: any;
}

interface Property {
  id: string;
  property_item_name: string;
  prisoner_name: string;
  prisoner_number: string;
  property_bag_number: string;
}

interface PropertyStatus {
  id: string;
  name: string;
}

const PropertyStatusChangeForm: React.FC<PropertyStatusChangeFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  editData
}) => {
  const [formData, setFormData] = useState({
    property: '',
    property_status: '',
    date_of_status_change: new Date(),
    reason_for_status_change: '',
    destination: ''
  });

  const [properties, setProperties] = useState<Property[]>([]);
  const [propertyStatuses, setPropertyStatuses] = useState<PropertyStatus[]>([]);
  const [openProperty, setOpenProperty] = useState(false);
  const [openPropertyStatus, setOpenPropertyStatus] = useState(false);
  const [openDate, setOpenDate] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with actual API calls
  const mockProperties: Property[] = [
    {
      id: '1',
      property_item_name: 'Mobile Phone',
      prisoner_name: 'John Doe',
      prisoner_number: 'PR001',
      property_bag_number: 'BAG001'
    },
    {
      id: '2',
      property_item_name: 'Wallet',
      prisoner_name: 'Jane Smith',
      prisoner_number: 'PR002',
      property_bag_number: 'BAG002'
    },
    {
      id: '3',
      property_item_name: 'Watch',
      prisoner_name: 'Mike Johnson',
      prisoner_number: 'PR003',
      property_bag_number: 'BAG003'
    }
  ];

  const mockPropertyStatuses: PropertyStatus[] = [
    { id: '1', name: 'In Storage' },
    { id: '2', name: 'Released' },
    { id: '3', name: 'Confiscated' },
    { id: '4', name: 'Destroyed' },
    { id: '5', name: 'Lost' },
    { id: '6', name: 'Transferred' }
  ];

  // Fetch properties and statuses on mount
  useEffect(() => {
    fetchProperties();
    fetchPropertyStatuses();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setFormData({
        property: editData.property || '',
        property_status: editData.property_status || '',
        date_of_status_change: editData.date_of_status_change ? new Date(editData.date_of_status_change) : new Date(),
        reason_for_status_change: editData.reason_for_status_change || '',
        destination: editData.destination || ''
      });
    } else {
      resetForm();
    }
  }, [editData, open]);

  const fetchProperties = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/property-management/properties/');
      // const data = await response.json();
      // setProperties(data.results);
      setProperties(mockProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to load properties');
    }
  };

  const fetchPropertyStatuses = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/property-management/statuses/');
      // const data = await response.json();
      // setPropertyStatuses(data.results);
      setPropertyStatuses(mockPropertyStatuses);
    } catch (error) {
      console.error('Error fetching property statuses:', error);
      toast.error('Failed to load property statuses');
    }
  };

  const resetForm = () => {
    setFormData({
      property: '',
      property_status: '',
      date_of_status_change: new Date(),
      reason_for_status_change: '',
      destination: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.property) {
      toast.error('Please select a property item');
      return;
    }
    if (!formData.property_status) {
      toast.error('Please select a property status');
      return;
    }
    if (!formData.reason_for_status_change) {
      toast.error('Please provide a reason for status change');
      return;
    }

    setLoading(true);

    try {
      // Format data for submission
      const submitData = {
        ...formData,
        date_of_status_change: format(formData.date_of_status_change, 'yyyy-MM-dd')
      };

      // TODO: Replace with actual API call
      // const response = await fetch('/api/property-management/status-changes/', {
      //   method: editData ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submitData)
      // });

      onSubmit(submitData);
      toast.success(editData ? 'Status change updated successfully' : 'Status change recorded successfully');
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit status change');
    } finally {
      setLoading(false);
    }
  };

  const selectedProperty = properties.find((p) => p.id === formData.property);
  const selectedStatus = propertyStatuses.find((s) => s.id === formData.property_status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1400px] max-h-[90vh] overflow-y-auto resize">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            <Package className="h-6 w-6" />
            {editData ? 'Edit Property Status Change' : 'Record Property Status Change'}
          </DialogTitle>
          <DialogDescription>
            Record changes in property status for prisoner items
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Item Selection */}
            <div className="space-y-2">
              <Label htmlFor="property">Property Item *</Label>
              <Popover open={openProperty} onOpenChange={setOpenProperty}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openProperty}
                    className="w-full justify-between"
                    style={{ borderColor: formData.property ? '#650000' : undefined }}
                  >
                    {selectedProperty ? (
                      <span className="flex flex-col items-start">
                        <span>{selectedProperty.property_item_name}</span>
                        <span className="text-xs text-gray-500">
                          {selectedProperty.prisoner_name} ({selectedProperty.prisoner_number})
                        </span>
                      </span>
                    ) : (
                      'Select property item...'
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search property items..." />
                    <CommandList>
                      <CommandEmpty>No property items found.</CommandEmpty>
                      <CommandGroup>
                        {properties.map((property) => (
                          <CommandItem
                            key={property.id}
                            value={`${property.property_item_name} ${property.prisoner_name} ${property.prisoner_number}`}
                            onSelect={() => {
                              setFormData({ ...formData, property: property.id });
                              setOpenProperty(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.property === property.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{property.property_item_name}</span>
                              <span className="text-xs text-gray-500">
                                {property.prisoner_name} ({property.prisoner_number}) - Bag: {property.property_bag_number}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Property Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="property_status">New Property Status *</Label>
              <Popover open={openPropertyStatus} onOpenChange={setOpenPropertyStatus}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPropertyStatus}
                    className="w-full justify-between"
                    style={{ borderColor: formData.property_status ? '#650000' : undefined }}
                  >
                    {selectedStatus ? selectedStatus.name : 'Select status...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandList>
                      <CommandEmpty>No status found.</CommandEmpty>
                      <CommandGroup>
                        {propertyStatuses.map((status) => (
                          <CommandItem
                            key={status.id}
                            value={status.name}
                            onSelect={() => {
                              setFormData({ ...formData, property_status: status.id });
                              setOpenPropertyStatus(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                formData.property_status === status.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            {status.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Date of Status Change */}
            <div className="space-y-2">
              <Label>Date of Status Change *</Label>
              <Popover open={openDate} onOpenChange={setOpenDate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                    style={{ borderColor: '#650000' }}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.date_of_status_change, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date_of_status_change}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, date_of_status_change: date });
                        setOpenDate(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Enter destination (if applicable)"
              />
            </div>

            {/* Reason for Status Change */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="reason">Reason for Status Change *</Label>
              <Textarea
                id="reason"
                value={formData.reason_for_status_change}
                onChange={(e) => setFormData({ ...formData, reason_for_status_change: e.target.value })}
                placeholder="Provide detailed reason for the status change"
                rows={4}
              />
            </div>
          </div>

          {/* Alert Info */}
          <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                <strong>Important:</strong> Status changes are permanent and will be recorded in the system audit log. 
                Ensure all information is accurate before submitting.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{ backgroundColor: '#650000' }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : editData ? 'Update Status Change' : 'Record Status Change'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyStatusChangeForm;
