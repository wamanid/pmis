import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  AlertTriangle,
  Users,
  FileText,
  Scale,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Activity,
  UserCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  TrendingDown,
  ClipboardList,
  Gavel,
  UserX,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Shield,
  Search,
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

// Mock data for offences by type
const offencesByTypeData = [
  { type: 'Minor Offences', count: 456, percentage: 62 },
  { type: 'Aggravated Offences', count: 278, percentage: 38 },
];

// Mock data for offence categories
const offenceCategoriesData = [
  { category: 'Disorderly Conduct', count: 189, color: '#34D399' },
  { category: 'Disobedience', count: 156, color: '#06B6D4' },
  { category: 'Violence', count: 134, color: '#EF4444' },
  { category: 'Contraband', count: 98, color: '#8B5CF6' },
  { category: 'Escape Attempt', count: 67, color: '#10B981' },
  { category: 'Other', count: 90, color: '#34D399' },
];

// Mock data for punishment types
const punishmentTypesData = [
  { type: 'Removal from Earning Scheme', count: 234, percentage: 32 },
  { type: 'Demotion in Stage', count: 189, percentage: 26 },
  { type: 'Reduction in Earnings Grade', count: 156, percentage: 21 },
  { type: 'Forfeiture of Privileges', count: 123, percentage: 17 },
  { type: 'Other Punishments', count: 32, percentage: 4 },
];

// Mock data for monthly discipline trends
const disciplineTrendsData = [
  { month: 'Jan', offences: 98, punishments: 89, proceedings: 45 },
  { month: 'Feb', offences: 112, punishments: 105, proceedings: 52 },
  { month: 'Mar', offences: 105, punishments: 98, proceedings: 48 },
  { month: 'Apr', offences: 118, punishments: 110, proceedings: 56 },
  { month: 'May', offences: 125, punishments: 118, proceedings: 61 },
  { month: 'Jun', offences: 134, punishments: 128, proceedings: 65 },
];

// Mock data for dangerous prisoners classification
const dangerousPrisonersData = [
  { criteria: 'Character', score: 85 },
  { criteria: 'Threat Analysis', score: 78 },
  { criteria: 'Past History', score: 92 },
  { criteria: 'Public Interest', score: 71 },
  { criteria: 'Nature of Offence', score: 88 },
  { criteria: 'Conduct in Prison', score: 76 },
];

// Mock data for disciplinary proceedings
const proceedingsData = [
  { status: 'Pending Hearing', count: 45, color: '#34D399' },
  { status: 'Under Investigation', count: 34, color: '#06B6D4' },
  { status: 'Guilty Verdict', count: 156, color: '#EF4444' },
  { status: 'Not Guilty Verdict', count: 23, color: '#10B981' },
  { status: 'Awaiting CG Authority', count: 12, color: '#8B5CF6' },
];

// Mock data for punishment duration compliance
const punishmentDurationData = [
  { month: 'Jan', earningScheme: 28, demotion: 27, reduction: 26 },
  { month: 'Feb', earningScheme: 29, demotion: 28, reduction: 27 },
  { month: 'Mar', earningScheme: 30, demotion: 29, reduction: 28 },
  { month: 'Apr', earningScheme: 27, demotion: 26, reduction: 25 },
  { month: 'May', earningScheme: 28, demotion: 27, reduction: 26 },
  { month: 'Jun', earningScheme: 29, demotion: 28, reduction: 27 },
];

// Mock data for prison rules violations
const prisonRulesViolationsData = [
  { rule: 'Rule 45: Disorderly Behavior', violations: 123 },
  { rule: 'Rule 52: Disobedience', violations: 98 },
  { rule: 'Rule 61: Contraband', violations: 87 },
  { rule: 'Rule 73: Violence', violations: 76 },
  { rule: 'Rule 89: Escape Attempt', violations: 54 },
  { rule: 'Other Rules', violations: 96 },
];

// Mock data for offence locations
const offenceLocationsData = [
  { location: 'Cell Block A', count: 145, color: '#34D399' },
  { location: 'Cell Block B', count: 123, color: '#06B6D4' },
  { location: 'Dining Hall', count: 98, color: '#8B5CF6' },
  { location: 'Recreation Area', count: 87, color: '#10B981' },
  { location: 'Workshop', count: 76, color: '#EF4444' },
  { location: 'Other Areas', count: 205, color: '#34D399' },
];

// Mock data for repeat offenders
const repeatOffendersData = [
  { category: '1 Offence', prisoners: 234, color: '#10B981' },
  { category: '2-3 Offences', prisoners: 156, color: '#34D399' },
  { category: '4-5 Offences', prisoners: 89, color: '#06B6D4' },
  { category: '6+ Offences', prisoners: 45, color: '#EF4444' },
];

