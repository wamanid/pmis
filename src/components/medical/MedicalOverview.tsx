import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Stethoscope,
  Users,
  FileText,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Building2,
  Scale,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Pill,
  ClipboardList,
  Hospital,
  ThermometerSun,
  UtensilsCrossed,
  ShieldAlert,
  UserX,
  Truck,
  FileCheck,
  AlertCircle,
  HeartPulse,
  Siren,
  BookOpen,
  Microscope,
  Calendar,
  TrendingDown,
  HomeIcon,
  Weight,
  Apple,
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

// Mock data for medical examinations
const medicalExaminationsData = [
  { type: 'Initial Check-up', count: 234 },
  { type: 'Exit Check-up', count: 198 },
  { type: 'Routine Check-up', count: 1456 },
  { type: 'Emergency', count: 89 },
  { type: 'Follow-up', count: 567 },
];

// Mock data for disease distribution
const diseaseDistributionData = [
  { disease: 'Respiratory Infections', count: 345, percentage: 28 },
  { disease: 'Skin Conditions', count: 267, percentage: 22 },
  { disease: 'Digestive Issues', count: 198, percentage: 16 },
  { disease: 'Malaria', count: 156, percentage: 13 },
  { disease: 'Tuberculosis', count: 123, percentage: 10 },
  { disease: 'Other', count: 134, percentage: 11 },
];

// Mock data for BMI categories
const bmiCategoriesData = [
  { category: 'Underweight (<18.5)', value: 234, color: '#EF4444' },
  { category: 'Normal (18.5-24.9)', value: 1456, color: '#10B981' },
  { category: 'Overweight (25-29.9)', value: 345, color: '#34D399' },
  { category: 'Obese (≥30)', value: 89, color: '#8B5CF6' },
];

// Mock data for BMI trends
const bmiTrendsData = [
  { month: 'Jan', underweight: 45, normal: 230, overweight: 56, obese: 15 },
  { month: 'Feb', underweight: 42, normal: 235, overweight: 58, obese: 16 },
  { month: 'Mar', underweight: 39, normal: 242, overweight: 55, obese: 14 },
  { month: 'Apr', underweight: 38, normal: 248, overweight: 57, obese: 15 },
  { month: 'May', underweight: 37, normal: 251, overweight: 59, obese: 16 },
  { month: 'Jun', underweight: 39, normal: 243, overweight: 58, obese: 15 },
];

// Mock data for treatment records
const treatmentRecordsData = [
  { month: 'Jan', treatments: 456, medications: 389 },
  { month: 'Feb', treatments: 478, medications: 412 },
  { month: 'Mar', treatments: 492, medications: 428 },
  { month: 'Apr', treatments: 485, medications: 419 },
  { month: 'May', treatments: 501, medications: 445 },
  { month: 'Jun', treatments: 518, medications: 462 },
];

// Mock data for restricted prisoners
const restrictedPrisonersData = [
  { restriction: 'Light Labor Only', count: 156, percentage: 35 },
  { restriction: 'No Hard Labor', count: 123, percentage: 28 },
  { restriction: 'Infectious Disease', count: 89, percentage: 20 },
  { restriction: 'Dietary Restrictions', count: 67, percentage: 15 },
  { restriction: 'Other', count: 10, percentage: 2 },
];

// Mock data for referral recommendations
const referralRecommendationsData = [
  { category: 'Public Hospital', count: 178, percentage: 52 },
  { category: 'Prison Health Facility', count: 123, percentage: 36 },
  { category: 'Private Health Facility', count: 42, percentage: 12 },
];

// Mock data for malnutrition management
const malnutritionData = [
  { severity: 'Mild', count: 89, color: '#34D399' },
  { severity: 'Moderate', count: 56, color: '#06B6D4' },
  { severity: 'Severe', count: 23, color: '#EF4444' },
  { severity: 'Under Monitoring', count: 145, color: '#10B981' },
];

// Mock data for food quality reports
const foodQualityData = [
  { month: 'Jan', beforeCooking: 42, afterCooking: 38, issues: 8 },
  { month: 'Feb', beforeCooking: 45, afterCooking: 41, issues: 6 },
  { month: 'Mar', beforeCooking: 48, afterCooking: 44, issues: 5 },
  { month: 'Apr', beforeCooking: 46, afterCooking: 43, issues: 7 },
  { month: 'May', beforeCooking: 50, afterCooking: 47, issues: 4 },
  { month: 'Jun', beforeCooking: 52, afterCooking: 49, issues: 3 },
];

