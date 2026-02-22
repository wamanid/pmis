import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { FileX } from 'lucide-react';
import DeathConfirmationList from './deathConfirmation/DeathConfirmationList';
import DeathNotificationList from './deathNotification/DeathNotificationList';

export default function DeathDetails() {
  const [activeTab, setActiveTab] = useState<'confirmation' | 'notification'>('confirmation');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <FileX className="h-6 w-6" />
        <h1 className="text-2xl">Death Details Management</h1>
      </div>

      {/* Death Details Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('confirmation')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'confirmation'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'confirmation' ? '#650000' : undefined,
              }}
            >
              Death Confirmation
            </button>
            <button
              onClick={() => setActiveTab('notification')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'notification'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'notification' ? '#650000' : undefined,
              }}
            >
              Death Notification
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'confirmation' && (
            <div>
              <DeathConfirmationList />
            </div>
          )}

          {activeTab === 'notification' && (
            <div>
              <DeathNotificationList />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
