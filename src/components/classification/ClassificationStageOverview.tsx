import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  TrendingUp,
  TrendingDown,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Award,
  Building2,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
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
} from 'recharts';

// Mock data for stage distribution
const stageDistributionData = [
  { stage: 'Stage 1', count: 245, percentage: 32 },
  { stage: 'Stage 2', count: 198, percentage: 26 },
  { stage: 'Stage 3', count: 156, percentage: 20 },
  { stage: 'Stage 4', count: 167, percentage: 22 },
];

// Mock data for ward distribution
const wardDistributionData = [
  { ward: 'Ward A', count: 89, capacity: 100 },
  { ward: 'Ward B', count: 95, capacity: 100 },
  { ward: 'Ward C', count: 78, capacity: 100 },
  { ward: 'Ward D', count: 92, capacity: 100 },
  { ward: 'Ward E', count: 85, capacity: 100 },
  { ward: 'Ward F', count: 88, capacity: 100 },
  { ward: 'Ward G', count: 73, capacity: 100 },
  { ward: 'Ward H', count: 66, capacity: 80 },
];

// Mock data for promotion/demotion trends
const promotionDemotionTrends = [
  { month: 'Jan', promotions: 45, demotions: 12 },
  { month: 'Feb', promotions: 52, demotions: 8 },
  { month: 'Mar', promotions: 48, demotions: 15 },
  { month: 'Apr', promotions: 61, demotions: 10 },
  { month: 'May', promotions: 58, demotions: 14 },
  { month: 'Jun', promotions: 67, demotions: 9 },
];

// Mock data for stage progression flow
const stageProgressionFlow = [
  { from: 'Stage 1 → 2', count: 156 },
  { from: 'Stage 2 → 3', count: 98 },
  { from: 'Stage 3 → 4', count: 67 },
  { from: 'Stage 2 → 1', count: 23 },
  { from: 'Stage 3 → 2', count: 18 },
  { from: 'Stage 4 → 3', count: 12 },
];

// Mock data for average time in each stage
const averageTimeInStage = [
  { stage: 'Stage 1', days: 45, weeks: 6.4 },
  { stage: 'Stage 2', days: 68, weeks: 9.7 },
  { stage: 'Stage 3', days: 89, weeks: 12.7 },
  { stage: 'Stage 4', days: 112, weeks: 16.0 },
];

// Mock data for promotion recommendations
const promotionRecommendationData = [
  { status: 'Pending Review', value: 34, color: '#8B5CF6' },
  { status: 'Approved', value: 128, color: '#10B981' },
  { status: 'Rejected', value: 23, color: '#EF4444' },
  { status: 'Under Review', value: 15, color: '#06B6D4' },
];

// Mock data for mandatory promotion alerts
const mandatoryPromotionAlerts = [
  { week: 'Week 1', alerts: 5, stage1: 2, stage2: 2, stage3: 1 },
  { week: 'Week 2', alerts: 8, stage1: 3, stage2: 3, stage3: 2 },
  { week: 'Week 3', alerts: 6, stage1: 2, stage2: 2, stage3: 2 },
  { week: 'Week 4', alerts: 12, stage1: 5, stage2: 4, stage3: 3 },
  { week: 'Week 5', alerts: 9, stage1: 3, stage2: 4, stage3: 2 },
  { week: 'Week 6', alerts: 7, stage1: 2, stage2: 3, stage3: 2 },
];

// Mock data for ward occupancy trends
const wardOccupancyTrends = [
  { month: 'Jan', occupancy: 82, capacity: 88 },
  { month: 'Feb', occupancy: 85, capacity: 88 },
  { month: 'Mar', occupancy: 87, capacity: 88 },
  { month: 'Apr', occupancy: 89, capacity: 90 },
  { month: 'May', occupancy: 86, capacity: 90 },
  { month: 'Jun', occupancy: 88, capacity: 90 },
];

// Summary statistics
const summaryStats = {
  totalPrisoners: 766,
  totalPromotionsThisMonth: 67,
  totalDemotionsThisMonth: 9,
  pendingRecommendations: 34,
  overduePromotions: 47,
  promotionSuccessRate: 88.2,
  averageStayDuration: 78.5,
  totalWards: 8,
};

interface ClassificationStageOverviewProps {
  onNavigate?: (page: string) => void;
}

