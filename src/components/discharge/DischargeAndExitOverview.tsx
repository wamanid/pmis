import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  UserX,
  Users,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Building2,
  Plane,
  Scale,
  UserCheck,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Hospital,
  ShieldAlert,
  Truck,
  FileCheck,
  AlertCircle,
  HeartPulse,
  Calendar,
  TrendingDown,
  HomeIcon,
  MapPin,
  Package,
  Skull,
  Clock,
  ArrowRight,
  Gavel,
  Send,
  BellRing,
  BadgeAlert,
  DollarSign,
  Target,
  Navigation,
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

// Color palette
const COLORS = ['#34D399', '#06B6D4', '#8B5CF6', '#10B981', '#EF4444', '#F59E0B', '#EC4899', '#3B82F6'];

// Mock data for discharge types
const dischargeTypesData = [
  { type: 'Transfer', count: 456, percentage: 38 },
  { type: 'Completion of Sentence', count: 389, percentage: 32 },
  { type: 'Death', count: 78, percentage: 6 },
  { type: 'Deportation', count: 124, percentage: 10 },
  { type: 'Court Order', count: 156, percentage: 13 },
  { type: 'Other', count: 12, percentage: 1 },
];

// Mock data for discharge trends
const dischargeTrendsData = [
  { month: 'Jan', transfers: 45, completions: 38, deaths: 6, deportations: 12, courtOrders: 15 },
  { month: 'Feb', transfers: 48, completions: 42, deaths: 5, deportations: 10, courtOrders: 18 },
  { month: 'Mar', transfers: 52, completions: 39, deaths: 7, deportations: 11, courtOrders: 14 },
  { month: 'Apr', transfers: 49, completions: 45, deaths: 6, deportations: 13, courtOrders: 16 },
  { month: 'May', transfers: 55, completions: 41, deaths: 8, deportations: 9, courtOrders: 19 },
  { month: 'Jun', transfers: 51, completions: 44, deaths: 7, deportations: 14, courtOrders: 17 },
];

// Mock data for exit types
const exitTypesData = [
  { type: 'Escape', count: 23, color: '#EF4444' },
  { type: 'Death in Custody', count: 45, color: '#8B5CF6' },
  { type: 'Medical Emergency Exit', count: 12, color: '#F59E0B' },
  { type: 'Other', count: 5, color: '#06B6D4' },
];

// Mock data for escapee descriptions
const escapeeData = [
  { category: 'Captured & Returned', count: 12, percentage: 52 },
  { category: 'Still at Large', count: 8, percentage: 35 },
  { category: 'Deceased', count: 3, percentage: 13 },
];

// Mock data for death notifications
const deathNotificationsData = [
  { recipient: 'Commissioner General', sent: 45, pending: 2 },
  { recipient: 'Medical Officer', sent: 45, pending: 0 },
  { recipient: 'CAO (District)', sent: 43, pending: 4 },
  { recipient: 'IGP', sent: 44, pending: 3 },
  { recipient: 'RPC', sent: 45, pending: 2 },
  { recipient: 'DPC', sent: 44, pending: 3 },
  { recipient: 'RDC', sent: 42, pending: 5 },
];

// Mock data for death causes
const deathCausesData = [
  { cause: 'Natural Causes', count: 18, percentage: 40 },
  { cause: 'Medical Complications', count: 12, percentage: 27 },
  { cause: 'Accidents', count: 8, percentage: 18 },
  { cause: 'Unknown/Under Investigation', count: 7, percentage: 15 },
];

// Mock data for non-custodial sentences
const nonCustodialSentencesData = [
  { type: 'Community Service', count: 89, color: '#10B981' },
  { type: 'Caution & Discharge', count: 67, color: '#34D399' },
  { type: 'Probation', count: 54, color: '#06B6D4' },
  { type: 'Fines Paid at Court', count: 78, color: '#8B5CF6' },
  { type: 'Other', count: 23, color: '#3B82F6' },
];

// Mock data for morgue discharges
const morgueDischargesData = [
  { month: 'Jan', withNextOfKin: 5, withoutNextOfKin: 2 },
  { month: 'Feb', withNextOfKin: 4, withoutNextOfKin: 1 },
  { month: 'Mar', withNextOfKin: 6, withoutNextOfKin: 3 },
  { month: 'Apr', withNextOfKin: 5, withoutNextOfKin: 2 },
  { month: 'May', withNextOfKin: 7, withoutNextOfKin: 2 },
  { month: 'Jun', withNextOfKin: 6, withoutNextOfKin: 1 },
];

