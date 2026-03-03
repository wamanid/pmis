import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Calendar,
  PiggyBank,
  Wallet,
  Award,
  Clock,
  UserCheck,
  UserX,
  BarChart3,
  ArrowUpCircle,
  ArrowDownCircle,
  Coins,
  Target,
  Building2,
  AlertCircle,
  TrendingDown,
  DollarSignIcon,
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

// Mock data for prisoner earnings by stage
const earningsByStageData = [
  { stage: 'Stage 1 (Earning)', prisoners: 456, earnings: 637488, color: '#34D399' },
  { stage: 'Stage 2 (No Earning)', prisoners: 234, earnings: 0, color: '#EF4444' },
  { stage: 'Stage 3 (No Earning)', prisoners: 189, earnings: 0, color: '#EF4444' },
  { stage: 'Out of Stage', prisoners: 67, earnings: 0, color: '#EF4444' },
];

// Mock data for earning grades distribution
const earningGradesData = [
  { grade: 'Grade A (1398)', prisoners: 189, percentage: 41, color: '#10B981' },
  { grade: 'Grade B (699)', prisoners: 178, percentage: 39, color: '#34D399' },
  { grade: 'Grade C (280)', prisoners: 89, percentage: 20, color: '#06B6D4' },
];

// Mock data for working party categories
const workingPartyCategoriesData = [
  { category: 'Workshop', prisoners: 145, earnings: 202860 },
  { category: 'Kitchen/Cooks', prisoners: 89, earnings: 124422 },
  { category: 'Cleaners', prisoners: 78, earnings: 109044 },
  { category: 'Shamba/Agriculture', prisoners: 67, earnings: 93666 },
  { category: 'Livestock Care', prisoners: 45, earnings: 62910 },
  { category: 'Other Assignments', prisoners: 32, earnings: 44736 },
];

// Mock data for daily attendance trends
const dailyAttendanceTrendsData = [
  { date: 'Week 1', present: 423, absent: 33, sick: 12, rest: 8 },
  { date: 'Week 2', present: 431, absent: 28, sick: 10, rest: 7 },
  { date: 'Week 3', present: 428, absent: 31, sick: 11, rest: 6 },
  { date: 'Week 4', present: 435, absent: 26, sick: 9, rest: 6 },
];

// Mock data for monthly earnings trends
const monthlyEarningsTrendsData = [
  { month: 'Jan', totalEarnings: 1245000, ppCash: 830000, savings: 415000 },
  { month: 'Feb', totalEarnings: 1289000, ppCash: 859333, savings: 429667 },
  { month: 'Mar', totalEarnings: 1312000, ppCash: 874667, savings: 437333 },
  { month: 'Apr', totalEarnings: 1298000, ppCash: 865333, savings: 432667 },
  { month: 'May', totalEarnings: 1334000, ppCash: 889333, savings: 444667 },
  { month: 'Jun', totalEarnings: 1367000, ppCash: 911333, savings: 455667 },
];

// Mock data for earnings distribution
const earningsDistributionData = [
  { category: 'PP Cash (2/3)', amount: 911333, percentage: 67, color: '#34D399' },
  { category: 'Mandatory Savings (1/3)', amount: 455667, percentage: 33, color: '#10B981' },
];

// Mock data for working hours compliance
const workingHoursComplianceData = [
  { category: '≥3 Hours (Paid)', prisoners: 423, color: '#10B981' },
  { category: '<3 Hours (Not Paid)', prisoners: 33, color: '#EF4444' },
];

// Mock data for weekend/holiday workers
const weekendHolidayWorkersData = [
  { category: 'Cooks', count: 34 },
  { category: 'Cleaners', count: 28 },
  { category: 'Shamba Guards', count: 23 },
  { category: 'Livestock Care', count: 18 },
];

// Mock data for promotions and demotions
const promotionsDemotionsData = [
  { month: 'Jan', promotions: 12, demotions: 5 },
  { month: 'Feb', promotions: 15, demotions: 7 },
  { month: 'Mar', promotions: 11, demotions: 4 },
  { month: 'Apr', promotions: 18, demotions: 6 },
  { month: 'May', promotions: 14, demotions: 8 },
  { month: 'Jun', promotions: 16, demotions: 5 },
];