// Mock data for medical recommendations
const medicalRecommendationsData = [
  { type: 'Transfer Recommendation', score: 85 },
  { type: 'Labor Allocation', score: 78 },
  { type: 'Ward Allocation', score: 92 },
  { type: 'Dietary Requirements', score: 88 },
  { type: 'Release on Medical Grounds', score: 45 },
  { type: 'Referral', score: 72 },
];

// Mock data for release on medical grounds
const medicalReleaseData = [
  { status: 'Pending Examination', value: 12, color: '#34D399' },
  { status: 'Under Review', value: 8, color: '#06B6D4' },
  { status: 'Pending CGP Approval', value: 5, color: '#8B5CF6' },
  { status: 'Approved', value: 23, color: '#10B981' },
  { status: 'Rejected', value: 4, color: '#EF4444' },
];

// Mock data for vaccination records
const vaccinationData = [
  { vaccine: 'Tetanus', administered: 567, percentage: 95 },
  { vaccine: 'Hepatitis B', administered: 542, percentage: 91 },
  { vaccine: 'BCG', administered: 534, percentage: 89 },
  { vaccine: 'Influenza', administered: 489, percentage: 82 },
  { vaccine: 'COVID-19', administered: 523, percentage: 88 },
];

// Mock data for prison state assessments
const prisonStateData = [
  { aspect: 'Ventilation', rating: 78 },
  { aspect: 'Lighting', rating: 82 },
  { aspect: 'Sanitation', rating: 75 },
  { aspect: 'Congestion Level', rating: 68 },
  { aspect: 'Ward Environment', rating: 80 },
  { aspect: 'General Cleanliness', rating: 85 },
];

// Mock data for death records
const deathRecordsData = [
  { cause: 'Natural Causes', count: 12, color: '#34D399' },
  { cause: 'Illness/Disease', count: 8, color: '#06B6D4' },
  { cause: 'Accident', count: 3, color: '#EF4444' },
  { cause: 'Under Investigation', count: 2, color: '#8B5CF6' },
];

// Mock data for special dietary requirements
const dietaryRequirementsData = [
  { requirement: 'High Protein', count: 89 },
  { requirement: 'Low Sodium', count: 67 },
  { requirement: 'Diabetic Diet', count: 56 },
  { requirement: 'Soft Foods', count: 45 },
  { requirement: 'Gluten-Free', count: 23 },
  { requirement: 'Other', count: 34 },
];

// Mock data for check-up frequency
const checkupFrequencyData = [
  { month: 'Jan', scheduled: 156, completed: 148, missed: 8 },
  { month: 'Feb', scheduled: 162, completed: 155, missed: 7 },
  { month: 'Mar', scheduled: 168, completed: 163, missed: 5 },
  { month: 'Apr', scheduled: 165, completed: 159, missed: 6 },
  { month: 'May', scheduled: 171, completed: 167, missed: 4 },
  { month: 'Jun', scheduled: 174, completed: 170, missed: 4 },
];

// Summary statistics
const summaryStats = {
  totalMedicalRecords: 2124,
  activeTreatments: 289,
  restrictedPrisoners: 445,
  pendingReferrals: 68,
  vaccinationRate: 91.2,
  bmiNormalRate: 68.5,
  malnutritionCases: 313,
  medicalReleaseRequests: 52,
};

interface MedicalOverviewProps {
  onNavigate?: (page: string) => void;
}

