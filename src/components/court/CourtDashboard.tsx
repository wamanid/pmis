import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { StatCard } from '../common/StatCard';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Scale,
  Calendar,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  UserCheck,
  UserX,
  Eye,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CourtDashboardProps {
  onNavigate?: (page: string) => void;
}

// Mock data for upcoming court appearances
const upcomingAppearances = [
  { date: '2024-11-04', count: 45, type: 'High Court' },
  { date: '2024-11-05', count: 32, type: 'Magistrate Court' },
  { date: '2024-11-06', count: 28, type: 'Chief Magistrate' },
  { date: '2024-11-07', count: 51, type: 'Family Court' },
  { date: '2024-11-08', count: 38, type: 'High Court' },
];

// Mock data for admissions from court by gender
const admissionsByGender = [
  { name: 'Male', value: 342, percentage: 78 },
  { name: 'Female', value: 96, percentage: 22 },
];

// Mock data for admissions from court by prisoner type
const admissionsByType = [
  { name: 'Remand', value: 187, color: '#650000' },
  { name: 'Awaiting Trial', value: 143, color: '#8B0000' },
  { name: 'Convict', value: 78, color: '#A52A2A' },
  { name: 'Civil Debtor', value: 30, color: '#CD5C5C' },
];

// Mock data for court attendance by types
const attendanceByType = [
  { type: 'Bail Hearing', attended: 234, missed: 12 },
  { type: 'Sentencing', attended: 156, missed: 8 },
  { type: 'Case Mention', attended: 198, missed: 15 },
  { type: 'Appeal', attended: 87, missed: 5 },
  { type: 'Trial', attended: 245, missed: 18 },
];

// Mock data for cases by court type
const casesByCourtType = [
  { court: 'High Court', pending: 456, scheduled: 123, completed: 234 },
  { court: 'Chief Magistrate', pending: 678, scheduled: 189, completed: 345 },
  { court: 'Magistrate Court', pending: 892, scheduled: 267, completed: 456 },
  { court: 'Family Court', pending: 234, scheduled: 78, completed: 123 },
  { court: 'Commercial Court', pending: 145, scheduled: 45, completed: 89 },
];

// Mock data for case backlog statistics
const backlogStats = [
  { range: '0-3 months', count: 234, percentage: 15 },
  { range: '3-6 months', count: 456, percentage: 30 },
  { range: '6-12 months', count: 567, percentage: 37 },
  { range: '12+ months', count: 278, percentage: 18 },
];

// Mock data for cause list statistics
const causeListStats = {
  totalCases: 1535,
  scheduledToday: 89,
  scheduledThisWeek: 342,
  scheduledThisMonth: 1089,
  unscheduled: 446,
};

// Mock data for court discharges
const dischargeData = [
  { month: 'Jul', acquitted: 34, bail: 45, completed: 23 },
  { month: 'Aug', acquitted: 42, bail: 38, completed: 28 },
  { month: 'Sep', acquitted: 38, bail: 52, completed: 31 },
  { month: 'Oct', acquitted: 45, bail: 48, completed: 35 },
  { month: 'Nov', acquitted: 41, bail: 55, completed: 29 },
];

// Mock data for court visitation statistics
const visitationStats = {
  totalVisits: 2456,
  approvedVisits: 2234,
  rejectedVisits: 156,
  pendingVisits: 66,
  averagePerDay: 87,
};

const COLORS = ['#650000', '#8B0000', '#A52A2A', '#CD5C5C', '#DC143C'];

