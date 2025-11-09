import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Scale } from 'lucide-react';
import PrisonerSearchScreenWider from '../common/PrisonerSearchScreen-wider';
import CourtAttendanceList from './CourtAttendanceList';
import CourtProceedingList from './CourtProceedingList';
import CourtScheduleList from './CourtScheduleList';
import CourtVisitList from './CourtVisitList';
import CourtDocumentList from './CourtDocumentList';
import CourtCaseBacklogList from './CourtCaseBacklogList';

export default function ViewFullCourtDetail() {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'attendance' | 'proceedings' | 'schedules' | 'visits' | 'documents' | 'backlog'>('schedules');

  const handlePrisonerChange = (prisonerId: string) => {
    setSelectedPrisonerId(prisonerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <Scale className="h-6 w-6" />
        <h1 className="text-2xl">Court Details</h1>
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

      {/* Court Information Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'schedules'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'schedules' ? '#650000' : undefined,
              }}
            >
              Court Schedules
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'attendance'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'attendance' ? '#650000' : undefined,
              }}
            >
              Court Attendance
            </button>
            <button
              onClick={() => setActiveTab('proceedings')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'proceedings'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'proceedings' ? '#650000' : undefined,
              }}
            >
              Court Proceedings
            </button>
            <button
              onClick={() => setActiveTab('visits')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'visits'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'visits' ? '#650000' : undefined,
              }}
            >
              Court Visits
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'documents'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'documents' ? '#650000' : undefined,
              }}
            >
              Court Attendance Documents
            </button>
            <button
              onClick={() => setActiveTab('backlog')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'backlog'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'backlog' ? '#650000' : undefined,
              }}
            >
              Court Case Backlog
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'schedules' && (
            <div>
              <CourtScheduleList />
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="p-6">
              <CourtAttendanceList />
            </div>
          )}

          {activeTab === 'proceedings' && (
            <div>
              <CourtProceedingList />
            </div>
          )}

          {activeTab === 'visits' && (
            <div>
              <CourtVisitList />
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <CourtDocumentList />
            </div>
          )}

          {activeTab === 'backlog' && (
            <div>
              <CourtCaseBacklogList />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
