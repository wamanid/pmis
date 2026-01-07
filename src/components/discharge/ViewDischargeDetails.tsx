import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { LogOut, Wallet, Package, Info } from 'lucide-react';
import PrisonerSearchScreenWider from '../common/PrisonerSearchScreen-wider';
import { PrisonerDischargeList } from './dischargeList/PrisonerDischargeList';
import { DischargeChecklistItemList } from './DischargeChecklistItemList';
import { DischargeChildHandoverList } from './childHandover/DischargeChildHandoverList';
import { DischargeDeceasedList } from './DischargeDeceasedList';
import { DischargeDocumentList } from './DischargeDocumentList';
import { DischargeByExecutionList } from './DischargeByExecutionList';
import { DischargeOfficersList } from './DischargeOfficersList';
import { SubsistenceAllowancesList } from './subsistence/SubsistenceAllowancesList';
import { DischargeSuspendedSentenceList } from './suspended/DischargeSuspendedSentenceList';
import { DischargeRequestList } from './request/DischargeRequestList';
import {
  Allowance,
  ChildHandover,
  ChildItem,
  DischargeRequest,
  DischargeType,
  DocumentType
} from "../../services/discharge/discharge";
import {Unit} from "../../services/stationServices/visitorsServices/visitorItem";
import {PrisonerItem, RelationShipItem} from "../../services/stationServices/visitorsServices/VisitorsService";
import {StaffItem} from "../../services/stationServices/staffDeploymentService";

// Mock data for discharge details
const mockDischargeData = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  prisoner_name: 'John Doe',
  prisoner_number: 'UPS2024000001',
  discharge_type_name: 'Release',
  discharge_reason_name: 'End of Sentence',
  discharge_datetime: '2025-12-16T10:30:00Z',
  remarks: 'Prisoner discharged successfully',
  intended_place_of_stay: '123 Main Street, Kampala',
  property_accounts: [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      account_type: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      account_type_name: 'PP Account',
      balance: '150000.00',
      currency: 'UGX',
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      account_type: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      account_type_name: 'Savings Account',
      balance: '50000.00',
      currency: 'UGX',
    },
  ],
  properties: [
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      property_type: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      property_type_name: 'Incoming',
      property_item: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      property_item_name: 'Mobile Phone',
      quantity: '1.00',
      measurement_unit: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      measurement_unit_name: 'Piece',
      amount: null,
      property_status: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      property_status_name: 'In Store',
      bag_number: 'UUPCSH2025000001',
      note: 'Samsung Galaxy S21',
      destination: '',
    },
    {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      property_type: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      property_type_name: 'Incoming',
      property_item: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
      property_item_name: 'Clothing',
      quantity: '3.00',
      measurement_unit: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      measurement_unit_name: 'Piece',
      amount: null,
      property_status: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      property_status_name: 'In Store',
      bag_number: 'UUPCSH2025000001',
      note: '2 shirts, 1 trouser',
      destination: '',
    },
  ],
};

type TabType =
  | 'requests'
  | 'discharge-detail'
  | 'child-handovers'
  | 'subsistence'
  | 'suspended';

export interface Loader {
  discharge: boolean
  request: boolean
  subsistence: boolean
  suspended: boolean
  child: boolean
}

