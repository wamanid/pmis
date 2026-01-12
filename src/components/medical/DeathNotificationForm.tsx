import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bell, Save, X, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { format } from 'date-fns';

interface DeathNotification {
  id?: string;
  prisoner_name?: string;
  notified_by_name?: string;
  notification_date: string;
  notification_time: string;
  recipient_name: string;
  recipient_relationship: string;
  recipient_contact: string;
  recipient_address: string;
  notification_method: string;
  notification_status: string;
  notified_by: string;
  message_delivered: string;
  response_received: string;
  additional_contacts_notified: string;
  embassy_notified: string;
  embassy_name: string;
  next_of_kin_arrival_date: string;
  acknowledgement_received: string;
  notes: string;
  prisoner: string;
}

interface DeathNotificationFormProps {
  notification?: DeathNotification | null;
  onSubmit: (notification: DeathNotification) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DeathNotificationForm: React.FC<DeathNotificationFormProps> = ({ notification, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<DeathNotification>({
    notification_date: '',
    notification_time: '',
    recipient_name: '',
    recipient_relationship: '',
    recipient_contact: '',
    recipient_address: '',
    notification_method: 'Phone Call',
    notification_status: 'Pending',
    notified_by: '',
    message_delivered: 'No',
    response_received: '',
    additional_contacts_notified: '',
    embassy_notified: 'No',
    embassy_name: '',
    next_of_kin_arrival_date: '',
    acknowledgement_received: 'No',
    notes: '',
    prisoner: '',
  });

  const [prisoners, setPrisoners] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [notificationDateOpen, setNotificationDateOpen] = useState(false);
  const [arrivalDateOpen, setArrivalDateOpen] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (notification && dataLoaded) {
      setFormData(notification);
    }
  }, [notification, dataLoaded]);

