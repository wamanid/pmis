import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { ShieldAlert } from 'lucide-react';
import PrisonerRestrictionList from './restrictions/PrisonerRestrictionList';
import DietaryRequirementList from './dietary/DietaryRequirementList';

export default function RestrictionAndDietaryDetails() {
  const [activeTab, setActiveTab] = useState<'restrictions' | 'dietary'>('restrictions');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <ShieldAlert className="h-6 w-6" />
        <h1 className="text-2xl">Medical Records - Restriction & Dietary</h1>
      </div>

      {/* Restriction and Dietary Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('restrictions')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'restrictions'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'restrictions' ? '#650000' : undefined,
              }}
            >
              Prisoner Restrictions
            </button>
            <button
              onClick={() => setActiveTab('dietary')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'dietary'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'dietary' ? '#650000' : undefined,
              }}
            >
              Dietary Requirements
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'restrictions' && (
            <div className="p-6">
              <PrisonerRestrictionList />
            </div>
          )}

          {activeTab === 'dietary' && (
            <div className="p-6">
              <DietaryRequirementList />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
