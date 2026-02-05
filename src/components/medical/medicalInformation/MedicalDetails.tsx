import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Activity } from 'lucide-react';
import PrisonerSearchScreenWider from '../../common/PrisonerSearchScreen-wider';
import MedicalRecordScreen from './medicalRecord/MedicalRecordScreen';
import BMIScreen from './bmi/BMIScreen';
import CaseBookScreen from './caseBook/CaseBookScreen';
import ScheduleScreen from './schedules/ScheduleScreen';
import LabTestScreen from './labTests/LabTestScreen';
import TreatmentScreen from './treatments/TreatmentScreen';
import ExamResultScreen from './examinationResults/ExamResultScreen';
import AilmentScreen from './ailments/AilmentScreen';
import DiagnosisScreen from './diagnosis/DiagnosisScreen';
import {PrisonerItem} from "../../../services/stationServices/visitorsServices/VisitorsService";
import {
  BmiClassification,
  BmiRecord,
  CaseBook,
  MedicalRecord
} from "../../../services/medical/medicalInformation/medical";
import {Unit} from "../../../services/stationServices/visitorsServices/visitorItem";

export interface Loading {
  record: boolean,
  bmi: boolean,
  case: boolean,
}

export default function MedicalDetails() {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'medical-record' | 'bmi' | 'casebook' | 'schedule' | 'labtest' | 'treatment' | 'examresult' | 'ailment' | 'diagnosis'>('medical-record');

  // API Integration
  const [prisoners, setPrisoners] = useState<PrisonerItem[]>([])
  const [loading, setLoading] = useState<Loading>({ record: true, bmi: true, case: true })
  // BIM
  const [bmiRecords, setBmiRecords] = useState<BmiRecord[]>([]);
  const [classifications, setClassifications] = useState<BmiClassification[]>([])
  // Medical records
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [bloodGroups, setBloodGroups] = useState<Unit[]>([]);
  // Case book
  const [caseBooks, setCaseBooks] = useState<CaseBook[]>([]);
  const [checkupTypes, setCheckupTypes] = useState<Unit[]>([]);
  const [presentations, setPresentations] = useState<Unit[]>([])

  const handlePrisonerChange = (prisonerId: string) => {
    setSelectedPrisonerId(prisonerId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <Activity className="h-6 w-6" />
        <h1 className="text-2xl">Medical Information</h1>
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

      {/* Medical Information Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('medical-record')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'medical-record'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'medical-record' ? '#650000' : undefined,
              }}
            >
              Medical Record
            </button>
            <button
              onClick={() => setActiveTab('bmi')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'bmi'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'bmi' ? '#650000' : undefined,
              }}
            >
              BMI
            </button>
            <button
              onClick={() => setActiveTab('casebook')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'casebook'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'casebook' ? '#650000' : undefined,
              }}
            >
              Case Book
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'schedule'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'schedule' ? '#650000' : undefined,
              }}
            >
              Schedules
            </button>
            <button
              onClick={() => setActiveTab('labtest')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'labtest'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'labtest' ? '#650000' : undefined,
              }}
            >
              Lab Tests
            </button>
            <button
              onClick={() => setActiveTab('treatment')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'treatment'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'treatment' ? '#650000' : undefined,
              }}
            >
              Treatments
            </button>
            <button
              onClick={() => setActiveTab('examresult')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'examresult'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'examresult' ? '#650000' : undefined,
              }}
            >
              Examination Results
            </button>
            <button
              onClick={() => setActiveTab('ailment')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'ailment'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'ailment' ? '#650000' : undefined,
              }}
            >
              Ailments
            </button>
            <button
              onClick={() => setActiveTab('diagnosis')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'diagnosis'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'diagnosis' ? '#650000' : undefined,
              }}
            >
              Diagnosis
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'medical-record' && (
            <div>
              <MedicalRecordScreen
                  prisoners={prisoners}
                  setPrisoners={setPrisoners}
                  loading={loading}
                  setLoading={setLoading}
                  medicalRecords={medicalRecords}
                  bloodGroups={bloodGroups}
                  setBloodGroups={setBloodGroups}
                  setMedicalRecords={setMedicalRecords}
              />
            </div>
          )}

          {activeTab === 'bmi' && (
            <div>
              <BMIScreen
                  prisoners={prisoners}
                  setPrisoners={setPrisoners}
                  loading={loading}
                  setLoading={setLoading}
                  setBmiRecords={setBmiRecords}
                  bmiRecords={bmiRecords}
                  classifications={classifications}
                  setClassifications={setClassifications}
              />
            </div>
          )}

          {activeTab === 'casebook' && (
            <div>
              <CaseBookScreen
                  prisoners={prisoners}
                  setPrisoners={setPrisoners}
                  loading={loading}
                  setLoading={setLoading}
                  caseBooks={caseBooks}
                  setCaseBooks={setCaseBooks}
                  checkupTypes={checkupTypes}
                  setCheckupTypes={setCheckupTypes}
                  presentations={presentations}
                  setPresentations={setPresentations}
              />
            </div>
          )}

          {activeTab === 'schedule' && (
            <div>
              <ScheduleScreen />
            </div>
          )}

          {activeTab === 'labtest' && (
            <div>
              <LabTestScreen />
            </div>
          )}

          {activeTab === 'treatment' && (
            <div>
              <TreatmentScreen />
            </div>
          )}

          {activeTab === 'examresult' && (
            <div>
              <ExamResultScreen />
            </div>
          )}

          {activeTab === 'ailment' && (
            <div>
              <AilmentScreen />
            </div>
          )}

          {activeTab === 'diagnosis' && (
            <div>
              <DiagnosisScreen />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}