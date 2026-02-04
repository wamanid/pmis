import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, X, Users } from 'lucide-react';

interface Recipient {
  id: string;
  recipient_name: string;
  recipient: string;
}

interface DeathNotification {
  id: string;
  prisoner_name: string;
  death_confirmation: string;
  notification: string;
  recipients: Recipient[];
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
                <p className="text-sm text-gray-600">Notification ID</p>
                <p className="font-medium font-mono">NOT-{deathNotification.id}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Prisoner Name</p>
                <p className="font-medium">{deathNotification.prisoner_name}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Death Confirmation ID</p>
                <p className="font-medium font-mono">DC-{deathNotification.death_confirmation.slice(-8)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Notification Template ID</p>
                <p className="font-medium font-mono">NTF-{deathNotification.notification.slice(-8)}</p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Total Recipients</p>
                <Badge className="bg-blue-100 text-blue-800">
                  {deathNotification.recipients.length} {deathNotification.recipients.length === 1 ? 'Recipient' : 'Recipients'}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-green-100 text-green-800">Sent</Badge>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#650000' }} />
              <h3 className="text-lg font-semibold" style={{ color: '#650000' }}>
                Notification Recipients
              </h3>
            </div>
            
            {deathNotification.recipients.length === 0 ? (
              <div className="p-4 border border-dashed rounded-lg text-center text-gray-500">
                No recipients found for this notification.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Recipient ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Recipient Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deathNotification.recipients.map((recipient, index) => (
                      <tr key={recipient.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">
                          RCP-{recipient.recipient.slice(-8)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {recipient.recipient_name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <Badge className="bg-green-100 text-green-800">Notified</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