export default function ViewDischargeDetails() {
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('discharge-detail');

  // API integration
  const [loading, setLoading] = useState<Loader>({ discharge: true, request: true, subsistence: true, suspended: true, child: true })
  const [types, setTypes] = useState<DischargeType[]>([])
  const [reasons, setReasons] = useState<Unit[]>([])

  const [prisoners, setPrisoners] = useState<PrisonerItem[]>([])
  const [dischargeRequests, setDischargeRequests] = useState<DischargeRequest[]>([]);
  const [staff, setStaff] = useState<StaffItem[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([])

  const [originalChildren, setOriginalChildren] = useState<ChildItem[]>([])
  const [handovers, setHandovers] = useState<ChildHandover[]>([])
  const [relationships, setRelationships] = useState<RelationShipItem[]>([])
  const [allowances, setAllowances] = useState<Allowance[]>([]);

  const handlePrisonerChange = (prisonerId: string) => {
    setSelectedPrisonerId(prisonerId);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'requests':
        return <DischargeRequestList loading={loading} setLoading={setLoading} types={types} setTypes={setTypes}
                                     reasons={reasons} setReasons={setReasons} prisoners={prisoners} staff={staff}
                                     setStaff={setStaff} setPrisoners={setPrisoners} dischargeRequests={dischargeRequests}
                                     setDischargeRequests={setDischargeRequests}
        />;
      case 'discharge-detail':
        return <PrisonerDischargeList loading={loading} setLoading={setLoading} types={types} setTypes={setTypes}
                                      reasons={reasons} setReasons={setReasons} dischargeRequests={dischargeRequests}
                                      setDischargeRequests={setDischargeRequests} staff={staff} setStaff={setStaff}
                                      prisoners={prisoners} setPrisoners={setPrisoners} documentTypes={documentTypes}
                                      setDocumentTypes={setDocumentTypes}
        />;
      case 'child-handovers':
        return <DischargeChildHandoverList loading={loading} setLoading={setLoading}
               originalChildren={originalChildren} setOriginalChildren={setOriginalChildren}
               handovers={handovers} setHandovers={setHandovers}
               relationships={relationships} setRelationships={setRelationships}
        />;
      case 'subsistence':
        return <SubsistenceAllowancesList loading={loading} setLoading={setLoading} prisoners={prisoners}
                setPrisoners={setPrisoners} allowances={allowances} setAllowances={setAllowances}/>;
      case 'suspended':
        return <DischargeSuspendedSentenceList loading={loading} setLoading={setLoading}
                prisoners={prisoners} setPrisoners={setPrisoners} types={types} setTypes={setTypes}
                reasons={reasons} setReasons={setReasons} dischargeRequests={dischargeRequests} setDischargeRequests={setDischargeRequests}
        />;
      default:
        return <PrisonerDischargeList loading={loading} setLoading={setLoading} types={types} setTypes={setTypes} reasons={reasons} setReasons={setReasons}
                dischargeRequests={dischargeRequests} setDischargeRequests={setDischargeRequests} staff={staff} setStaff={setStaff}
                prisoners={prisoners} setPrisoners={setPrisoners} documentTypes={documentTypes} setDocumentTypes={setDocumentTypes}
        />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <LogOut className="h-6 w-6" />
        <h1 className="text-2xl">Discharge Details</h1>
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

      {/* Discharge Summary Information - Only show if prisoner selected */}
      {selectedPrisonerId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Basic Discharge Information */}
          <Card>
            <div
              className="px-6 py-3"
              style={{ backgroundColor: '#faebd7', color: '#650000' }}
            >
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                <h2>Discharge Information</h2>
              </div>
            </div>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Prisoner Name</p>
                  <p className="font-medium">{mockDischargeData.prisoner_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Prisoner Number</p>
                  <p className="font-medium">{mockDischargeData.prisoner_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discharge Type</p>
                  <p className="font-medium">{mockDischargeData.discharge_type_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discharge Reason</p>
                  <p className="font-medium">{mockDischargeData.discharge_reason_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Discharge Date & Time</p>
                  <p className="font-medium">
                    {new Date(mockDischargeData.discharge_datetime).toLocaleString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Intended Place of Stay</p>
                <p className="font-medium">{mockDischargeData.intended_place_of_stay}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Remarks</p>
                <p className="font-medium">{mockDischargeData.remarks}</p>
              </div>
            </CardContent>
          </Card>

          {/* Property Accounts */}
          <Card>
            <div
              className="px-6 py-3"
              style={{ backgroundColor: '#faebd7', color: '#650000' }}
            >
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                <h2>Property Accounts</h2>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {mockDischargeData.property_accounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{account.account_type_name}</p>
                        <p className="text-sm text-gray-500">Account Type</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold" style={{ color: '#10B981' }}>
                          {parseFloat(account.balance).toLocaleString()} {account.currency}
                        </p>
                        <p className="text-sm text-gray-500">Balance</p>
                      </div>
                    </div>
                  </div>
                ))}
                {mockDischargeData.property_accounts.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No property accounts found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Properties Section */}
      {selectedPrisonerId && mockDischargeData.properties.length > 0 && (
        <Card>
          <div
            className="px-6 py-3"
            style={{ backgroundColor: '#faebd7', color: '#650000' }}
          >
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              <h2>Prisoner Properties</h2>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: '#34D399' }}>
                    <th className="text-left p-3 bg-gray-50">Property Type</th>
                    <th className="text-left p-3 bg-gray-50">Property Item</th>
                    <th className="text-left p-3 bg-gray-50">Quantity</th>
                    <th className="text-left p-3 bg-gray-50">Unit</th>
                    <th className="text-left p-3 bg-gray-50">Status</th>
                    <th className="text-left p-3 bg-gray-50">Bag Number</th>
                    <th className="text-left p-3 bg-gray-50">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDischargeData.properties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{property.property_type_name}</td>
                      <td className="p-3">{property.property_item_name}</td>
                      <td className="p-3">{property.quantity}</td>
                      <td className="p-3">{property.measurement_unit_name}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                          {property.property_status_name}
                        </span>
                      </td>
                      <td className="p-3">{property.bag_number}</td>
                      <td className="p-3">{property.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discharge Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'requests'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'requests' ? '#650000' : undefined,
              }}
            >
              Requests
            </button>
            <button
              onClick={() => setActiveTab('discharge-detail')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'discharge-detail'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'discharge-detail' ? '#650000' : undefined,
              }}
            >
              Discharge Detail
            </button>
            <button
              onClick={() => setActiveTab('child-handovers')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'child-handovers'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'child-handovers' ? '#650000' : undefined,
              }}
            >
              Child Handovers
            </button>
            <button
              onClick={() => setActiveTab('subsistence')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'subsistence'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'subsistence' ? '#650000' : undefined,
              }}
            >
              Subsistence Allowance
            </button>
            <button
              onClick={() => setActiveTab('suspended')}
              className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                activeTab === 'suspended'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'suspended' ? '#650000' : undefined,
              }}
            >
              Suspended Sentences
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">{renderTabContent()}</div>
        </CardContent>
      </Card>



    </div>
  );
}