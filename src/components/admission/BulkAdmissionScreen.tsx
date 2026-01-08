import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { BulkAdmission, BulkAdmissionStatus } from '../../models/admission/bulkAdmission';
import {
  getBulkAdmissions,
  createBulkAdmission,
  downloadBulkAdmissionTemplate,
} from '../../services/admission/bulkAdmissionService';

const statusConfig: Record<BulkAdmissionStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  uploaded: { label: 'Uploaded - Pending Verification', variant: 'secondary', icon: <Upload className="h-3 w-3" /> },
  verified: { label: 'Verified - Ready for Commit', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
  committing: { label: 'Committing to Database', variant: 'default', icon: <Clock className="h-3 w-3" /> },
  committed: { label: 'Fully Committed', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  partially_committed: { label: 'Partially Committed', variant: 'outline', icon: <AlertCircle className="h-3 w-3 text-yellow-600" /> },
  failed: { label: 'Failed', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', variant: 'secondary', icon: <XCircle className="h-3 w-3" /> },
};

export function BulkAdmissionScreen() {
  const navigate = useNavigate();
  const [bulkAdmissions, setBulkAdmissions] = useState<BulkAdmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BulkAdmissionStatus | 'all'>('all');
  
  // Form state
  const [batchName, setBatchName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch bulk admissions
  const fetchBulkAdmissions = async () => {
    try {
      setLoading(true);
      const filters = {
        search: searchQuery || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        ordering: '-uploaded_at',
      };
      const response = await getBulkAdmissions(filters);
      setBulkAdmissions(response.results);
    } catch (error) {
      console.error('Error fetching bulk admissions:', error);
      toast.error('Failed to load bulk admissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkAdmissions();
  }, [searchQuery, statusFilter]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadBulkAdmissionTemplate();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bulk_admission_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      const response = await createBulkAdmission({
        batch_name: batchName,
        file: selectedFile,
      });
      
      toast.success('Bulk admission batch created successfully');
      setDialogOpen(false);
      setBatchName('');
      setSelectedFile(null);
      
      // Navigate to detail screen
      navigate(`/admissions-management/bulk-admissions/${response.id}`);
    } catch (error: any) {
      console.error('Error creating bulk admission:', error);
      toast.error(error?.response?.data?.message || 'Failed to create bulk admission batch');
    } finally {
      setUploading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Admissions</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage bulk prisoner admissions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Bulk Upload
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>New Bulk Admission</DialogTitle>
                <DialogDescription>
                  Upload a file containing prisoner data for bulk admission
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="batch_name">
                    Batch Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="batch_name"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    placeholder="e.g., January 2025 Admissions"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="file">
                      Upload File <span className="text-red-500">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={handleDownloadTemplate}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Download Sample CSV
                    </button>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    accept=".csv,.xlsx,.xls"
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by batch name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value: string) => setStatusFilter(value as BulkAdmissionStatus | 'all')}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="validating">Validating</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="committing">Committing</SelectItem>
                  <SelectItem value="committed">Committed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Admissions List */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Admission Batches</CardTitle>
          <CardDescription>
            View and manage all bulk admission batches
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bulkAdmissions.length === 0 ? (
            <div className="text-center py-12">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bulk admissions found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by uploading your first bulk admission batch
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Bulk Upload
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Batch Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Valid</TableHead>
                    <TableHead className="text-right">Invalid</TableHead>
                    <TableHead className="text-right">Committed</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Uploaded At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bulkAdmissions.map((batch) => {
                    const statusInfo = statusConfig[batch.status];
                    return (
                      <TableRow
                        key={batch.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/admissions-management/bulk-admissions/${batch.id}`)}
                      >
                        <TableCell className="font-medium">{batch.batch_name}</TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="gap-1">
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{batch.total_records}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {batch.valid_records}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {batch.invalid_records}
                        </TableCell>
                        <TableCell className="text-right text-blue-600">
                          {batch.committed_records}
                        </TableCell>
                        <TableCell>{batch.uploaded_by_name}</TableCell>
                        <TableCell>{formatDate(batch.uploaded_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              navigate(`/admissions-management/bulk-admissions/${batch.id}`);
                            }}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