  const loadDropdownData = () => {
    setPrisoners([
      { id: '1', prisoner_number: 'PR-2024-001', full_name: 'John Doe' },
      { id: '2', prisoner_number: 'PR-2024-002', full_name: 'Jane Smith' },
      { id: '3', prisoner_number: 'PR-2024-003', full_name: 'Michael Johnson' },
      { id: '4', prisoner_number: 'PR-2024-004', full_name: 'Emily Davis' },
      { id: '5', prisoner_number: 'PR-2024-005', full_name: 'Robert Lee' },
    ]);

    setStaff([
      { id: '1', name: 'Welfare Officer - Sarah Namukasa', role: 'Welfare Officer', staff_number: 'WEL-001' },
      { id: '2', name: 'Admin Officer - John Okello', role: 'Admin Officer', staff_number: 'ADM-001' },
      { id: '3', name: 'Social Worker - Grace Atim', role: 'Social Worker', staff_number: 'SOC-001' },
      { id: '4', name: 'Chaplain - Rev. Peter Musoke', role: 'Chaplain', staff_number: 'CHP-001' },
      { id: '5', name: 'Officer in Charge - David Ssemakula', role: 'OIC', staff_number: 'OIC-001' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof DeathNotification, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prisoner) {
      toast.error('Please select a prisoner');
      return;
    }
    if (!formData.recipient_name) {
      toast.error('Please enter the recipient name');
      return;
    }
    if (!formData.recipient_contact) {
      toast.error('Please enter the recipient contact');
      return;
    }
    if (!formData.notification_date) {
      toast.error('Please select the notification date');
      return;
    }
    if (!formData.notified_by) {
      toast.error('Please select who notified');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedPrisoner = prisoners.find((p) => p.id === formData.prisoner);
      const selectedStaff = staff.find((s) => s.id === formData.notified_by);

      const submitData: DeathNotification = {
        ...formData,
        prisoner_name: selectedPrisoner?.full_name || '',
        notified_by_name: selectedStaff?.name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Death notification created successfully');
        setFormData({
          notification_date: '',
          notification_time: '',
          recipient_name: '',
          recipient_relationship: '',
          recipient_contact: '',
          recipient_address: '',
          notification_method: 'Phone Call',
          notification_status: 'Pending',
          notified_by: '',
          message_delivered: 'No',
          response_received: '',
          additional_contacts_notified: '',
          embassy_notified: 'No',
          embassy_name: '',
          next_of_kin_arrival_date: '',
          acknowledgement_received: 'No',
          notes: '',
          prisoner: '',
        });
      } else {
        toast.success('Death notification updated successfully');
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
      case 'notified_by':
        const staffMember = staff.find(s => s.id === id);
        return staffMember ? `${staffMember.name}` : id;
      default:
        return id;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="h-5 w-5" />
          {mode === 'create' && 'New Death Notification'}
          {mode === 'edit' && 'Edit Death Notification'}
          {mode === 'view' && 'View Death Notification'}
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
                  Deceased Prisoner <span className="text-red-500">*</span>
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
                <Label htmlFor="notified_by">
                  Notified By <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {getDisplayValue('notified_by', formData.notified_by)}
                  </div>
                ) : (
                  <Select
                    value={formData.notified_by}
                    onValueChange={(value) => handleInputChange('notified_by', value)}
                  >
                    <SelectTrigger id="notified_by">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Notification Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification_date">
                  Notification Date <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.notification_date ? format(new Date(formData.notification_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={notificationDateOpen} onOpenChange={setNotificationDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.notification_date ? format(new Date(formData.notification_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.notification_date ? new Date(formData.notification_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('notification_date', format(date, 'yyyy-MM-dd'));
                            setNotificationDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification_time">Notification Time</Label>
                <Input
                  id="notification_time"
                  type="time"
                  value={formData.notification_time}
                  onChange={(e) => handleInputChange('notification_time', e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification_method">
                  Notification Method <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.notification_method || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.notification_method}
                    onValueChange={(value) => handleInputChange('notification_method', value)}
                  >
                    <SelectTrigger id="notification_method">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="In Person">In Person</SelectItem>
                      <SelectItem value="Official Letter">Official Letter</SelectItem>
                      <SelectItem value="Police">Through Police</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification_status">
                  Status <span className="text-red-500">*</span>
                </Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.notification_status || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.notification_status}
                    onValueChange={(value) => handleInputChange('notification_status', value)}
                  >
                    <SelectTrigger id="notification_status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Notified">Notified</SelectItem>
                      <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="Failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="message_delivered">Message Delivered</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.message_delivered || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.message_delivered}
                    onValueChange={(value) => handleInputChange('message_delivered', value)}
                  >
                    <SelectTrigger id="message_delivered">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="acknowledgement_received">Acknowledgement Received</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.acknowledgement_received || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.acknowledgement_received}
                    onValueChange={(value) => handleInputChange('acknowledgement_received', value)}
                  >
                    <SelectTrigger id="acknowledgement_received">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Recipient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_name">
                  Recipient Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient_name"
                  value={formData.recipient_name}
                  onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                  placeholder="Enter full name"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient_relationship">Relationship to Deceased</Label>
                <Input
                  id="recipient_relationship"
                  value={formData.recipient_relationship}
                  onChange={(e) => handleInputChange('recipient_relationship', e.target.value)}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient_contact">
                  Recipient Contact <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="recipient_contact"
                  value={formData.recipient_contact}
                  onChange={(e) => handleInputChange('recipient_contact', e.target.value)}
                  placeholder="Phone number or email"
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next_of_kin_arrival_date">Expected Arrival Date</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.next_of_kin_arrival_date ? format(new Date(formData.next_of_kin_arrival_date), 'PPP') : 'N/A'}
                  </div>
                ) : (
                  <Popover open={arrivalDateOpen} onOpenChange={setArrivalDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.next_of_kin_arrival_date ? format(new Date(formData.next_of_kin_arrival_date), 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.next_of_kin_arrival_date ? new Date(formData.next_of_kin_arrival_date) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            handleInputChange('next_of_kin_arrival_date', format(date, 'yyyy-MM-dd'));
                            setArrivalDateOpen(false);
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
              <Label htmlFor="recipient_address">Recipient Address</Label>
              <Textarea
                id="recipient_address"
                value={formData.recipient_address}
                onChange={(e) => handleInputChange('recipient_address', e.target.value)}
                placeholder="Enter full address..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Additional Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="response_received">Response Received</Label>
              <Textarea
                id="response_received"
                value={formData.response_received}
                onChange={(e) => handleInputChange('response_received', e.target.value)}
                placeholder="Enter response details..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_contacts_notified">Additional Contacts Notified</Label>
              <Textarea
                id="additional_contacts_notified"
                value={formData.additional_contacts_notified}
                onChange={(e) => handleInputChange('additional_contacts_notified', e.target.value)}
                placeholder="List other family members or contacts notified..."
                rows={2}
                disabled={isReadOnly}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="embassy_notified">Embassy/Consulate Notified</Label>
                {isReadOnly ? (
                  <div className="p-2 bg-gray-50 rounded border">
                    {formData.embassy_notified || 'N/A'}
                  </div>
                ) : (
                  <Select
                    value={formData.embassy_notified}
                    onValueChange={(value) => handleInputChange('embassy_notified', value)}
                  >
                    <SelectTrigger id="embassy_notified">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="embassy_name">Embassy/Consulate Name</Label>
                <Input
                  id="embassy_name"
                  value={formData.embassy_name}
                  onChange={(e) => handleInputChange('embassy_name', e.target.value)}
                  placeholder="Enter embassy name"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Enter additional notes..."
                rows={3}
                disabled={isReadOnly}
              />
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
                {loading ? 'Saving...' : mode === 'create' ? 'Create Notification' : 'Update Notification'}
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

export default DeathNotificationForm;
