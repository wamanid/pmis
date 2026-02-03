import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { ClipboardList } from 'lucide-react';
import PrisonerSearchScreenWider from '../common/PrisonerSearchScreen-wider';
import StationStateList from './StationStateList';
import FoodAssessmentList from './FoodAssessmentList';

export default function StationsAndAssessmentDetails() {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'station' | 'food'>('station');

  const handlePrisonerChange = (prisonerId: string) => {
    setSelectedPrisonerId(prisonerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <ClipboardList className="h-6 w-6" />
        <h1 className="text-2xl">Stations and Assessment</h1>
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

      {/* Assessment Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('station')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'station'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'station' ? '#650000' : undefined,
              }}
            >
              Station State
            </button>
            <button
              onClick={() => setActiveTab('food')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'food'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'food' ? '#650000' : undefined,
              }}
            >
              Food Assessment
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'station' && (
            <div>
              <StationStateList selectedPrisonerId={selectedPrisonerId} />
            </div>
          )}

          {activeTab === 'food' && (
            <div>
              <FoodAssessmentList selectedPrisonerId={selectedPrisonerId} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