// Mock data for discharge reasons from working party
const dischargeReasonsData = [
  { reason: 'End of Sentence', count: 89, color: '#10B981' },
  { reason: 'Transfer', count: 67, color: '#06B6D4' },
  { reason: 'Disciplinary', count: 34, color: '#EF4444' },
  { reason: 'Forfeiture of Privilege', count: 23, color: '#8B5CF6' },
];

// Mock data for partial payment tracking
const partialPaymentData = [
  { status: 'Fully Paid', prisoners: 378, amount: 1123400, color: '#10B981' },
  { status: 'Partially Paid', prisoners: 45, amount: 89500, color: '#34D399' },
  { status: 'Pending Payment', prisoners: 33, amount: 154100, color: '#EF4444' },
];

// Mock data for gratuity overview
const gratuityOverviewData = [
  { category: 'Total Gratuity Owed', amount: 2456000 },
  { category: 'Paid this Month', amount: 345000 },
  { category: 'Pending Payment', amount: 567000 },
  { category: 'Reserved for Discharge', amount: 1544000 },
];

// Mock data for earning rate history
const earningRateHistoryData = [
  { period: '2023 Q1', gradeA: 1200, gradeB: 600, gradeC: 250 },
  { period: '2023 Q2', gradeA: 1250, gradeB: 625, gradeC: 260 },
  { period: '2023 Q3', gradeA: 1300, gradeB: 650, gradeC: 270 },
  { period: '2023 Q4', gradeA: 1350, gradeB: 675, gradeC: 275 },
  { period: '2024 Q1', gradeA: 1398, gradeB: 699, gradeC: 280 },
];

// Mock data for attendance by day of week
const attendanceByDayData = [
  { day: 'Monday', present: 445, absent: 11 },
  { day: 'Tuesday', present: 442, absent: 14 },
  { day: 'Wednesday', present: 438, absent: 18 },
  { day: 'Thursday', present: 441, absent: 15 },
  { day: 'Friday', present: 447, absent: 9 },
  { day: 'Saturday', present: 103, absent: 0 },
  { day: 'Sunday', present: 103, absent: 0 },
];

// Mock data for savings accumulation
const savingsAccumulationData = [
  { month: 'Jan', accumulated: 415000, withdrawn: 0, balance: 415000 },
  { month: 'Feb', accumulated: 429667, withdrawn: 0, balance: 844667 },
  { month: 'Mar', accumulated: 437333, withdrawn: 0, balance: 1282000 },
  { month: 'Apr', accumulated: 432667, withdrawn: 45000, balance: 1669667 },
  { month: 'May', accumulated: 444667, withdrawn: 0, balance: 2114334 },
  { month: 'Jun', accumulated: 455667, withdrawn: 67000, balance: 2503001 },
];

// Summary statistics
const summaryStats = {
  totalPrisonersInScheme: 456,
  totalMonthlyEarnings: 1367000,
  ppCashDistributed: 911333,
  mandatorySavings: 455667,
  attendanceRate: 92.8,
  averageEarningsPerPrisoner: 2998,
  pendingGratuity: 567000,
  activeWorkingParties: 24,
};

interface EarningSchemeOverviewProps {
  onNavigate?: (page: string) => void;
}

