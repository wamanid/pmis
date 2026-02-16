import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Bell, X } from 'lucide-react';
import { DeathNotificationItem as DeathNotification } from '../../../../services/medical/deathDetails/deathNotificationService';

interface DeathNotificationViewProps {
  deathNotification: DeathNotification;
  onClose: () => void;
}

const DeathNotificationView: React.FC<DeathNotificationViewProps> = ({
  deathNotification,
  onClose,
}) => {
  return (
    <Card className="w-full">
      <CardHeader style={{ backgroundColor: '#650000' }}>
        <CardTitle className="flex items-center gap-2 text-white">
          <Bell className="h-5 w-5" />
          Death Notification Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
              Notification Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Notification ID</p>
                <p className="font-medium font-mono">NOT-{deathNotification.id?.slice(-8) || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Prisoner Name</p>
                <p className="font-medium">{deathNotification.prisoner_name || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Death Confirmation ID</p>
                <p className="font-medium font-mono">DC-{deathNotification.death_confirmation?.slice(-8) || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Notification Template ID</p>
                <p className="font-medium font-mono">NTF-{deathNotification.notification?.slice(-8) || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeathNotificationView;