// Mock data for punishment completion status
const punishmentCompletionData = [
  { month: 'Jan', completed: 78, ongoing: 34, alerts: 5 },
  { month: 'Feb', completed: 82, ongoing: 38, alerts: 4 },
  { month: 'Mar', completed: 85, ongoing: 32, alerts: 6 },
  { month: 'Apr', completed: 88, ongoing: 36, alerts: 3 },
  { month: 'May', completed: 92, ongoing: 40, alerts: 7 },
  { month: 'Jun', completed: 95, ongoing: 42, alerts: 5 },
];

// Mock data for commissioner general authority punishments
const cgAuthorityData = [
  { status: 'Pending CG Review', value: 12, color: '#34D399' },
  { status: 'Approved by CG', value: 45, color: '#10B981' },
  { status: 'Rejected by CG', value: 8, color: '#EF4444' },
  { status: 'Under Investigation', value: 15, color: '#06B6D4' },
];

// Mock data for appeals
const appealsData = [
  { month: 'Jan', filed: 12, approved: 3, rejected: 7, pending: 2 },
  { month: 'Feb', filed: 15, approved: 4, rejected: 9, pending: 2 },
  { month: 'Mar', filed: 11, approved: 2, rejected: 7, pending: 2 },
  { month: 'Apr', filed: 18, approved: 5, rejected: 10, pending: 3 },
  { month: 'May', filed: 14, approved: 3, rejected: 8, pending: 3 },
  { month: 'Jun', filed: 16, approved: 4, rejected: 9, pending: 3 },
];

// Mock data for witness involvement
const witnessInvolvementData = [
  { category: 'Staff Witnesses', count: 234 },
  { category: 'Prisoner Witnesses', count: 145 },
  { category: 'Multiple Witnesses', count: 98 },
  { category: 'No Witnesses', count: 67 },
];

// Summary statistics
const summaryStats = {
  totalOffences: 734,
  activePunishments: 289,
  dangerousPrisoners: 78,
  pendingProceedings: 79,
  completionRate: 87.3,
  repeatOffenderRate: 28.5,
  cgAuthorityPending: 12,
  activeAppeals: 13,
};

interface DisciplineOverviewProps {
  onNavigate?: (page: string) => void;
}