export const ClassificationStageOverview: React.FC<ClassificationStageOverviewProps> = ({ onNavigate }) => {
  const [stageDistCollapsed, setStageDistCollapsed] = useState(false);
  const [wardDistCollapsed, setWardDistCollapsed] = useState(false);
  const [promotionTrendCollapsed, setPromotionTrendCollapsed] = useState(false);
  const [stageFlowCollapsed, setStageFlowCollapsed] = useState(false);
  const [avgTimeCollapsed, setAvgTimeCollapsed] = useState(false);
  const [recommendationsCollapsed, setRecommendationsCollapsed] = useState(false);
  const [alertsCollapsed, setAlertsCollapsed] = useState(false);
  const [wardOccupancyCollapsed, setWardOccupancyCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Classification & Progressive Stage System Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and insights on prisoner classification, stage progression, and ward assignments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Users className="h-4 w-4" />
              Total in System
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl">{summaryStats.totalPrisoners.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Prisoners in Progressive System
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{summaryStats.totalWards} Wards</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <ArrowUpCircle className="h-4 w-4" />
              Promotions This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                {summaryStats.totalPromotionsThisMonth}
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                Stage Promotions
              </p>
              <div className="text-sm text-green-600">
                +18% from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <ArrowDownCircle className="h-4 w-4" />
              Demotions This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                {summaryStats.totalDemotionsThisMonth}
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                Stage Demotions
              </p>
              <div className="text-sm text-red-600">
                -25% from last month
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <AlertTriangle className="h-4 w-4" />
              Alerts & Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending Recommendations:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.pendingRecommendations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Overdue Promotions:</span>
                <span className="text-sm text-red-600">{summaryStats.overduePromotions}</span>
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
              <Award className="h-4 w-4" />
              Promotion Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#10B981' }}>
                  {summaryStats.promotionSuccessRate}%
                </span>
                <CheckCircle2 className="h-6 w-6 mb-1" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Percentage of prisoners progressing successfully through stages
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${summaryStats.promotionSuccessRate}%`,
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
              <Clock className="h-4 w-4" />
              Average Stay Duration
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#06B6D4' }}>
                  {summaryStats.averageStayDuration}
                </span>
                <span className="text-lg text-muted-foreground mb-1">days</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Average time prisoners spend in each stage
              </p>
              <div className="text-sm" style={{ color: '#06B6D4' }}>
                11.2 weeks average per stage
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Stage Distribution & Ward Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stage Distribution */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setStageDistCollapsed(!stageDistCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Users className="h-4 w-4" />
                Prisoner Distribution by Stage
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setStageDistCollapsed(!stageDistCollapsed);
                }}
              >
                {stageDistCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!stageDistCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stageDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ stage, percentage }) => `${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stageDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#34D399', '#10B981', '#06B6D4', '#8B5CF6'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Ward Distribution */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setWardDistCollapsed(!wardDistCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Building2 className="h-4 w-4" />
                Ward Assignment Distribution
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setWardDistCollapsed(!wardDistCollapsed);
                }}
              >
                {wardDistCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!wardDistCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={wardDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="ward" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#34D399" name="Current Occupancy" />
                  <Bar dataKey="capacity" fill="#06B6D4" name="Total Capacity" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Row 2: Promotion Trends & Stage Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Promotion/Demotion Trends */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setPromotionTrendCollapsed(!promotionTrendCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <TrendingUp className="h-4 w-4" />
                Promotion vs Demotion Trends
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setPromotionTrendCollapsed(!promotionTrendCollapsed);
                }}
              >
                {promotionTrendCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!promotionTrendCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={promotionDemotionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="promotions"
                    stroke="#10B981"
                    strokeWidth={2}
                    name="Promotions"
                    dot={{ fill: '#10B981', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="demotions"
                    stroke="#EF4444"
                    strokeWidth={2}
                    name="Demotions"
                    dot={{ fill: '#EF4444', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Stage Progression Flow */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setStageFlowCollapsed(!stageFlowCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <ArrowUpCircle className="h-4 w-4" />
                Stage Progression Flow
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setStageFlowCollapsed(!stageFlowCollapsed);
                }}
              >
                {stageFlowCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!stageFlowCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageProgressionFlow} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="from" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#06B6D4" name="Transitions" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Row 3: Average Time & Promotion Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Time in Each Stage */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setAvgTimeCollapsed(!avgTimeCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Clock className="h-4 w-4" />
                Average Time in Each Stage
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAvgTimeCollapsed(!avgTimeCollapsed);
                }}
              >
                {avgTimeCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!avgTimeCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={averageTimeInStage}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="days" fill="#8B5CF6" name="Average Days" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Promotion Recommendations */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setRecommendationsCollapsed(!recommendationsCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <FileText className="h-4 w-4" />
                Promotion Recommendation Status
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setRecommendationsCollapsed(!recommendationsCollapsed);
                }}
              >
                {recommendationsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!recommendationsCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={promotionRecommendationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ status, value }) => `${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {promotionRecommendationData.map((entry, index) => (
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

      {/* Row 4: Mandatory Alerts & Ward Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mandatory Promotion Alerts */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setAlertsCollapsed(!alertsCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <AlertTriangle className="h-4 w-4" />
                Mandatory Promotion Alerts
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setAlertsCollapsed(!alertsCollapsed);
                }}
              >
                {alertsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!alertsCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mandatoryPromotionAlerts}>
                  <defs>
                    <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#colorAlerts)"
                    name="Total Alerts"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>

        {/* Ward Occupancy Trends */}
        <Card className="border-2 shadow-md">
          <CardHeader
            className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
            style={{ backgroundColor: '#faebd7' }}
            onClick={() => setWardOccupancyCollapsed(!wardOccupancyCollapsed)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
                <Building2 className="h-4 w-4" />
                Ward Occupancy Trends
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gray-200 h-7 w-7"
                style={{ color: '#650000' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setWardOccupancyCollapsed(!wardOccupancyCollapsed);
                }}
              >
                {wardOccupancyCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {!wardOccupancyCollapsed && (
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={wardOccupancyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#34D399"
                    strokeWidth={2}
                    name="Average Occupancy %"
                    dot={{ fill: '#34D399', r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="capacity"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Total Capacity %"
                    dot={{ fill: '#06B6D4', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ClassificationStageOverview;