export const EarningSchemeOverview: React.FC<EarningSchemeOverviewProps> = ({ onNavigate }) => {
  const [earningsStageCollapsed, setEarningsStageCollapsed] = useState(false);
  const [earningGradesCollapsed, setEarningGradesCollapsed] = useState(false);
  const [workingPartyCollapsed, setWorkingPartyCollapsed] = useState(false);
  const [attendanceTrendsCollapsed, setAttendanceTrendsCollapsed] = useState(false);
  const [monthlyEarningsCollapsed, setMonthlyEarningsCollapsed] = useState(false);
  const [distributionCollapsed, setDistributionCollapsed] = useState(false);
  const [hoursComplianceCollapsed, setHoursComplianceCollapsed] = useState(false);
  const [weekendWorkersCollapsed, setWeekendWorkersCollapsed] = useState(false);
  const [promotionsDemotionsCollapsed, setPromotionsDemotionsCollapsed] = useState(false);
  const [dischargeReasonsCollapsed, setDischargeReasonsCollapsed] = useState(false);
  const [partialPaymentCollapsed, setPartialPaymentCollapsed] = useState(false);
  const [gratuityCollapsed, setGratuityCollapsed] = useState(false);
  const [rateHistoryCollapsed, setRateHistoryCollapsed] = useState(false);
  const [attendanceDayCollapsed, setAttendanceDayCollapsed] = useState(false);
  const [savingsCollapsed, setSavingsCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Earning Scheme Management Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and insights on prisoner earnings, working parties, attendance, grades, savings, and payment distribution
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Users className="h-4 w-4" />
              Prisoners in Scheme
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl">{summaryStats.totalPrisonersInScheme.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Active earning participants
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">{summaryStats.activeWorkingParties} working parties</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <DollarSign className="h-4 w-4" />
              Monthly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                UGX {(summaryStats.totalMonthlyEarnings / 1000).toFixed(0)}K
              </div>
              <p className="text-xs text-muted-foreground">
                Total this month
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">UGX {summaryStats.averageEarningsPerPrisoner} avg/prisoner</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Wallet className="h-4 w-4" />
              Payment Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">PP Cash (2/3):</span>
                <span className="text-sm" style={{ color: '#650000' }}>UGX {(summaryStats.ppCashDistributed / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Savings (1/3):</span>
                <span className="text-sm" style={{ color: '#650000' }}>UGX {(summaryStats.mandatorySavings / 1000).toFixed(0)}K</span>
              </div>
              <div className="text-xs text-muted-foreground">Automatic allocation</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <CheckCircle2 className="h-4 w-4" />
              Attendance & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Attendance Rate:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.attendanceRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending Gratuity:</span>
                <span className="text-sm text-orange-600">UGX {(summaryStats.pendingGratuity / 1000).toFixed(0)}K</span>
              </div>
              <div className="text-xs text-muted-foreground">Current status</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-2 shadow-sm">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <UserCheck className="h-4 w-4" />
              Work Attendance Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#10B981' }}>
                  {summaryStats.attendanceRate}%
                </span>
                <CheckCircle2 className="h-6 w-6 mb-1" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Prisoners attending work regularly
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${summaryStats.attendanceRate}%`,
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
              <PiggyBank className="h-4 w-4" />
              Mandatory Savings Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#10B981' }}>
                  33.3%
                </span>
                <Award className="h-6 w-6 mb-1" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Automatic 1/3 allocation to savings (mandatory)
              </p>
              <div className="text-sm" style={{ color: '#34D399' }}>
                Withdrawn only at discharge
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Earnings by Stage & Earning Grades Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings by Stage */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setEarningsStageCollapsed(!earningsStageCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Target className="h-4 w-4" />
              Earnings Eligibility by Stage
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setEarningsStageCollapsed(!earningsStageCollapsed);
              }}
            >
              {earningsStageCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!earningsStageCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={earningsByStageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" angle={-15} textAnchor="end" height={100} />
                <YAxis yAxisId="left" orientation="left" stroke="#34D399" />
                <YAxis yAxisId="right" orientation="right" stroke="#06B6D4" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="prisoners" fill="#34D399" name="Prisoners">
                  {earningsByStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="earnings" fill="#06B6D4" name="Total Earnings (UGX)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Earning Grades Distribution */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setEarningGradesCollapsed(!earningGradesCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Award className="h-4 w-4" />
              Earning Grades Distribution
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setEarningGradesCollapsed(!earningGradesCollapsed);
              }}
            >
              {earningGradesCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!earningGradesCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={earningGradesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ grade, percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="prisoners"
                    >
                      {earningGradesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {earningGradesData.map((grade, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: grade.color }}
                        ></div>
                        <span className="text-sm">{grade.grade}</span>
                      </div>
                      <span className="text-lg" style={{ color: grade.color }}>
                        {grade.prisoners}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {grade.percentage}% of earning prisoners
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 2: Working Party Categories & Daily Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Party Categories */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setWorkingPartyCollapsed(!workingPartyCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Briefcase className="h-4 w-4" />
              Working Party Categories
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setWorkingPartyCollapsed(!workingPartyCollapsed);
              }}
            >
              {workingPartyCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!workingPartyCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={workingPartyCategoriesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" width={130} />
                <Tooltip />
                <Legend />
                <Bar dataKey="prisoners" fill="#34D399" name="Prisoners" />
                <Bar dataKey="earnings" fill="#06B6D4" name="Total Earnings (UGX)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Daily Attendance Trends */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setAttendanceTrendsCollapsed(!attendanceTrendsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Calendar className="h-4 w-4" />
              Weekly Attendance Trends
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setAttendanceTrendsCollapsed(!attendanceTrendsCollapsed);
              }}
            >
              {attendanceTrendsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!attendanceTrendsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={dailyAttendanceTrendsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" strokeWidth={2} name="Absent" />
                <Line type="monotone" dataKey="sick" stroke="#8B5CF6" strokeWidth={2} name="Sick" />
                <Line type="monotone" dataKey="rest" stroke="#34D399" strokeWidth={2} name="Rest" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 3: Monthly Earnings Trends & Earnings Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Trends */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setMonthlyEarningsCollapsed(!monthlyEarningsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <TrendingUp className="h-4 w-4" />
              Monthly Earnings Trends
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setMonthlyEarningsCollapsed(!monthlyEarningsCollapsed);
              }}
            >
              {monthlyEarningsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!monthlyEarningsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={monthlyEarningsTrendsData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPPCash" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="totalEarnings"
                  stroke="#34D399"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Total Earnings"
                />
                <Area
                  type="monotone"
                  dataKey="ppCash"
                  stroke="#06B6D4"
                  fillOpacity={1}
                  fill="url(#colorPPCash)"
                  name="PP Cash (2/3)"
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorSavings)"
                  name="Savings (1/3)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Earnings Distribution */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setDistributionCollapsed(!distributionCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Coins className="h-4 w-4" />
              Earnings Distribution (2/3 PP Cash, 1/3 Savings)
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setDistributionCollapsed(!distributionCollapsed);
              }}
            >
              {distributionCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!distributionCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={earningsDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {earningsDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {earningsDistributionData.map((item, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <span className="text-lg" style={{ color: item.color }}>
                        UGX {(item.amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.percentage}% automatic allocation
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 4: Working Hours Compliance & Weekend/Holiday Workers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Hours Compliance */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setHoursComplianceCollapsed(!hoursComplianceCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Clock className="h-4 w-4" />
              Working Hours Compliance (≥3 Hours)
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setHoursComplianceCollapsed(!hoursComplianceCollapsed);
              }}
            >
              {hoursComplianceCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!hoursComplianceCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workingHoursComplianceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, prisoners }) => `${prisoners}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="prisoners"
                    >
                      {workingHoursComplianceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {workingHoursComplianceData.map((item, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <span className="text-lg" style={{ color: item.color }}>
                        {item.prisoners}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((item.prisoners / workingHoursComplianceData.reduce((acc, i) => acc + i.prisoners, 0)) * 100).toFixed(1)}% of prisoners
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>

        {/* Weekend/Holiday Workers */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setWeekendWorkersCollapsed(!weekendWorkersCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Building2 className="h-4 w-4" />
              Weekend & Holiday Workers
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setWeekendWorkersCollapsed(!weekendWorkersCollapsed);
              }}
            >
              {weekendWorkersCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!weekendWorkersCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={weekendHolidayWorkersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#34D399" name="Workers">
                  {weekendHolidayWorkersData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#34D399', '#06B6D4', '#8B5CF6', '#10B981'][index % 4]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 5: Promotions/Demotions & Discharge Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promotions and Demotions */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setPromotionsDemotionsCollapsed(!promotionsDemotionsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <ArrowUpCircle className="h-4 w-4" />
              Grade Promotions & Demotions
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setPromotionsDemotionsCollapsed(!promotionsDemotionsCollapsed);
              }}
            >
              {promotionsDemotionsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!promotionsDemotionsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={promotionsDemotionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="promotions" fill="#10B981" name="Promotions" />
                <Bar dataKey="demotions" fill="#EF4444" name="Demotions" />
                <Line type="monotone" dataKey="promotions" stroke="#10B981" strokeWidth={0} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Discharge Reasons */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setDischargeReasonsCollapsed(!dischargeReasonsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <UserX className="h-4 w-4" />
              Discharge Reasons from Working Party
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setDischargeReasonsCollapsed(!dischargeReasonsCollapsed);
              }}
            >
              {dischargeReasonsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!dischargeReasonsCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dischargeReasonsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ reason, count }) => `${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {dischargeReasonsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {dischargeReasonsData.map((reason, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: reason.color }}
                        ></div>
                        <span className="text-sm">{reason.reason}</span>
                      </div>
                      <span className="text-lg" style={{ color: reason.color }}>
                        {reason.count}
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

      {/* Row 6: Partial Payment Tracking & Gratuity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partial Payment Tracking */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setPartialPaymentCollapsed(!partialPaymentCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Wallet className="h-4 w-4" />
              Payment Status Tracking
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setPartialPaymentCollapsed(!partialPaymentCollapsed);
              }}
            >
              {partialPaymentCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!partialPaymentCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={partialPaymentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis yAxisId="left" orientation="left" stroke="#34D399" />
                <YAxis yAxisId="right" orientation="right" stroke="#06B6D4" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="prisoners" fill="#34D399" name="Prisoners">
                  {partialPaymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
                <Bar yAxisId="right" dataKey="amount" fill="#06B6D4" name="Amount (UGX)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Gratuity Overview */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setGratuityCollapsed(!gratuityCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <DollarSign className="h-4 w-4" />
              Gratuity Management
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setGratuityCollapsed(!gratuityCollapsed);
              }}
            >
              {gratuityCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!gratuityCollapsed && (
          <CardContent className="pt-6">
            <div className="space-y-4">
              {gratuityOverviewData.map((item, index) => (
                <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" style={{ color: ['#34D399', '#10B981', '#EF4444', '#06B6D4'][index % 4] }} />
                      <span className="text-sm">{item.category}</span>
                    </div>
                    <span className="text-xl" style={{ color: ['#34D399', '#10B981', '#EF4444', '#06B6D4'][index % 4] }}>
                      UGX {(item.amount / 1000).toFixed(0)}K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 7: Earning Rate History & Attendance by Day */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earning Rate History */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setRateHistoryCollapsed(!rateHistoryCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <BarChart3 className="h-4 w-4" />
              Earning Rate History
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setRateHistoryCollapsed(!rateHistoryCollapsed);
              }}
            >
              {rateHistoryCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!rateHistoryCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={earningRateHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gradeA" stroke="#10B981" strokeWidth={2} name="Grade A" />
                <Line type="monotone" dataKey="gradeB" stroke="#34D399" strokeWidth={2} name="Grade B" />
                <Line type="monotone" dataKey="gradeC" stroke="#06B6D4" strokeWidth={2} name="Grade C" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Attendance by Day of Week */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setAttendanceDayCollapsed(!attendanceDayCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Calendar className="h-4 w-4" />
              Attendance by Day of Week
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setAttendanceDayCollapsed(!attendanceDayCollapsed);
              }}
            >
              {attendanceDayCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!attendanceDayCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={attendanceByDayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#10B981" name="Present" />
                <Bar dataKey="absent" fill="#EF4444" name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 8: Savings Accumulation */}
      <div className="grid grid-cols-1 gap-6">
        {/* Savings Accumulation */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setSavingsCollapsed(!savingsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <PiggyBank className="h-4 w-4" />
              Mandatory Savings Accumulation (1/3 - Withdrawn at Discharge Only)
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setSavingsCollapsed(!savingsCollapsed);
              }}
            >
              {savingsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!savingsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={savingsAccumulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="accumulated" fill="#10B981" name="Monthly Accumulation" />
                <Bar dataKey="withdrawn" fill="#EF4444" name="Withdrawn (Discharge)" />
                <Line type="monotone" dataKey="balance" stroke="#34D399" strokeWidth={3} name="Total Balance" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>
    </div>
  );
};
