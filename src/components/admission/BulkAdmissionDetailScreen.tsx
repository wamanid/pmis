import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Upload,
  FileSpreadsheet,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  Edit,
} from 'lucide-react';
import { Button } from '../ui/button';
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
import { Separator } from '../ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { BulkAdmission, BulkRecordStatus, BulkAdmissionRecord } from '../../models/admission/bulkAdmission';
import {
  getBulkAdmissionById,
  deleteBulkAdmission,
  commitBulkAdmission,
  updateBulkAdmissionRecord,
} from '../../services/admission/bulkAdmissionService';

const recordStatusConfig: Record<BulkRecordStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  pending: { label: 'Pending Validation', variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
  valid: { label: 'Valid - Ready to Commit', variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
  invalid: { label: 'Invalid - Has Errors', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  warning: { label: 'Valid with Warnings', variant: 'outline', icon: <AlertCircle className="h-3 w-3 text-yellow-600" /> },
  committed: { label: 'Committed to Database', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
  failed: { label: 'Failed to Commit', variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
};

export function BulkAdmissionDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bulkAdmission, setBulkAdmission] = useState<BulkAdmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fetch bulk admission details
  const fetchBulkAdmission = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getBulkAdmissionById(id);
      setBulkAdmission(data);
    } catch (error) {
      console.error('Error fetching bulk admission:', error);
      toast.error('Failed to load bulk admission details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkAdmission();
  }, [id]);

  // Handle commit
  const handleCommit = async () => {
    if (!id) return;
    
    try {
      setProcessing(true);
      await commitBulkAdmission(id);
      toast.success('Commit started successfully');
      fetchBulkAdmission();
    } catch (error) {
      console.error('Error committing bulk admission:', error);
      toast.error('Failed to start commit');
    } finally {
      setProcessing(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteBulkAdmission(id);
      toast.success('Bulk admission deleted successfully');
      navigate('/admissions-management/bulk-admissions');
    } catch (error) {
      console.error('Error deleting bulk admission:', error);
      toast.error('Failed to delete bulk admission');
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!bulkAdmission) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Bulk admission not found</h3>
            <Button onClick={() => navigate('/admissions-management/bulk-admissions')}>
              Back to List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validRecords = bulkAdmission.records?.filter(r => r.status === 'valid') || [];
  const invalidRecords = bulkAdmission.records?.filter(r => r.status === 'invalid') || [];
  const committedRecords = bulkAdmission.records?.filter(r => r.status === 'committed') || [];
  const failedRecords = bulkAdmission.records?.filter(r => r.status === 'failed') || [];
  const warningRecords = bulkAdmission.records?.filter(r => r.status === 'warning') || [];

  return (
    <div className="p-6 space-y-6">
      {/* Failed Batch Alert */}
      {(bulkAdmission.status === 'failed' || bulkAdmission.status === 'partially_committed') && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>{bulkAdmission.status === 'partially_committed' ? 'Batch Partially Committed' : 'Batch Commit Failed'}</AlertTitle>
          <AlertDescription>
            {bulkAdmission.failed_records} out of {bulkAdmission.total_records} records failed to commit.
            Review the commit errors below and use the "Retry Failed Records" button to try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/admissions-management/bulk-admissions')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{bulkAdmission.batch_name}</h1>
            <p className="text-muted-foreground mt-1">
              Uploaded by {bulkAdmission.uploaded_by_name} on {formatDate(bulkAdmission.uploaded_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchBulkAdmission} disabled={processing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {bulkAdmission.status === 'verified' && bulkAdmission.valid_records > 0 && (
            <Button onClick={handleCommit} disabled={processing}>
              <Upload className="h-4 w-4 mr-2" />
              Commit Records
            </Button>
          )}
          {(bulkAdmission.status === 'failed' || bulkAdmission.status === 'partially_committed') && bulkAdmission.failed_records > 0 && (
            <Button onClick={handleCommit} disabled={processing} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Failed Records
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Bulk Admission</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this bulk admission batch? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bulkAdmission.total_records}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valid Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{bulkAdmission.valid_records}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Invalid Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{bulkAdmission.invalid_records}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Committed Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{bulkAdmission.committed_records}</div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <p className="text-sm mt-1 capitalize">{bulkAdmission.status}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Uploaded At</p>
              <p className="text-sm mt-1">{formatDate(bulkAdmission.uploaded_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified At</p>
              <p className="text-sm mt-1">{formatDate(bulkAdmission.verified_at)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Committed At</p>
              <p className="text-sm mt-1">{formatDate(bulkAdmission.committed_at)}</p>
            </div>
            {bulkAdmission.committed_by_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Committed By</p>
                <p className="text-sm mt-1">{bulkAdmission.committed_by_name}</p>
              </div>
            )}
          </div>
          {bulkAdmission.validation_summary && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Validation Summary</p>
                <pre className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md">
                  {JSON.stringify(bulkAdmission.validation_summary, null, 2)}
                </pre>
              </div>
            </>
          )}
          {bulkAdmission.processing_log && bulkAdmission.processing_log.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Processing Log</p>
                <div className="space-y-2">
                  {bulkAdmission.processing_log.map((log, index) => (
                    <div key={index} className="text-sm bg-muted p-2 rounded">
                      <span className="font-medium">{log.action}:</span> {log.message}
                      <span className="text-muted-foreground ml-2 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Records */}
      {bulkAdmission.records && bulkAdmission.records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
            <CardDescription>
              Detailed view of all records in this batch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All ({bulkAdmission.records.length})</TabsTrigger>
                <TabsTrigger value="valid">Valid ({validRecords.length})</TabsTrigger>
                {warningRecords.length > 0 && (
                  <TabsTrigger value="warning">Warnings ({warningRecords.length})</TabsTrigger>
                )}
                <TabsTrigger value="invalid">Invalid ({invalidRecords.length})</TabsTrigger>
                <TabsTrigger value="committed">Committed ({committedRecords.length})</TabsTrigger>
                {failedRecords.length > 0 && (
                  <TabsTrigger value="failed">Failed ({failedRecords.length})</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="all" className="mt-4">
                <RecordsTable records={bulkAdmission.records} bulkAdmissionId={bulkAdmission.id} onRecordUpdate={fetchBulkAdmission} />
              </TabsContent>
              <TabsContent value="valid" className="mt-4">
                <RecordsTable records={validRecords} bulkAdmissionId={bulkAdmission.id} onRecordUpdate={fetchBulkAdmission} />
              </TabsContent>
              {warningRecords.length > 0 && (
                <TabsContent value="warning" className="mt-4">
                  <RecordsTable records={warningRecords} bulkAdmissionId={bulkAdmission.id} onRecordUpdate={fetchBulkAdmission} />
                </TabsContent>
              )}
              <TabsContent value="invalid" className="mt-4">
                <RecordsTable records={invalidRecords} bulkAdmissionId={bulkAdmission.id} onRecordUpdate={fetchBulkAdmission} />
              </TabsContent>
              <TabsContent value="committed" className="mt-4">
                <RecordsTable records={committedRecords} bulkAdmissionId={bulkAdmission.id} onRecordUpdate={fetchBulkAdmission} />
              </TabsContent>
              {failedRecords.length > 0 && (
                <TabsContent value="failed" className="mt-4">
                  <RecordsTable records={failedRecords} bulkAdmissionId={bulkAdmission.id} onRecordUpdate={fetchBulkAdmission} />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Records Table Component
interface RecordsTableProps {
  records: BulkAdmissionRecord[];
  bulkAdmissionId: string;
  onRecordUpdate: () => void;
}

function RecordsTable({ records, bulkAdmissionId, onRecordUpdate }: RecordsTableProps) {
  const [selectedRecord, setSelectedRecord] = useState<BulkAdmissionRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const handleViewEdit = (record: BulkAdmissionRecord) => {
    setSelectedRecord(record);
    setEditedData(record.raw_data);
    // Open all sections by default
    const sections = groupDataByPrefix(record.raw_data);
    const initialOpenState: Record<string, boolean> = {};
    Object.keys(sections).forEach(key => {
      initialOpenState[key] = true;
    });
    setOpenSections(initialOpenState);
    setDialogOpen(true);
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const groupDataByPrefix = (data: Record<string, any>) => {
    const groups: Record<string, Record<string, any>> = {};
    
    Object.entries(data).forEach(([key, value]) => {
      const parts = key.split('.');
      if (parts.length > 1) {
        const prefix = parts[0];
        const fieldName = parts.slice(1).join('.');
        
        if (!groups[prefix]) {
          groups[prefix] = {};
        }
        groups[prefix][fieldName] = value;
      } else {
        if (!groups['other']) {
          groups['other'] = {};
        }
        groups['other'][key] = value;
      }
    });
    
    return groups;
  };

  const updateFieldValue = (section: string, field: string, value: string) => {
    const fullKey = section === 'other' ? field : `${section}.${field}`;
    setEditedData(prev => ({
      ...prev,
      [fullKey]: value
    }));
  };

  const getSectionTitle = (section: string) => {
    const titles: Record<string, string> = {
      'prisoner': 'Prisoner Information',
      'prisonerBioData': 'Prisoner Bio Data',
      'prisonerRecord': 'Prisoner Record',
      'nextOfKin': 'Next of Kin',
      'childrenRecord': 'Children Record',
      'other': 'Other Fields'
    };
    return titles[section] || section;
  };

  const handleSave = async () => {
    if (!selectedRecord) return;

    try {
      setSaving(true);
      
      await updateBulkAdmissionRecord(bulkAdmissionId, selectedRecord.id, {
        raw_data: editedData,
      });

      toast.success('Record updated successfully');
      setDialogOpen(false);
      onRecordUpdate();
    } catch (error: any) {
      console.error('Error updating record:', error);
      toast.error('Failed to update record');
    } finally {
      setSaving(false);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No records found
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Row #</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>First Name</TableHead>
              <TableHead>Middle Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Sex</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Tribe</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Prison Station</TableHead>
              <TableHead>Prisoner Number</TableHead>
              <TableHead>Personal Number</TableHead>
              <TableHead>Duplicate</TableHead>
              <TableHead>Validation Errors</TableHead>
              <TableHead>Warnings</TableHead>
              <TableHead>Commit Error</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const statusInfo = recordStatusConfig[record.status as BulkRecordStatus];
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.row_number}</TableCell>
                  <TableCell>
                    <Badge variant={statusInfo.variant} className="gap-1">
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{record.raw_data['prisoner.first_name'] || 'N/A'}</TableCell>
                  <TableCell>{record.raw_data['prisoner.middle_name'] || 'N/A'}</TableCell>
                  <TableCell>{record.raw_data['prisoner.last_name'] || 'N/A'}</TableCell>
                  <TableCell>{record.raw_data['prisonerBioData.sex'] || 'N/A'}</TableCell>
                  <TableCell>{record.raw_data['prisonerBioData.date_of_birth'] || 'N/A'}</TableCell>
                  <TableCell>{record.raw_data['prisonerBioData.tribe'] || 'N/A'}</TableCell>
                  <TableCell>{record.raw_data['prisonerRecord.prisoner_category'] || 'N/A'}</TableCell>
                  <TableCell>{record.raw_data['prisonerRecord.prison_station'] || 'N/A'}</TableCell>
                  <TableCell>{record.prisoner_number || 'N/A'}</TableCell>
                  <TableCell>{record.prisoner_personal_number || 'N/A'}</TableCell>
                  <TableCell>
                    {record.is_duplicate ? (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Yes
                        </Badge>
                        {record.duplicate_of && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              window.open(`/admissions-management/prisoners/${record.duplicate_of}`, '_blank');
                            }}
                            className="h-7 text-xs"
                          >
                            View Existing
                          </Button>
                        )}
                      </div>
                    ) : (
                      'No'
                    )}
                  </TableCell>
                  <TableCell>
                    {record.errors && record.errors.length > 0 ? (
                      <div className="text-sm text-red-600 max-w-md">
                        <details>
                          <summary className="cursor-pointer hover:underline">
                            {record.errors.length} error(s)
                          </summary>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {record.errors.map((error: string, idx: number) => (
                              <li key={idx}>{error}</li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    ) : (
                      'None'
                    )}
                  </TableCell>
                  <TableCell>
                    {record.warnings && record.warnings.length > 0 ? (
                      <div className="text-sm text-yellow-600 max-w-md">
                        <details>
                          <summary className="cursor-pointer hover:underline">
                            {record.warnings.length} warning(s)
                          </summary>
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            {record.warnings.map((warning: any, idx: number) => (
                              <li key={idx}>
                                {typeof warning === 'string' 
                                  ? warning 
                                  : warning.message || JSON.stringify(warning)}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    ) : (
                      'None'
                    )}
                  </TableCell>
                  <TableCell>
                    {record.commit_error && record.commit_error.trim() !== '' ? (
                      <div className="text-sm text-red-600 max-w-md">
                        <details>
                          <summary className="cursor-pointer hover:underline font-medium">
                            Commit failed - Click to view
                          </summary>
                          <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                            {record.commit_error}
                          </div>
                        </details>
                      </div>
                    ) : (
                      'None'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {record.status === 'committed' && record.committed_prisoner_id ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            window.open(`/admissions-management/prisoners/${record.committed_prisoner_id}`, '_blank');
                          }}
                          className="gap-1 h-7 text-xs"
                        >
                          <Eye className="h-3 w-3" />
                          View Prisoner
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewEdit(record)}
                          className="gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent 
          className="overflow-hidden"
          style={{ 
            width: '90vw', 
            maxWidth: '1400px', 
            height: 'auto',
            maxHeight: '85vh', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>View/Edit Record Data</DialogTitle>
            <DialogDescription>
              Row #{selectedRecord?.row_number} - Edit the record fields organized by section
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0 max-h-[calc(85vh-180px)]">
            {selectedRecord && Object.entries(groupDataByPrefix(editedData)).map(([section, fields]) => (
              <Collapsible
                key={section}
                open={openSections[section]}
                className="border rounded-lg"
              >
                <CollapsibleTrigger 
                  className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors"
                  onClick={() => toggleSection(section)}
                >
                  <div className="flex items-center gap-2">
                    {openSections[section] ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="font-semibold">{getSectionTitle(section)}</span>
                    <Badge variant="secondary" className="ml-2">
                      {Object.keys(fields).length} fields
                    </Badge>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-4 pt-0">
                  <div className="grid grid-cols-4 gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
                    {Object.entries(fields).map(([field, value]) => {
                      const fullKey = section === 'other' ? field : `${section}.${field}`;
                      return (
                        <div key={fullKey} className="space-y-1">
                          <Label htmlFor={fullKey} className="text-xs font-medium">
                            {field}
                          </Label>
                          <Input
                            id={fullKey}
                            value={typeof editedData[fullKey] === 'object' 
                              ? JSON.stringify(editedData[fullKey]) 
                              : String(editedData[fullKey] ?? '')}
                            onChange={(e) => updateFieldValue(section, field, e.target.value)}
                            className="text-sm"
                            placeholder={`Enter ${field}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
