import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Bell, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface DeathConfirmation {
  id: string;
  prisoner_name: string;
  date_of_death: string;
  cause_of_death: string;
}

interface Notification {
  id: string;
  title: string;
  description?: string;
}

interface NextOfKin {
  id: string;
  name: string;
  relationship: string;
  contact: string;
}

interface Recipient {
  id?: string;
  recipient_name: string;
  recipient: string;
}

interface DeathNotification {
  id?: string;
  prisoner_name?: string;
  death_confirmation: string;
  notification: string;
  recipients: Recipient[];
}

interface DeathNotificationFormProps {
  notification?: DeathNotification | null;
  onSubmit: (notification: DeathNotification) => void;
  onCancel: () => void;
  mode: 'create' | 'edit' | 'view';
}

const DeathNotificationForm: React.FC<DeathNotificationFormProps> = ({ notification, onSubmit, onCancel, mode }) => {
  const [formData, setFormData] = useState<DeathNotification>({
    death_confirmation: '',
    notification: '',
    recipients: [],
  });

  const [deathConfirmations, setDeathConfirmations] = useState<DeathConfirmation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nextOfKin, setNextOfKin] = useState<NextOfKin[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    if (notification && dataLoaded) {
      setFormData(notification);
    }
  }, [notification, dataLoaded]);

  const loadDropdownData = () => {
    // Mock Death Confirmations
    setDeathConfirmations([
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa6', 
        prisoner_name: 'John Doe (PR-2024-001)', 
        date_of_death: '2024-11-10',
        cause_of_death: 'Acute myocardial infarction'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa7', 
        prisoner_name: 'Jane Smith (PR-2024-002)', 
        date_of_death: '2024-10-25',
        cause_of_death: 'Tuberculosis with severe respiratory failure'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa8', 
        prisoner_name: 'Michael Johnson (PR-2024-003)', 
        date_of_death: '2024-11-05',
        cause_of_death: 'Post-surgical complications'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afa9', 
        prisoner_name: 'Emily Davis (PR-2024-004)', 
        date_of_death: '2024-09-18',
        cause_of_death: 'Suicide by hanging'
      },
      { 
        id: '3fa85f64-5717-4562-b3fc-2c963f66afaa', 
        prisoner_name: 'Robert Lee (PR-2024-005)', 
        date_of_death: '2024-12-02',
        cause_of_death: 'HIV/AIDS related complications'
      },
    ]);

    // Mock Notifications (notification templates)
    setNotifications([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb1', title: 'Death Notification - Next of Kin', description: 'Standard notification to next of kin' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb2', title: 'Death Notification - Embassy', description: 'Notification to foreign embassy' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb3', title: 'Death Notification - Legal Representative', description: 'Notification to legal representative' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb4', title: 'Death Notification - Family Members', description: 'Notification to extended family' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afb5', title: 'Death Notification - Emergency Contact', description: 'Notification to emergency contact' },
    ]);

    // Mock Next of Kin / Recipients
    setNextOfKin([
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc1', name: 'Mary Doe (Mother)', relationship: 'Mother', contact: '+256 700 123456' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc2', name: 'James Doe (Father)', relationship: 'Father', contact: '+256 700 123457' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc3', name: 'Sarah Smith (Wife)', relationship: 'Spouse', contact: '+256 700 123458' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc4', name: 'Robert Johnson (Brother)', relationship: 'Sibling', contact: '+256 700 123459' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc5', name: 'Grace Nakato (Sister)', relationship: 'Sibling', contact: '+256 700 123460' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc6', name: 'Attorney David Musoke', relationship: 'Legal Representative', contact: '+256 700 123461' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc7', name: 'Rev. Peter Ssemakula', relationship: 'Religious Advisor', contact: '+256 700 123462' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc8', name: 'US Embassy Kampala', relationship: 'Embassy', contact: '+256 414 259791' },
      { id: '3fa85f64-5717-4562-b3fc-2c963f66afc9', name: 'UK High Commission', relationship: 'Embassy', contact: '+256 312 312000' },
    ]);

    setDataLoaded(true);
  };

  const handleInputChange = (field: keyof DeathNotification, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRecipient = () => {
    setFormData((prev) => ({
      ...prev,
      recipients: [...prev.recipients, { recipient_name: '', recipient: '' }],
    }));
  };

  const handleRemoveRecipient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const handleRecipientChange = (index: number, recipientId: string) => {
    const selectedRecipient = nextOfKin.find((nok) => nok.id === recipientId);
    if (selectedRecipient) {
      const updatedRecipients = [...formData.recipients];
      updatedRecipients[index] = {
        recipient_name: selectedRecipient.name,
        recipient: recipientId,
      };
      setFormData((prev) => ({ ...prev, recipients: updatedRecipients }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.death_confirmation) {
      toast.error('Please select a death confirmation');
      return;
    }
    if (!formData.notification) {
      toast.error('Please select a notification template');
      return;
    }
    if (formData.recipients.length === 0) {
      toast.error('Please add at least one recipient');
      return;
    }

    // Validate all recipients are selected
    const invalidRecipient = formData.recipients.find((r) => !r.recipient);
    if (invalidRecipient) {
      toast.error('Please select all recipients');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const selectedConfirmation = deathConfirmations.find((dc) => dc.id === formData.death_confirmation);

      const submitData: DeathNotification = {
        ...formData,
        prisoner_name: selectedConfirmation?.prisoner_name || '',
      };

      onSubmit(submitData);
      setLoading(false);

      if (mode === 'create') {
        toast.success('Death notification created successfully');
        setFormData({
          death_confirmation: '',
          notification: '',
          recipients: [],
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
      case 'death_confirmation':
        const confirmation = deathConfirmations.find(dc => dc.id === id);
        return confirmation ? `${confirmation.prisoner_name} - ${confirmation.date_of_death}` : id;
      case 'notification':
        const notif = notifications.find(n => n.id === id);
        return notif ? `${notif.title}` : id;
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
              Death Confirmation
            </h3>
            <div className="space-y-2">
              <Label htmlFor="death_confirmation">
                Death Confirmation <span className="text-red-500">*</span>
              </Label>
              {isReadOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {getDisplayValue('death_confirmation', formData.death_confirmation)}
                </div>
              ) : (
                <Select
                  value={formData.death_confirmation}
                  onValueChange={(value) => handleInputChange('death_confirmation', value)}
                >
                  <SelectTrigger id="death_confirmation">
                    <SelectValue placeholder="Select death confirmation" />
                  </SelectTrigger>
                  <SelectContent>
                    {deathConfirmations.map((dc) => (
                      <SelectItem key={dc.id} value={dc.id}>
                        {dc.prisoner_name} - {dc.date_of_death} ({dc.cause_of_death})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Notification Template
            </h3>
            <div className="space-y-2">
              <Label htmlFor="notification">
                Notification <span className="text-red-500">*</span>
              </Label>
              {isReadOnly ? (
                <div className="p-2 bg-gray-50 rounded border">
                  {getDisplayValue('notification', formData.notification)}
                </div>
              ) : (
                <Select
                  value={formData.notification}
                  onValueChange={(value) => handleInputChange('notification', value)}
                >
                  <SelectTrigger id="notification">
                    <SelectValue placeholder="Select notification template" />
                  </SelectTrigger>
                  <SelectContent>
                    {notifications.map((notif) => (
                      <SelectItem key={notif.id} value={notif.id}>
                        {notif.title} {notif.description && `- ${notif.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                Recipients <span className="text-red-500">*</span>
              </h3>
              {!isReadOnly && (
                <Button
                  type="button"
                  onClick={handleAddRecipient}
                  size="sm"
                  style={{ backgroundColor: '#34D399' }}
                  className="text-white hover:opacity-90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Recipient
                </Button>
              )}
            </div>

            {formData.recipients.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
                No recipients added. Click "Add Recipient" to add recipients for this notification.
              </div>
            ) : (
              <div className="space-y-3">
                {formData.recipients.map((recipient, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1">
                      {isReadOnly ? (
                        <div className="p-2 bg-white rounded border">
                          {recipient.recipient_name || 'N/A'}
                        </div>
                      ) : (
                        <Select
                          value={recipient.recipient}
                          onValueChange={(value) => handleRecipientChange(index, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select recipient" />
                          </SelectTrigger>
                          <SelectContent>
                            {nextOfKin.map((nok) => (
                              <SelectItem key={nok.id} value={nok.id}>
                                {nok.name} - {nok.relationship} ({nok.contact})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveRecipient(index)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
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
