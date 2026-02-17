import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Bell, Save, X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { requiredValidation } from '../../../../utils/validation';
import SearchableSelect from '../../../common/SearchableSelect';
import { fetchDeathConfirmations } from '../../../../services/medical/deathDetails/deathConfirmationService';
import { fetchNotificationsPaginated } from '../../../../services/systemAdministration/notificationService';
import { DeathNotificationItem as DeathNotification } from '../../../../services/medical/deathDetails/deathNotificationService';




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
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localDeathConfirmation, setLocalDeathConfirmation] = useState<string | null>(() => {
    if (notification && (mode === 'edit' || mode === 'view') && notification.death_confirmation) {
      return notification.death_confirmation;
    }
    return null;
  });
  const [localNotification, setLocalNotification] = useState<string | null>(() => {
    if (notification && (mode === 'edit' || mode === 'view') && notification.notification) {
      return notification.notification;
    }
    return null;
  });

  // Fetch callbacks wrapped in useCallback to prevent unnecessary re-fetches
  const fetchDeathConfirmationsCallback = useCallback(async (
    opts: { [key: string]: any; search?: string; page?: number; page_size?: number },
    signal?: AbortSignal
  ) => {
    try {
      const response = await fetchDeathConfirmations(
        opts.page || 1,
        opts.page_size || 50,
        opts.search || '',
        {}
      );
      
      // Transform items to include comprehensive display labels for better UX
      const transformedItems = response.items.map((item: any) => ({
        ...item,
        display_label: `${item.prisoner_number_value || item.prisoner_number || 'N/A'} - ${item.prisoner_name || 'Unknown'} | Died: ${
          item.date_of_death || 'N/A'
        } | Cause: ${item.cause_of_death || 'Not specified'}`,
      }));
      
      return {
        ...response,
        items: transformedItems,
      };
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
        return { items: [], count: 0, next: null };
      }
      throw error;
    }
  }, []);

  const fetchNotificationsCallback = useCallback(async (
    opts: { [key: string]: any; search?: string; page?: number; page_size?: number },
    signal?: AbortSignal
  ) => {
    try {
      return await fetchNotificationsPaginated(
        opts.page || 1,
        opts.page_size || 50,
        opts.search || '',
        signal
      );
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
        return { items: [], count: 0, next: null };
      }
      throw error;
    }
  }, []);



  useEffect(() => {
    if (notification && (mode === 'edit' || mode === 'view')) {
      setFormData(notification);
      setLocalDeathConfirmation(notification.death_confirmation || null);
      setLocalNotification(notification.notification || null);
    }
  }, [notification, mode]);

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        death_confirmation: '',
        notification: '',
      });
      setLocalDeathConfirmation(null);
      setLocalNotification(null);
    }
  }, [mode]);

  const handleInputChange = (field: keyof DeathNotification, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const newErrors: Record<string, string> = {};
    
    if (!formData.death_confirmation) {
      newErrors.death_confirmation = 'Death Confirmation is required';
    }
    if (!formData.notification) {
      newErrors.notification = 'Notification Template is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setLoading(true);

    try {
      const submitData: DeathNotification = {
        ...formData,
        prisoner_name: notification?.prisoner_name || '',
      };

      onSubmit(submitData);

      if (mode === 'create') {
        toast.success('Death notification created successfully');
        setFormData({
          death_confirmation: '',
          notification: '',
        });
        setLocalDeathConfirmation(null);
        setLocalNotification(null);
      } else {
        toast.success('Death notification updated successfully');
      }
    } catch (error) {
      console.error('Failed to submit notification:', error);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = mode === 'view';

  // Derive initialItem for dropdowns in edit/view mode
  const initialDeathConfirmationItem = (notification && (mode === 'edit' || mode === 'view') && notification.death_confirmation)
    ? { 
        id: notification.death_confirmation, 
        display_label: notification.prisoner_name || 'Death Confirmation Record'
      }
    : undefined;

  const initialNotificationItem = (notification && (mode === 'edit' || mode === 'view') && notification.notification)
    ? { id: notification.notification, subject: 'Notification Template' }
    : undefined;

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
                  {notification?.prisoner_name || 'N/A'}
                </div>
              ) : (
                <>
                  <SearchableSelect
                    fetchPaginated={fetchDeathConfirmationsCallback}
                    value={localDeathConfirmation}
                    onChange={(val) => {
                      setLocalDeathConfirmation(val);
                      handleInputChange('death_confirmation', val);
                    }}
                    placeholder="Search by prisoner number, name, or cause of death..."
                    idField="id"
                    labelField="display_label"
                    pageSize={50}
                    initialItem={initialDeathConfirmationItem as any}
                    disabled={loading}
                  />
                  {errors.death_confirmation && (
                    <p className="text-sm text-red-600">{errors.death_confirmation}</p>
                  )}
                </>
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
                  Notification Template
                </div>
              ) : (
                <>
                  <SearchableSelect
                    fetchPaginated={fetchNotificationsCallback}
                    value={localNotification}
                    onChange={(val) => {
                      setLocalNotification(val);
                      handleInputChange('notification', val);
                    }}
                    placeholder="Select notification template"
                    idField="id"
                    labelField="subject"
                    pageSize={50}
                    initialItem={initialNotificationItem as any}
                    disabled={loading}
                  />
                  {errors.notification && (
                    <p className="text-sm text-red-600">{errors.notification}</p>
                  )}
                </>
              )}
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
