import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { ShieldAlert } from 'lucide-react';
import PrisonerSearchScreenWider from '../common/PrisonerSearchScreen-wider';
import PrisonerRestrictionList from './PrisonerRestrictionList';
import DietaryRequirementList from './DietaryRequirementList';

export default function RestrictionAndDietaryDetails() {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'restrictions' | 'dietary'>('restrictions');

  const handlePrisonerChange = (prisonerId: string) => {
    setSelectedPrisonerId(prisonerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <ShieldAlert className="h-6 w-6" />
        <h1 className="text-2xl">Medical Records - Restriction & Dietary</h1>
      </div>

      {/* Prisoner Information Section */}
      <Card style={{ borderTop: '3px solid #650000' }}>
        <CardContent className="pt-6">
          <PrisonerSearchScreenWider
            value={selectedPrisonerId}
            onChange={handlePrisonerChange}
            showTitle={true}
          />
        </CardContent>
      </Card>

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
            <div>
              <PrisonerRestrictionList selectedPrisonerId={selectedPrisonerId} />
            </div>
          )}

          {activeTab === 'dietary' && (
            <div>
              <DietaryRequirementList selectedPrisonerId={selectedPrisonerId} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
