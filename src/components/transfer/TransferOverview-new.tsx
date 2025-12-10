import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  ArrowLeftRight,
  Users,
  FileText,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Activity,
  ChevronDown,
  ChevronUp,
  Car,
  Hospital,
  Scale,
  Briefcase,
  Truck,
  Fingerprint,
  FilePlus,
  MapPin,
  Gavel,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Mock data for transfer reasons
const transferReasonsData = [
  { reason: 'Medical Reasons', count: 234, percentage: 28 },
  { reason: 'Congestion Relief', count: 189, percentage: 23 },
  { reason: 'Security Concerns', count: 156, percentage: 19 },
  { reason: 'Labor Needs', count: 123, percentage: 15 },
  { reason: 'Near Release/Home', count: 89, percentage: 11 },
  { reason: 'Other', count: 34, percentage: 4 },
];

// Mock data for transfer trends
const transferTrendsData = [
  { month: 'Jan', transferOut: 67, transferIn: 64, lodgersOut: 23, lodgersIn: 25 },
  { month: 'Feb', transferOut: 78, transferIn: 75, lodgersOut: 28, lodgersIn: 26 },
  { month: 'Mar', transferOut: 89, transferIn: 92, lodgersOut: 31, lodgersIn: 29 },
  { month: 'Apr', transferOut: 82, transferIn: 79, lodgersOut: 25, lodgersIn: 27 },
  { month: 'May', transferOut: 95, transferIn: 98, lodgersOut: 34, lodgersIn: 32 },
  { month: 'Jun', transferOut: 103, transferIn: 101, lodgersOut: 38, lodgersIn: 36 },
];

// Mock data for escort team types
const escortTeamData = [
  { type: 'Transfer Escorts', active: 45, deployed: 38 },
  { type: 'Hospital Escorts', active: 32, deployed: 28 },
  { type: 'Court Escorts', active: 56, deployed: 51 },
  { type: 'Labor Party Escorts', active: 28, deployed: 22 },
];

// Mock data for lodgers tracking
const lodgersData = [
  { status: 'Lodgers In', value: 156, color: '#34D399' },
  { status: 'Lodgers Out', value: 142, color: '#10B981' },
  { status: 'In Transit', value: 34, color: '#06B6D4' },
  { status: 'Medical Lodgers', value: 67, color: '#8B5CF6' },
];

// Mock data for transfer approval status
const transferApprovalData = [
  { status: 'Pending RPC Approval', value: 45, color: '#8B5CF6' },
  { status: 'Pending CGP Approval', value: 23, color: '#06B6D4' },
  { status: 'Approved', value: 189, color: '#10B981' },
  { status: 'Rejected', value: 12, color: '#EF4444' },
  { status: 'Cancelled', value: 8, color: '#EF4444' },
];

// Mock data for transfer by region
const transferByRegionData = [
  { region: 'Central', inbound: 89, outbound: 84 },
  { region: 'Eastern', inbound: 67, outbound: 72 },
  { region: 'Western', inbound: 78, outbound: 75 },
  { region: 'Northern', inbound: 56, outbound: 61 },
  { region: 'Kampala', inbound: 92, outbound: 88 },
];

// Mock data for pre-release transfers
const preReleaseTransferData = [
  { category: 'Due in 1 Month', count: 34, alerts: 28 },
  { category: 'Due in 2 Months', count: 56, alerts: 45 },
  { category: 'Due in 3 Months', count: 78, alerts: 62 },
  { category: 'Due in 4-6 Months', count: 123, alerts: 89 },
];

// Mock data for transfer conditions analysis
const transferConditionsData = [
  { condition: 'Congestion', score: 85 },
  { condition: 'Medical', score: 72 },
  { condition: 'Near Home', score: 68 },
  { condition: 'Security', score: 79 },
  { condition: 'Labor Needs', score: 63 },
  { condition: 'Discipline', score: 58 },
];

// Mock data for biometric verification
const biometricVerificationData = [
  { month: 'Jan', verified: 95, failed: 3, manualOverride: 2 },
  { month: 'Feb', verified: 97, failed: 2, manualOverride: 1 },
  { month: 'Mar', verified: 98, failed: 1, manualOverride: 1 },
  { month: 'Apr', verified: 96, failed: 2, manualOverride: 2 },
  { month: 'May', verified: 99, failed: 0, manualOverride: 1 },
  { month: 'Jun', verified: 98, failed: 1, manualOverride: 1 },
];

// Mock data for punishment transfers
const punishmentTransfersData = [
  { type: 'With Active Punishment', count: 89, percentage: 42 },
  { type: 'Punishment Completed', count: 78, percentage: 37 },
  { type: 'No Punishment', count: 45, percentage: 21 },
];