// Mock data for subsistence allowance disposal
const subsistenceAllowanceData = [
  { quarter: 'Q1 2024', disposed: 234000, retained: 12000 },
  { quarter: 'Q2 2024', disposed: 289000, retained: 8000 },
  { quarter: 'Q3 2024', disposed: 267000, retained: 15000 },
  { quarter: 'Q4 2024', disposed: 312000, retained: 9000 },
];

// Mock data for discharge alerts
const dischargeAlertsData = [
  { status: 'Complete', count: 145, percentage: 78 },
  { status: 'Pending Approval', count: 28, percentage: 15 },
  { status: 'Incomplete', count: 13, percentage: 7 },
];

// Mock data for destination tracking
const destinationTrackingData = [
  { destination: 'Home Address', count: 234, percentage: 45 },
  { destination: 'Transfer Station', count: 189, percentage: 36 },
  { destination: 'Country of Origin', count: 67, percentage: 13 },
  { destination: 'Unknown/Not Specified', count: 32, percentage: 6 },
];

// Mock data for transfer destinations
const transferDestinationsData = [
  { station: 'Luzira Prison', count: 89 },
  { station: 'Kitalya Prison', count: 76 },
  { station: 'Kauga Prison', count: 54 },
  { station: 'Murchison Bay', count: 67 },
  { station: 'Fort Portal Prison', count: 43 },
  { station: 'Other Stations', count: 127 },
];

// Mock data for property items provided
const propertyItemsData = [
  { item: 'Clothing', count: 423, percentage: 35 },
  { item: 'Personal Belongings', count: 389, percentage: 32 },
  { item: 'Documents', count: 298, percentage: 25 },
  { item: 'Money/Savings', count: 67, percentage: 6 },
  { item: 'Other Items', count: 23, percentage: 2 },
];

// Mock data for deportation countries
const deportationCountriesData = [
  { country: 'Rwanda', count: 34 },
  { country: 'Kenya', count: 28 },
  { country: 'Tanzania', count: 21 },
  { country: 'DRC', count: 18 },
  { country: 'Burundi', count: 12 },
  { country: 'Other', count: 11 },
];

// Summary statistics
const summaryStats = {
  totalDischarges: 1215,
  pendingDischarges: 45,
  totalExits: 85,
  escapees: 23,
  deaths: 45,
  transfers: 456,
  deportations: 124,
  nonCustodialDischarges: 311,
  morgueDischarges: 45,
  completionRate: 92,
  alertsPending: 13,
  subsistenceDisposed: 1102000,
};