export const DisciplineOverview: React.FC<DisciplineOverviewProps> = ({ onNavigate }) => {
  const [offenceTypeCollapsed, setOffenceTypeCollapsed] = useState(false);
  const [offenceCategoriesCollapsed, setOffenceCategoriesCollapsed] = useState(false);
  const [punishmentTypesCollapsed, setPunishmentTypesCollapsed] = useState(false);
  const [disciplineTrendsCollapsed, setDisciplineTrendsCollapsed] = useState(false);
  const [dangerousPrisonersCollapsed, setDangerousPrisonersCollapsed] = useState(false);
  const [proceedingsCollapsed, setProceedingsCollapsed] = useState(false);
  const [punishmentDurationCollapsed, setPunishmentDurationCollapsed] = useState(false);
  const [prisonRulesCollapsed, setPrisonRulesCollapsed] = useState(false);
  const [offenceLocationsCollapsed, setOffenceLocationsCollapsed] = useState(false);
  const [repeatOffendersCollapsed, setRepeatOffendersCollapsed] = useState(false);
  const [punishmentCompletionCollapsed, setPunishmentCompletionCollapsed] = useState(false);
  const [cgAuthorityCollapsed, setCgAuthorityCollapsed] = useState(false);
  const [appealsCollapsed, setAppealsCollapsed] = useState(false);
  const [witnessCollapsed, setWitnessCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Discipline Management Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and insights on prisoner discipline, offences, punishments, proceedings, and dangerous prisoner monitoring
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <FileText className="h-4 w-4" />
              Total Offences
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl">{summaryStats.totalOffences.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Recorded this period
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Activity className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600">{summaryStats.activePunishments} active punishments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <ShieldAlert className="h-4 w-4" />
              Dangerous Prisoners
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                {summaryStats.dangerousPrisoners}
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                High-risk classification
              </p>
              <div className="text-sm text-red-600">
                Requires close monitoring
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Gavel className="h-4 w-4" />
              Proceedings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.pendingProceedings}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Completion Rate:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.completionRate}%</span>
              </div>
              <div className="text-xs text-muted-foreground">Disciplinary actions</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Target className="h-4 w-4" />
              Special Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Repeat Offenders:</span>
                <span className="text-sm text-orange-600">{summaryStats.repeatOffenderRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">CG Authority Pending:</span>
                <span className="text-sm text-purple-600">{summaryStats.cgAuthorityPending}</span>
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
              <CheckCircle2 className="h-4 w-4" />
              Punishment Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#10B981' }}>
                  {summaryStats.completionRate}%
                </span>
                <TrendingUp className="h-6 w-6 mb-1" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Punishments completed on schedule
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${summaryStats.completionRate}%`,
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
              <BookOpen className="h-4 w-4" />
              Active Appeals
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#34D399' }}>
                  {summaryStats.activeAppeals}
                </span>
                <ClipboardList className="h-6 w-6 mb-1" style={{ color: '#34D399' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Appeals under review or pending decision
              </p>
              <div className="text-sm" style={{ color: '#06B6D4' }}>
                Regular monitoring required
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Offences by Type & Offence Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offences by Type */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setOffenceTypeCollapsed(!offenceTypeCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <AlertTriangle className="h-4 w-4" />
              Offences by Type
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setOffenceTypeCollapsed(!offenceTypeCollapsed);
              }}
            >
              {offenceTypeCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!offenceTypeCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={offencesByTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {offencesByTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#34D399' : '#EF4444'} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {offencesByTypeData.map((offence, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: index === 0 ? '#34D399' : '#EF4444' }}
                        ></div>
                        <span className="text-sm">{offence.type}</span>
                      </div>
                      <span className="text-lg" style={{ color: index === 0 ? '#34D399' : '#EF4444' }}>
                        {offence.count}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {offence.percentage}% of total offences
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>

        {/* Offence Categories Distribution */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setOffenceCategoriesCollapsed(!offenceCategoriesCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <BarChart3 className="h-4 w-4" />
              Offence Categories Distribution
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setOffenceCategoriesCollapsed(!offenceCategoriesCollapsed);
              }}
            >
              {offenceCategoriesCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!offenceCategoriesCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={offenceCategoriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-15} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#34D399" name="Offence Count">
                  {offenceCategoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 2: Punishment Types & Discipline Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Punishment Types */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setPunishmentTypesCollapsed(!punishmentTypesCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Scale className="h-4 w-4" />
              Punishment Types Distribution
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setPunishmentTypesCollapsed(!punishmentTypesCollapsed);
              }}
            >
              {punishmentTypesCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!punishmentTypesCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={punishmentTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {punishmentTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#34D399', '#06B6D4', '#8B5CF6', '#10B981', '#EF4444'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {punishmentTypesData.map((punishment, index) => (
                  <div key={index} className="p-3 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: ['#34D399', '#06B6D4', '#8B5CF6', '#10B981', '#EF4444'][index % 5] }}
                        ></div>
                        <span className="text-xs">{punishment.type}</span>
                      </div>
                      <span className="text-sm" style={{ color: ['#34D399', '#06B6D4', '#8B5CF6', '#10B981', '#EF4444'][index % 5] }}>
                        {punishment.count}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {punishment.percentage}% of punishments
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>

        {/* Discipline Trends */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setDisciplineTrendsCollapsed(!disciplineTrendsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <TrendingUp className="h-4 w-4" />
              Monthly Discipline Trends
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setDisciplineTrendsCollapsed(!disciplineTrendsCollapsed);
              }}
            >
              {disciplineTrendsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!disciplineTrendsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={disciplineTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="offences" stroke="#EF4444" strokeWidth={2} name="Offences" />
                <Line type="monotone" dataKey="punishments" stroke="#34D399" strokeWidth={2} name="Punishments" />
                <Line type="monotone" dataKey="proceedings" stroke="#06B6D4" strokeWidth={2} name="Proceedings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 3: Dangerous Prisoners Classification & Disciplinary Proceedings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dangerous Prisoners Classification */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setDangerousPrisonersCollapsed(!dangerousPrisonersCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <ShieldAlert className="h-4 w-4" />
              Dangerous Prisoners Classification Criteria
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setDangerousPrisonersCollapsed(!dangerousPrisonersCollapsed);
              }}
            >
              {dangerousPrisonersCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!dangerousPrisonersCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={dangerousPrisonersData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="criteria" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar name="Risk Score" dataKey="score" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Disciplinary Proceedings Status */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setProceedingsCollapsed(!proceedingsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Gavel className="h-4 w-4" />
              Disciplinary Proceedings Status
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setProceedingsCollapsed(!proceedingsCollapsed);
              }}
            >
              {proceedingsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!proceedingsCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={proceedingsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, count }) => `${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {proceedingsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {proceedingsData.map((proceeding, index) => (
                  <div key={index} className="p-3 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: proceeding.color }}
                        ></div>
                        <span className="text-xs">{proceeding.status}</span>
                      </div>
                      <span className="text-sm" style={{ color: proceeding.color }}>
                        {proceeding.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 4: Punishment Duration Compliance & Prison Rules Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Punishment Duration Compliance */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setPunishmentDurationCollapsed(!punishmentDurationCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Clock className="h-4 w-4" />
              Punishment Duration Tracking (Days)
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setPunishmentDurationCollapsed(!punishmentDurationCollapsed);
              }}
            >
              {punishmentDurationCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!punishmentDurationCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={punishmentDurationData}>
                <defs>
                  <linearGradient id="colorEarning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDemotion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="earningScheme"
                  stroke="#34D399"
                  fillOpacity={1}
                  fill="url(#colorEarning)"
                  name="Earning Scheme Removal"
                />
                <Area
                  type="monotone"
                  dataKey="demotion"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#colorDemotion)"
                  name="Stage Demotion"
                />
                <Area
                  type="monotone"
                  dataKey="reduction"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorReduction)"
                  name="Grade Reduction"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Prison Rules Violations */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setPrisonRulesCollapsed(!prisonRulesCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <BookOpen className="h-4 w-4" />
              Prison Rules & Regulations Violations
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setPrisonRulesCollapsed(!prisonRulesCollapsed);
              }}
            >
              {prisonRulesCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!prisonRulesCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={prisonRulesViolationsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="rule" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="violations" fill="#10B981" name="Violations">
                  {prisonRulesViolationsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#34D399', '#06B6D4', '#8B5CF6', '#10B981', '#EF4444', '#34D399'][index % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 5: Offence Locations & Repeat Offenders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offence Locations */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setOffenceLocationsCollapsed(!offenceLocationsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Search className="h-4 w-4" />
              Offence Locations Analysis
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setOffenceLocationsCollapsed(!offenceLocationsCollapsed);
              }}
            >
              {offenceLocationsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!offenceLocationsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={offenceLocationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" angle={-15} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#06B6D4" name="Offences">
                  {offenceLocationsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Repeat Offenders */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setRepeatOffendersCollapsed(!repeatOffendersCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <UserX className="h-4 w-4" />
              Repeat Offenders Distribution
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setRepeatOffendersCollapsed(!repeatOffendersCollapsed);
              }}
            >
              {repeatOffendersCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!repeatOffendersCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={repeatOffendersData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, prisoners }) => `${prisoners}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="prisoners"
                    >
                      {repeatOffendersData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {repeatOffendersData.map((offender, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: offender.color }}
                        ></div>
                        <span className="text-sm">{offender.category}</span>
                      </div>
                      <span className="text-lg" style={{ color: offender.color }}>
                        {offender.prisoners}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((offender.prisoners / repeatOffendersData.reduce((acc, o) => acc + o.prisoners, 0)) * 100).toFixed(1)}% of prisoners
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 6: Punishment Completion Status & CG Authority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Punishment Completion Status */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setPunishmentCompletionCollapsed(!punishmentCompletionCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Activity className="h-4 w-4" />
              Punishment Completion & Alerts
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setPunishmentCompletionCollapsed(!punishmentCompletionCollapsed);
              }}
            >
              {punishmentCompletionCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!punishmentCompletionCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={punishmentCompletionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="ongoing" fill="#34D399" name="Ongoing" />
                <Line type="monotone" dataKey="alerts" stroke="#EF4444" strokeWidth={2} name="Alerts (1 Day Before)" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Commissioner General Authority */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setCgAuthorityCollapsed(!cgAuthorityCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Award className="h-4 w-4" />
              Commissioner General's Authority (Reg 89)
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setCgAuthorityCollapsed(!cgAuthorityCollapsed);
              }}
            >
              {cgAuthorityCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!cgAuthorityCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={cgAuthorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, value }) => `${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cgAuthorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {cgAuthorityData.map((cg, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: cg.color }}
                        ></div>
                        <span className="text-sm">{cg.status}</span>
                      </div>
                      <span className="text-lg" style={{ color: cg.color }}>
                        {cg.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 7: Appeals Tracking & Witness Involvement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appeals Tracking */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setAppealsCollapsed(!appealsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <ClipboardList className="h-4 w-4" />
              Appeals Tracking & Outcomes
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setAppealsCollapsed(!appealsCollapsed);
              }}
            >
              {appealsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!appealsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={appealsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="filed" fill="#34D399" name="Filed" />
                <Bar dataKey="approved" fill="#10B981" name="Approved" />
                <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
                <Line type="monotone" dataKey="pending" stroke="#8B5CF6" strokeWidth={2} name="Pending" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Witness Involvement */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setWitnessCollapsed(!witnessCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Users className="h-4 w-4" />
              Witness Involvement in Proceedings
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setWitnessCollapsed(!witnessCollapsed);
              }}
            >
              {witnessCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!witnessCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={witnessInvolvementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#06B6D4" name="Cases">
                  {witnessInvolvementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#34D399', '#06B6D4', '#8B5CF6', '#10B981'][index % 4]} />
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
