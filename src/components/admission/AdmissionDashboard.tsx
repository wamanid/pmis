import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { StatCard } from '../common/StatCard';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  UserPlus, 
  Search,
  Clock,
  Shield,
  Baby,
  TrendingUp,
  Calendar,
  Users
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
  ResponsiveContainer
} from 'recharts';
import { admissionService } from '../../services/admissionService';
import { DashboardResponse, DashboardFilters } from '../../models/admission';
import { toast } from 'sonner';

// Transform API response to chart data format
interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

export function AdmissionDashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    period: 'daily'
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await admissionService.getAdmissionDashboard(filters);
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading admission dashboard:', error);
        toast.error('Failed to load admission dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  // Transform category data from API response
  const getCategoryData = (): CategoryData[] => {
    if (!dashboardData) return [];
    
    const categories = dashboardData.admissions.category;
    const total = Object.values(categories).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(categories).map(([key, count]) => ({
      category: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  };

  const COLORS = ['#650000', '#8b0000', '#a52a2a', '#dc143c', '#ff6347'];

  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admissions dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Prisoner Admissions Dashboard</h1>
          <p className="text-muted-foreground">Manage and monitor prisoner admissions</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Admit Button */}
      <div className="flex justify-end">
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate('/admissions-management/prisoner-admission')}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Admit Prisoner
        </Button>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Admissions"
          value={dashboardData?.total_admissions || 0}
          subtitle="All time admissions"
          icon={Users}
          iconColor="text-primary"
        />
        
        <StatCard
          title="Pending Approval"
          value={dashboardData?.pending_approvals || 0}
          subtitle="Awaiting processing"
          icon={Clock}
          iconColor="text-orange-500"
        />
        
        <StatCard
          title="Armed Personnel"
          value={dashboardData?.armed_personnel || 0}
          subtitle="Currently admitted"
          icon={Shield}
          iconColor="text-red-500"
        />
        
        <StatCard
          title="Children Admitted"
          value={dashboardData?.children || 0}
          subtitle="Under 18 years"
          icon={Baby}
          iconColor="text-blue-500"
        />
      </div>

      {/* Category Breakdown & Weekly/Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Admission Counts by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Admissions by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCategoryData().map((cat) => (
                <div key={cat.category}>
                  <div className="flex justify-between items-center mb-2">
                    <span>{cat.category}</span>
                    <span className="font-semibold">{cat.count}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-full rounded-full transition-all" 
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly & Monthly Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Admission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Weekly Summary</span>
                  </div>
                  <Badge variant={dashboardData && dashboardData.weekly_summary.percentage_change > 0 ? 'default' : 'secondary'}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {dashboardData?.weekly_summary.percentage_change.toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Week</div>
                    <div className="text-2xl">{dashboardData?.weekly_summary.current}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Previous Week</div>
                    <div className="text-2xl">{dashboardData?.weekly_summary.previous}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Monthly Summary</span>
                  </div>
                  <Badge variant={dashboardData && dashboardData.monthly_summary.percentage_change > 0 ? 'default' : 'secondary'}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {dashboardData?.monthly_summary.percentage_change.toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Month</div>
                    <div className="text-2xl">{dashboardData?.monthly_summary.current}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Previous Month</div>
                    <div className="text-2xl">{dashboardData?.monthly_summary.previous}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Annual Summary</span>
                  </div>
                  <Badge variant={dashboardData && dashboardData.annual_summary.percentage_change > 0 ? 'default' : 'secondary'}>
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {dashboardData?.annual_summary.percentage_change.toFixed(1)}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Current Year</div>
                    <div className="text-2xl">{dashboardData?.annual_summary.current}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Previous Year</div>
                    <div className="text-2xl">{dashboardData?.annual_summary.previous}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getCategoryData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {getCategoryData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Category Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Count</TableHead>
                <TableHead className="text-right">Percentage</TableHead>
                <TableHead>Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCategoryData().map((cat) => (
                <TableRow key={cat.category}>
                  <TableCell>{cat.category}</TableCell>
                  <TableCell className="text-right">{cat.count}</TableCell>
                  <TableCell className="text-right">{cat.percentage}%</TableCell>
                  <TableCell>
                    <div className="flex-1 bg-muted rounded-full h-2 max-w-xs">
                      <div 
                        className="bg-primary h-full rounded-full transition-all" 
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-right">
                  {getCategoryData().reduce((sum, cat) => sum + cat.count, 0)}
                </TableCell>
                <TableCell className="text-right">100%</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