export const DischargeAndExitOverview: React.FC = () => {
  const [dischargeTypeCollapsed, setDischargeTypeCollapsed] = useState(false);
  const [exitTypeCollapsed, setExitTypeCollapsed] = useState(false);
  const [deathCollapsed, setDeathCollapsed] = useState(false);
  const [nonCustodialCollapsed, setNonCustodialCollapsed] = useState(false);
  const [trackingCollapsed, setTrackingCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Discharge & Exit Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and insights on prisoner discharges, exits, transfers, deportations, and death management
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <FileText className="h-4 w-4" />
              Total Discharges
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl">{summaryStats.totalDischarges.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                All discharge records
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600">{summaryStats.pendingDischarges} pending</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <AlertTriangle className="h-4 w-4" />
              Exits & Escapes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                {summaryStats.totalExits}
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                Total Exit Events
              </p>
              <div className="text-sm text-red-600">
                {summaryStats.escapees} escapees recorded
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Skull className="h-4 w-4" />
              Death Management
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Deaths:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.deaths}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">To Morgue:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.morgueDischarges}</span>
              </div>
              <div className="text-xs text-muted-foreground">Death notifications tracked</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Target className="h-4 w-4" />
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Discharge Rate:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.completionRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Alerts Pending:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.alertsPending}</span>
              </div>
              <div className="text-xs text-muted-foreground">Process tracking metrics</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discharge Types Section */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <ClipboardList className="h-5 w-5" />
              Discharge Types Distribution
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDischargeTypeCollapsed(!dischargeTypeCollapsed)}
            >
              {dischargeTypeCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!dischargeTypeCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Discharge Type Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dischargeTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dischargeTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar Chart */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Discharge Counts by Type</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dischargeTypesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#34D399" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Discharge Trends Over Time */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            <TrendingUp className="h-5 w-5" />
            Discharge Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={dischargeTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="transfers" stroke="#34D399" strokeWidth={2} name="Transfers" />
              <Line type="monotone" dataKey="completions" stroke="#06B6D4" strokeWidth={2} name="Completions" />
              <Line type="monotone" dataKey="deaths" stroke="#EF4444" strokeWidth={2} name="Deaths" />
              <Line type="monotone" dataKey="deportations" stroke="#8B5CF6" strokeWidth={2} name="Deportations" />
              <Line type="monotone" dataKey="courtOrders" stroke="#10B981" strokeWidth={2} name="Court Orders" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Transfer Destinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 shadow-sm">
          <CardHeader style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Building2 className="h-5 w-5" />
              Transfer Destinations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transferDestinationsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="station" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#34D399" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm">
          <CardHeader style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Plane className="h-5 w-5" />
              Deportation by Country
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deportationCountriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Property Items Provided */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            <Package className="h-5 w-5" />
            Property Items Provided at Discharge
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyItemsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ item, percentage }) => `${item}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {propertyItemsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {propertyItemsData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.item}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: '#650000' }}>
                      {item.count}
                    </span>
                    <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exit Types & Escapes Section */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <AlertCircle className="h-5 w-5" />
              Exit Types & Escape Management
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExitTypeCollapsed(!exitTypeCollapsed)}
            >
              {exitTypeCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!exitTypeCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exit Types */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Exit Event Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={exitTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {exitTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Escapee Status */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Escapee Status (PF13 Reports)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={escapeeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#EF4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Death Management Section */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Skull className="h-5 w-5" />
              Death Management & Notifications (PF21 & PF22)
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeathCollapsed(!deathCollapsed)}
            >
              {deathCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!deathCollapsed && (
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Death Causes */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Causes of Death (Death Certificates - PF21)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deathCausesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="cause" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Death Notifications */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Death Notifications Status (PF22)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={deathNotificationsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="recipient" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" fill="#10B981" name="Sent" />
                    <Bar dataKey="pending" fill="#EF4444" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Morgue Discharges */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Morgue/Mortuary Discharges</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={morgueDischargesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="withNextOfKin" stackId="1" stroke="#10B981" fill="#10B981" name="With Next of Kin" />
                    <Area type="monotone" dataKey="withoutNextOfKin" stackId="1" stroke="#EF4444" fill="#EF4444" name="Without Next of Kin" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Non-Custodial Sentences */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <Gavel className="h-5 w-5" />
              Non-Custodial Sentence Discharges
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNonCustodialCollapsed(!nonCustodialCollapsed)}
            >
              {nonCustodialCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!nonCustodialCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={nonCustodialSentencesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {nonCustodialSentencesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Remand prisoners discharged upon conviction and sentencing to non-custodial sentences (Guideline 10, Sentencing Guidelines 2013)
                </p>
                {nonCustodialSentencesData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.type}</span>
                    </div>
                    <span className="text-sm" style={{ color: '#650000' }}>
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Subsistence Allowance Disposal */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            <DollarSign className="h-5 w-5" />
            Unused Subsistence Allowance Disposal
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-4 p-4 bg-green-50 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="h-6 w-6" style={{ color: '#650000' }} />
              <div>
                <p className="text-sm text-muted-foreground">Total Disposed to Judgment Creditors</p>
                <p className="text-2xl" style={{ color: '#650000' }}>
                  UGX {summaryStats.subsistenceDisposed.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={subsistenceAllowanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="disposed" fill="#10B981" name="Disposed to Creditor" />
              <Bar dataKey="retained" fill="#EF4444" name="Retained/Unclaimed" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Auto-Tracking & Alerts */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
              <BellRing className="h-5 w-5" />
              Auto-Tracking & Discharge Alerts
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTrackingCollapsed(!trackingCollapsed)}
            >
              {trackingCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!trackingCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Discharge Alert Status */}
              <div>
                <h3 className="text-sm mb-4" style={{ color: '#650000' }}>Discharge Process Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dischargeAlertsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, percentage }) => `${status}: ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dischargeAlertsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Alert Recipients */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Auto-tracking generates alerts for deceased prisoner discharge completion
                </p>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeAlert className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Alert Recipients:</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>• Station Gate</li>
                    <li>• Receptionist</li>
                    <li>• In-charge Reception</li>
                    <li>• Officer in Charge</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Final Approval:</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    Officer in Charge approval required for discharge completion
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Destination Tracking */}
      <Card className="border-2 shadow-sm">
        <CardHeader style={{ backgroundColor: '#faebd7' }}>
          <CardTitle className="flex items-center gap-2" style={{ color: '#650000' }}>
            <Navigation className="h-5 w-5" />
            Next Destination Tracking (Auto-Fetch)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={destinationTrackingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="destination" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                "Next Destination on Discharge" field auto-fetches from "Address on Discharge" in Discharge Board Summary
              </p>
              {destinationTrackingData.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" style={{ color: '#650000' }} />
                    <span className="text-sm">{item.destination}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: '#650000' }}>
                      {item.count}
                    </span>
                    <span className="text-xs text-muted-foreground">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
