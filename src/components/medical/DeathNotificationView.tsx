import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, X } from 'lucide-react';

interface DeathNotification {
  id: string;
  prisoner_name: string;
  death_confirmation: string;
  notification: string;
}

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
                <p className="text-sm text-gray-600">Prisoner Name</p>
                <p className="font-medium">{deathNotification.prisoner_name}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Notification ID</p>
                <p className="font-medium font-mono">NOT-{deathNotification.notification}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Death Confirmation ID</p>
                <p className="font-medium font-mono">DC-{deathNotification.death_confirmation}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-blue-100 text-blue-800">Notified</Badge>
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