export const MedicalOverview: React.FC<MedicalOverviewProps> = ({ onNavigate }) => {
  const [examinationsCollapsed, setExaminationsCollapsed] = useState(false);
  const [diseaseCollapsed, setDiseaseCollapsed] = useState(false);
  const [bmiCategoriesCollapsed, setBmiCategoriesCollapsed] = useState(false);
  const [bmiTrendsCollapsed, setBmiTrendsCollapsed] = useState(false);
  const [treatmentCollapsed, setTreatmentCollapsed] = useState(false);
  const [restrictedCollapsed, setRestrictedCollapsed] = useState(false);
  const [referralCollapsed, setReferralCollapsed] = useState(false);
  const [malnutritionCollapsed, setMalnutritionCollapsed] = useState(false);
  const [foodQualityCollapsed, setFoodQualityCollapsed] = useState(false);
  const [recommendationsCollapsed, setRecommendationsCollapsed] = useState(false);
  const [releaseCollapsed, setReleaseCollapsed] = useState(false);
  const [vaccinationCollapsed, setVaccinationCollapsed] = useState(false);
  const [prisonStateCollapsed, setPrisonStateCollapsed] = useState(false);
  const [deathRecordsCollapsed, setDeathRecordsCollapsed] = useState(false);
  const [dietaryCollapsed, setDietaryCollapsed] = useState(false);
  const [checkupFreqCollapsed, setCheckupFreqCollapsed] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Medical Records Management Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and insights on prisoner medical records, treatments, examinations, and health monitoring
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <FileText className="h-4 w-4" />
              Medical Records
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl">{summaryStats.totalMedicalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total Active Records
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">{summaryStats.activeTreatments} ongoing treatments</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <ShieldAlert className="h-4 w-4" />
              Restricted Prisoners
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-1">
              <div className="text-2xl flex items-center gap-2">
                {summaryStats.restrictedPrisoners}
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-xs text-muted-foreground">
                Medical Restrictions Active
              </p>
              <div className="text-sm text-orange-600">
                Labor & health restrictions
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <Heart className="h-4 w-4" />
              Health Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">BMI Normal:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.bmiNormalRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Vaccination Rate:</span>
                <span className="text-sm" style={{ color: '#650000' }}>{summaryStats.vaccinationRate}%</span>
              </div>
              <div className="text-xs text-muted-foreground">Population health metrics</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3" style={{ backgroundColor: '#faebd7' }}>
            <CardTitle className="text-sm flex items-center gap-2" style={{ color: '#650000' }}>
              <AlertCircle className="h-4 w-4" />
              Critical Cases
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Malnutrition:</span>
                <span className="text-sm text-orange-600">{summaryStats.malnutritionCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Referrals Pending:</span>
                <span className="text-sm text-red-600">{summaryStats.pendingReferrals}</span>
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
              <Pill className="h-4 w-4" />
              Vaccination Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#10B981' }}>
                  {summaryStats.vaccinationRate}%
                </span>
                <CheckCircle2 className="h-6 w-6 mb-1" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Overall vaccination rate for admitted prisoners
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full"
                  style={{ 
                    width: `${summaryStats.vaccinationRate}%`,
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
              <Scale className="h-4 w-4" />
              BMI Health Rate
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className="text-3xl" style={{ color: '#10B981' }}>
                  {summaryStats.bmiNormalRate}%
                </span>
                <TrendingUp className="h-6 w-6 mb-1" style={{ color: '#10B981' }} />
              </div>
              <p className="text-sm text-muted-foreground">
                Prisoners with normal BMI (18.5-24.9)
              </p>
              <div className="text-sm" style={{ color: '#34D399' }}>
                Regular tracking & monitoring
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 1: Medical Examinations & Disease Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Medical Examinations */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setExaminationsCollapsed(!examinationsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Stethoscope className="h-4 w-4" />
              Medical Examinations Summary
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setExaminationsCollapsed(!examinationsCollapsed);
              }}
            >
              {examinationsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!examinationsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={medicalExaminationsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#34D399" name="Examinations Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Disease Distribution */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setDiseaseCollapsed(!diseaseCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Microscope className="h-4 w-4" />
              Disease Distribution in Casebook
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setDiseaseCollapsed(!diseaseCollapsed);
              }}
            >
              {diseaseCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!diseaseCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={diseaseDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ disease, percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {diseaseDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#34D399', '#06B6D4', '#8B5CF6', '#10B981', '#EF4444', '#34D399'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {diseaseDistributionData.map((disease, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: ['#34D399', '#06B6D4', '#8B5CF6', '#10B981', '#EF4444', '#34D399'][index % 6] }}
                        ></div>
                        <span className="text-sm">{disease.disease}</span>
                      </div>
                      <span className="text-lg" style={{ color: '#34D399' }}>
                        {disease.count}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {disease.percentage}% of cases
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 2: BMI Categories & BMI Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BMI Categories */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setBmiCategoriesCollapsed(!bmiCategoriesCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Weight className="h-4 w-4" />
              BMI Categories Distribution
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setBmiCategoriesCollapsed(!bmiCategoriesCollapsed);
              }}
            >
              {bmiCategoriesCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!bmiCategoriesCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bmiCategoriesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, value }) => `${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bmiCategoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {bmiCategoriesData.map((bmi, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: bmi.color }}
                        ></div>
                        <span className="text-sm">{bmi.category}</span>
                      </div>
                      <span className="text-lg" style={{ color: bmi.color }}>
                        {bmi.value}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((bmi.value / bmiCategoriesData.reduce((acc, b) => acc + b.value, 0)) * 100).toFixed(1)}% of prisoners
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>

        {/* BMI Trends */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setBmiTrendsCollapsed(!bmiTrendsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <TrendingUp className="h-4 w-4" />
              BMI Tracking Trends
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setBmiTrendsCollapsed(!bmiTrendsCollapsed);
              }}
            >
              {bmiTrendsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!bmiTrendsCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={bmiTrendsData}>
                <defs>
                  <linearGradient id="colorUnderweight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOverweight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34D399" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#34D399" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorObese" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="underweight"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#colorUnderweight)"
                  name="Underweight"
                />
                <Area
                  type="monotone"
                  dataKey="normal"
                  stroke="#10B981"
                  fillOpacity={1}
                  fill="url(#colorNormal)"
                  name="Normal"
                />
                <Area
                  type="monotone"
                  dataKey="overweight"
                  stroke="#34D399"
                  fillOpacity={1}
                  fill="url(#colorOverweight)"
                  name="Overweight"
                />
                <Area
                  type="monotone"
                  dataKey="obese"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorObese)"
                  name="Obese"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 3: Treatment Records & Restricted Prisoners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treatment Records */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setTreatmentCollapsed(!treatmentCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Pill className="h-4 w-4" />
              Treatment & Medication Records
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setTreatmentCollapsed(!treatmentCollapsed);
              }}
            >
              {treatmentCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!treatmentCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={treatmentRecordsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="treatments"
                  stroke="#34D399"
                  strokeWidth={2}
                  name="Treatments Administered"
                  dot={{ fill: '#34D399', r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="medications"
                  stroke="#06B6D4"
                  strokeWidth={2}
                  name="Medications Dispensed"
                  dot={{ fill: '#06B6D4', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Restricted Prisoners */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setRestrictedCollapsed(!restrictedCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <ShieldAlert className="h-4 w-4" />
              Restricted Prisoners by Category
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setRestrictedCollapsed(!restrictedCollapsed);
              }}
            >
              {restrictedCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!restrictedCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={restrictedPrisonersData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="restriction" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" name="Restricted Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 4: Referral Recommendations & Malnutrition Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Referral Recommendations */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setReferralCollapsed(!referralCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Hospital className="h-4 w-4" />
              Referral Recommendations by Facility Type
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setReferralCollapsed(!referralCollapsed);
              }}
            >
              {referralCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!referralCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={referralRecommendationsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ category, percentage }) => `${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {referralRecommendationsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#34D399', '#06B6D4', '#8B5CF6'][index % 3]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {referralRecommendationsData.map((referral, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: ['#34D399', '#06B6D4', '#8B5CF6'][index % 3] }}
                        ></div>
                        <span className="text-sm">{referral.category}</span>
                      </div>
                      <span className="text-lg" style={{ color: '#34D399' }}>
                        {referral.count}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {referral.percentage}% of referrals
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>

        {/* Malnutrition Management */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setMalnutritionCollapsed(!malnutritionCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Apple className="h-4 w-4" />
              Malnutrition Cases & Management
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setMalnutritionCollapsed(!malnutritionCollapsed);
              }}
            >
              {malnutritionCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!malnutritionCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={malnutritionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, count }) => `${severity}: ${count}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {malnutritionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {malnutritionData.map((mal, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: mal.color }}
                        ></div>
                        <span className="text-sm">{mal.severity}</span>
                      </div>
                      <span className="text-lg" style={{ color: mal.color }}>
                        {mal.count}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((mal.count / malnutritionData.reduce((acc, m) => acc + m.count, 0)) * 100).toFixed(1)}% of cases
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 5: Food Quality Reports & Medical Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Food Quality Reports */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setFoodQualityCollapsed(!foodQualityCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <UtensilsCrossed className="h-4 w-4" />
              Food Quality Reports
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setFoodQualityCollapsed(!foodQualityCollapsed);
              }}
            >
              {foodQualityCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!foodQualityCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={foodQualityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="beforeCooking" fill="#34D399" name="Before Cooking" />
                <Bar dataKey="afterCooking" fill="#06B6D4" name="After Cooking" />
                <Line
                  type="monotone"
                  dataKey="issues"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Issues Reported"
                  dot={{ fill: '#EF4444', r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Medical Recommendations */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setRecommendationsCollapsed(!recommendationsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <ClipboardList className="h-4 w-4" />
              Medical Recommendations Analysis
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
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={medicalRecommendationsData}>
                <PolarGrid stroke="#06B6D4" />
                <PolarAngleAxis dataKey="type" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Recommendation Frequency"
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

      {/* Row 6: Release on Medical Grounds & Vaccination Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Release on Medical Grounds */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setReleaseCollapsed(!releaseCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <HomeIcon className="h-4 w-4" />
              Release on Medical Grounds
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setReleaseCollapsed(!releaseCollapsed);
              }}
            >
              {releaseCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!releaseCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={medicalReleaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ status, value }) => `${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {medicalReleaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {medicalReleaseData.map((release, index) => (
                  <div key={index} className="p-4 border-2 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: release.color }}
                        ></div>
                        <span className="text-sm">{release.status}</span>
                      </div>
                      <span className="text-lg" style={{ color: release.color }}>
                        {release.value}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {((release.value / medicalReleaseData.reduce((acc, r) => acc + r.value, 0)) * 100).toFixed(1)}% of requests
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        )}
        </Card>

        {/* Vaccination Records */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setVaccinationCollapsed(!vaccinationCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Pill className="h-4 w-4" />
              Vaccination Records on Admission
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setVaccinationCollapsed(!vaccinationCollapsed);
              }}
            >
              {vaccinationCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!vaccinationCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vaccinationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vaccine" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="administered" fill="#10B981" name="Vaccinations Administered" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
              {vaccinationData.map((vac, index) => (
                <div key={index} className="p-3 bg-gray-50 border-2 rounded-lg text-center">
                  <div className="text-xs text-muted-foreground mb-1">{vac.vaccine}</div>
                  <div className="text-lg" style={{ color: '#10B981' }}>{vac.percentage}%</div>
                  <div className="text-xs text-muted-foreground">coverage</div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 7: Prison State Assessment & Death Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prison State Assessment */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setPrisonStateCollapsed(!prisonStateCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Building2 className="h-4 w-4" />
              State of Prison & Prisoners Assessment
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setPrisonStateCollapsed(!prisonStateCollapsed);
              }}
            >
              {prisonStateCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!prisonStateCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={prisonStateData}>
                <PolarGrid stroke="#06B6D4" />
                <PolarAngleAxis dataKey="aspect" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Assessment Rating"
                  dataKey="rating"
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

        {/* Death Records */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setDeathRecordsCollapsed(!deathRecordsCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <AlertCircle className="h-4 w-4" />
              Death Records & Confirmation
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setDeathRecordsCollapsed(!deathRecordsCollapsed);
              }}
            >
              {deathRecordsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!deathRecordsCollapsed && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deathRecordsData.map((death, index) => (
                <div key={index} className="p-4 border-2 rounded-lg bg-gray-50 text-center">
                  <UserX className="h-8 w-8 mx-auto mb-2" style={{ color: death.color }} />
                  <div className="text-xs text-muted-foreground mb-2">{death.cause}</div>
                  <div className="text-2xl mb-1" style={{ color: death.color }}>
                    {death.count}
                  </div>
                  <div className="text-xs text-muted-foreground">cases</div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
        </Card>
      </div>

      {/* Row 8: Special Dietary Requirements & Check-up Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Special Dietary Requirements */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setDietaryCollapsed(!dietaryCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <UtensilsCrossed className="h-4 w-4" />
              Special Dietary Requirements
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setDietaryCollapsed(!dietaryCollapsed);
              }}
            >
              {dietaryCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!dietaryCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dietaryRequirementsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="requirement" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#06B6D4" name="Prisoners Count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>

        {/* Check-up Frequency */}
        <Card className="border-2 shadow-md">
        <CardHeader
          className="cursor-pointer hover:bg-gray-50 transition-colors py-3"
          style={{ backgroundColor: '#faebd7' }}
          onClick={() => setCheckupFreqCollapsed(!checkupFreqCollapsed)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base" style={{ color: '#650000' }}>
              <Calendar className="h-4 w-4" />
              Medical Check-up Frequency & Compliance
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-gray-200 h-7 w-7"
              style={{ color: '#650000' }}
              onClick={(e) => {
                e.stopPropagation();
                setCheckupFreqCollapsed(!checkupFreqCollapsed);
              }}
            >
              {checkupFreqCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!checkupFreqCollapsed && (
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={checkupFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scheduled" fill="#34D399" name="Scheduled" />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Line
                  type="monotone"
                  dataKey="missed"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Missed"
                  dot={{ fill: '#EF4444', r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        )}
        </Card>
      </div>
    </div>
  );
};

export default MedicalOverview;