export function CourtDashboard({ onNavigate }: CourtDashboardProps) {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedStation, setSelectedStation] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <Scale className="h-6 w-6" />
        <h1 className="text-2xl">Court Overview Dashboard</h1>
      </div>

      {/* Filters */}
      <Card style={{ borderTop: '3px solid #650000' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm mb-2 block">Region</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="central">Central Region</SelectItem>
                  <SelectItem value="eastern">Eastern Region</SelectItem>
                  <SelectItem value="western">Western Region</SelectItem>
                  <SelectItem value="northern">Northern Region</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-2 block">District</label>
              <Select
                value={selectedDistrict}
                onValueChange={setSelectedDistrict}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  <SelectItem value="kampala">Kampala</SelectItem>
                  <SelectItem value="wakiso">Wakiso</SelectItem>
                  <SelectItem value="mukono">Mukono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-2 block">Station</label>
              <Select value={selectedStation} onValueChange={setSelectedStation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Station" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stations</SelectItem>
                  <SelectItem value="luzira">Luzira Prison</SelectItem>
                  <SelectItem value="kigo">Kigo Prison</SelectItem>
                  <SelectItem value="kitalya">Kitalya Prison</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cases"
          value="1,535"
          icon={FileText}
          trend="+12.5%"
          description="from last month"
          color="#650000"
        />
        <StatCard
          title="Scheduled Today"
          value="89"
          icon={Calendar}
          trend="+5"
          description="from yesterday"
          color="#650000"
        />
        <StatCard
          title="Case Backlog"
          value="1,535"
          icon={AlertTriangle}
          trend="-8.3%"
          description="from last month"
          color="#650000"
        />
        <StatCard
          title="Court Visits"
          value="2,456"
          icon={Users}
          trend="+18.2%"
          description="this month"
          color="#650000"
        />
      </div>

      {/* Row 1: Upcoming Court Appearances & Admissions by Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Court Appearances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" style={{ color: '#650000' }} />
              Upcoming Court Appearances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={upcomingAppearances}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#650000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Admissions from Court by Gender */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#650000' }} />
              Admissions from Court by Gender
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={admissionsByGender}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {admissionsByGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {admissionsByGender.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Admissions by Type & Court Attendance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admissions from Court by Prisoner Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" style={{ color: '#650000' }} />
              Admissions by Prisoner Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={admissionsByType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#650000">
                  {admissionsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Court Attendance by Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" style={{ color: '#650000' }} />
              Court Attendance by Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceByType.map((item) => {
                const total = item.attended + item.missed;
                const attendedPercentage = (item.attended / total) * 100;
                return (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item.type}</span>
                      <span className="text-muted-foreground">
                        {item.attended}/{total}
                      </span>
                    </div>
                    <Progress value={attendedPercentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Cases by Court Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" style={{ color: '#650000' }} />
            Cases to be Handled by Different Courts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow style={{ backgroundColor: '#650000' }}>
                  <TableHead className="text-white">Court Type</TableHead>
                  <TableHead className="text-white">Pending</TableHead>
                  <TableHead className="text-white">Scheduled</TableHead>
                  <TableHead className="text-white">Completed</TableHead>
                  <TableHead className="text-white">Total</TableHead>
                  <TableHead className="text-white">Completion Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {casesByCourtType.map((court) => {
                  const total = court.pending + court.scheduled + court.completed;
                  const completionRate = ((court.completed / total) * 100).toFixed(1);
                  return (
                    <TableRow key={court.court}>
                      <TableCell className="font-medium">{court.court}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {court.pending}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          {court.scheduled}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {court.completed}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{total}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={parseFloat(completionRate)} className="h-2 flex-1" />
                          <span className="text-sm text-muted-foreground w-12">
                            {completionRate}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Row 4: Case Backlog Statistics & Cause List Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Case Backlog Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" style={{ color: '#650000' }} />
              Case Backlog Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={backlogStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, percentage }) => `${range}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {backlogStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {backlogStats.map((item, index) => (
                <div key={item.range} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm">{item.range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.count}</span>
                    <span className="text-sm text-muted-foreground">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cause List Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: '#650000' }} />
              Cause List Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cases</p>
                  <p className="text-2xl font-bold" style={{ color: '#650000' }}>
                    {causeListStats.totalCases}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Today</p>
                  <p className="text-xl font-bold text-blue-900">
                    {causeListStats.scheduledToday}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">This Week</p>
                  <p className="text-xl font-bold text-green-900">
                    {causeListStats.scheduledThisWeek}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-700">This Month</p>
                  <p className="text-xl font-bold text-purple-900">
                    {causeListStats.scheduledThisMonth}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">Unscheduled</p>
                  <p className="text-xl font-bold text-red-900">
                    {causeListStats.unscheduled}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 5: Court Discharges & Visitation Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary of Court Discharges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" style={{ color: '#650000' }} />
              Summary of Court Discharges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dischargeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="acquitted"
                  stroke="#650000"
                  strokeWidth={2}
                  name="Acquitted"
                />
                <Line
                  type="monotone"
                  dataKey="bail"
                  stroke="#8B0000"
                  strokeWidth={2}
                  name="Bail"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#A52A2A"
                  strokeWidth={2}
                  name="Completed Sentence"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Court Visitation Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" style={{ color: '#650000' }} />
              Court Visitation Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Visits</p>
                  <p className="text-2xl font-bold" style={{ color: '#650000' }}>
                    {visitationStats.totalVisits}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Approved</p>
                  <p className="text-2xl font-bold text-green-900">
                    {visitationStats.approvedVisits}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-700">Rejected</p>
                  <p className="text-2xl font-bold text-red-900">
                    {visitationStats.rejectedVisits}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {visitationStats.pendingVisits}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Average Per Day</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {visitationStats.averagePerDay}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