// Mock data for automatic admissions
const autoAdmissionData = [
  { month: 'Jan', successful: 62, failed: 2 },
  { month: 'Feb', successful: 73, failed: 2 },
  { month: 'Mar', successful: 88, failed: 1 },
  { month: 'Apr', successful: 77, failed: 2 },
  { month: 'May', successful: 96, failed: 1 },
  { month: 'Jun', successful: 99, failed: 2 },
];

// Mock data for special cases
const specialCasesData = [
  { case: 'Deceased on Transfer', count: 3, color: '#EF4444' },
  { case: 'Cancelled Transfers', count: 23, color: '#8B5CF6' },
  { case: 'Emergency Transfers', count: 45, color: '#06B6D4' },
  { case: 'Court-Ordered Transfers', count: 67, color: '#34D399' },
];

// Summary statistics
const summaryStats = {
  totalTransfersThisMonth: 204,
  activeLodgers: 156,
  pendingApprovals: 68,
  escortTeamsDeployed: 139,
  biometricSuccessRate: 97.8,
  autoAdmissionRate: 98.2,
  preReleaseAlerts: 224,
  regionalTransfers: 89,
};

interface TransferOverviewProps {
  onNavigate?: (page: string) => void;
}

export const TransferOverview: React.FC<TransferOverviewProps> = ({ onNavigate }) => {
  const [transferReasonsCollapsed, setTransferReasonsCollapsed] = useState(false);
  const [transferTrendsCollapsed, setTransferTrendsCollapsed] = useState(false);
  const [escortTeamsCollapsed, setEscortTeamsCollapsed] = useState(false);
  const [lodgersCollapsed, setLodgersCollapsed] = useState(false);
  const [approvalStatusCollapsed, setApprovalStatusCollapsed] = useState(false);
  const [regionTransferCollapsed, setRegionTransferCollapsed] = useState(false);
  const [preReleaseCollapsed, setPreReleaseCollapsed] = useState(false);
  const [conditionsCollapsed, setConditionsCollapsed] = useState(false);
  const [biometricCollapsed, setBiometricCollapsed] = useState(false);
  const [punishmentCollapsed, setPunishmentCollapsed] = useState(false);
  const [autoAdmissionCollapsed, setAutoAdmissionCollapsed] = useState(false);
  const [specialCasesCollapsed, setSpecialCasesCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Transfer Management Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and insights on prisoner transfers, lodgers, escort teams, and approval workflows
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <ArrowLeftRight className="h-4 w-4" />
              Total Transfers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl">{summaryStats.totalTransfersThisMonth.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Transfers This Month
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">+15% from last month</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Users className="h-4 w-4" />
              Active Lodgers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                {summaryStats.activeLodgers}
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                Temporary Lodgers
              </p>
              <div className="text-sm text-blue-600">
                In transit & medical
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Shield className="h-4 w-4" />
              Escort Teams
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                {summaryStats.escortTeamsDeployed}
                <Car className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                Currently Deployed
              </p>
              <div className="text-sm text-purple-600">
                4 escort categories
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <AlertTriangle className="h-4 w-4" />
              Alerts & Approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending Approvals:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.pendingApprovals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pre-Release Alerts:</span>
                <span className="text-sm text-orange-600">{summaryStats.preReleaseAlerts}</span>
              </div>
              <div className="text-xs text-muted-foreground">Requires attention</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Fingerprint className="h-4 w-4" />
              Biometric Verification Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#10B981' }}>
                  {summaryStats.biometricSuccessRate}%
                </span>
                <CheckCircle2 className="h-6 w-6 mb-1" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Success rate for prisoner verification during transfers
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${summaryStats.biometricSuccessRate}%`,
                    backgroundColor: '#10B981'
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <FilePlus className="h-4 w-4" />
              Auto-Admission Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#06B6D4' }}>
                  {summaryStats.autoAdmissionRate}%
                </span>
                <CheckCircle2 className="h-6 w-6 mb-1" style={{ color: '#06B6D4' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Automatic admissions processed successfully on transfer
              </p>
              <div className="text-sm" style={{ color: '#06B6D4' }}>
                Seamless lockup recalculation
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Transfer Reasons & Transfer Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Reasons */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setTransferReasonsCollapsed(!transferReasonsCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <FileText className="h-4 w-4" />
                Transfer Reasons Breakdown
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTransferReasonsCollapsed(!transferReasonsCollapsed);
                }}
              >
                {transferReasonsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!transferReasonsCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transferReasonsData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ reason, percentage }) => `${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {transferReasonsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#34D399', '#10B981', '#06B6D4', '#8B5CF6', '#EF4444', '#34D399'][index % 6]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Transfer Trends */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setTransferTrendsCollapsed(!transferTrendsCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <TrendingUp className="h-4 w-4" />
                Transfer & Lodger Trends
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTransferTrendsCollapsed(!transferTrendsCollapsed);
                }}
              >
                {transferTrendsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!transferTrendsCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={transferTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="transferOut" fill="#34D399" name="Transfer Out" />
                  <Bar dataKey="transferIn" fill="#10B981" name="Transfer In" />
                  <Line
                    type="monotone"
                    dataKey="lodgersOut"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    name="Lodgers Out"
                    dot={{ fill: '#06B6D4', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="lodgersIn"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    name="Lodgers In"
                    dot={{ fill: '#8B5CF6', r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Row 2: Escort Teams & Lodgers Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Escort Teams */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setEscortTeamsCollapsed(!escortTeamsCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Car className="h-4 w-4" />
                Escort Team Distribution
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setEscortTeamsCollapsed(!escortTeamsCollapsed);
                }}
              >
                {escortTeamsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!escortTeamsCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={escortTeamData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#34D399" name="Active Teams" />
                  <Bar dataKey="deployed" fill="#06B6D4" name="Currently Deployed" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Lodgers Tracking */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setLodgersCollapsed(!lodgersCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Users className="h-4 w-4" />
                Lodgers Tracking & Distribution
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLodgersCollapsed(!lodgersCollapsed);
                }}
              >
                {lodgersCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!lodgersCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lodgersData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, value }) => `${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {lodgersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Row 3: Approval Status & Regional Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval Status */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setApprovalStatusCollapsed(!approvalStatusCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <CheckCircle2 className="h-4 w-4" />
                Transfer Approval Status
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setApprovalStatusCollapsed(!approvalStatusCollapsed);
                }}
              >
                {approvalStatusCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!approvalStatusCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={transferApprovalData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, value }) => `${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {transferApprovalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Regional Transfers */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setRegionTransferCollapsed(!regionTransferCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <MapPin className="h-4 w-4" />
                Transfers by Region
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setRegionTransferCollapsed(!regionTransferCollapsed);
                }}
              >
                {regionTransferCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!regionTransferCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transferByRegionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inbound" fill="#34D399" name="Inbound" />
                  <Bar dataKey="outbound" fill="#06B6D4" name="Outbound" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Row 4: Pre-Release Transfers & Transfer Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pre-Release Transfers */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setPreReleaseCollapsed(!preReleaseCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Clock className="h-4 w-4" />
                Pre-Release Transfer Alerts
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPreReleaseCollapsed(!preReleaseCollapsed);
                }}
              >
                {preReleaseCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!preReleaseCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={preReleaseTransferData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#34D399" name="Total" />
                  <Line
                    type="monotone"
                    dataKey="alerts"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Alerts"
                    dot={{ fill: '#EF4444', r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Transfer Conditions */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setConditionsCollapsed(!conditionsCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Activity className="h-4 w-4" />
                Transfer Conditions Analysis
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setConditionsCollapsed(!conditionsCollapsed);
                }}
              >
                {conditionsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!conditionsCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={transferConditionsData}>
                  <PolarGrid stroke="#06B6D4" />
                  <PolarAngleAxis dataKey="condition" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Condition Score"
                    dataKey="score"
                    stroke="#34D399"
                    fill="#34D399"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Row 5: Biometric Verification & Punishment Transfers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biometric Verification */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setBiometricCollapsed(!biometricCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Fingerprint className="h-4 w-4" />
                Biometric Verification Trends
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setBiometricCollapsed(!biometricCollapsed);
                }}
              >
                {biometricCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!biometricCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={biometricVerificationData}>
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="verified"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#colorVerified)"
                    name="Verified"
                  />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Failed"
                    dot={{ fill: '#EF4444', r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Punishment Transfers */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setPunishmentCollapsed(!punishmentCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Gavel className="h-4 w-4" />
                Punishment Status on Transfer
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPunishmentCollapsed(!punishmentCollapsed);
                }}
              >
                {punishmentCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!punishmentCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={punishmentTransfersData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, percentage }) => `${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {punishmentTransfersData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#EF4444', '#8B5CF6', '#10B981'][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Row 6: Auto Admission & Special Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto Admission */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setAutoAdmissionCollapsed(!autoAdmissionCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <FilePlus className="h-4 w-4" />
                Automatic Admission Results
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAutoAdmissionCollapsed(!autoAdmissionCollapsed);
                }}
              >
                {autoAdmissionCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!autoAdmissionCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={autoAdmissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="successful" fill="#10B981" name="Successful" />
                  <Line
                    type="monotone"
                    dataKey="failed"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Failed"
                    dot={{ fill: '#EF4444', r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Special Cases */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setSpecialCasesCollapsed(!specialCasesCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <AlertTriangle className="h-4 w-4" />
                Special Cases & Alerts
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSpecialCasesCollapsed(!specialCasesCollapsed);
                }}
              >
                {specialCasesCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!specialCasesCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={specialCasesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="case" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Count">
                    {specialCasesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TransferOverview;
