import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { ThumbsUp } from 'lucide-react';
import PrisonerSearchScreenWider from '../common/PrisonerSearchScreen-wider';
import WardRecommendationList from './WardRecommendationList';
import TransferRecommendationList from './TransferRecommendationList';

export default function RecommendationsDetails() {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'ward' | 'transfer'>('ward');

  const handlePrisonerChange = (prisonerId: string) => {
    setSelectedPrisonerId(prisonerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <ThumbsUp className="h-6 w-6" />
        <h1 className="text-2xl">Medical Recommendations</h1>
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

      {/* Recommendations Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('ward')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'ward'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'ward' ? '#650000' : undefined,
              }}
            >
              Ward Recommendations
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'transfer'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'transfer' ? '#650000' : undefined,
              }}
            >
              Transfer Recommendations
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'ward' && (
            <div>
              <WardRecommendationList selectedPrisonerId={selectedPrisonerId} />
            </div>
          )}

          {activeTab === 'transfer' && (
            <div>
              <TransferRecommendationList selectedPrisonerId={selectedPrisonerId} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
