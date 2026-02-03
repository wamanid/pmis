import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Plus, X, Database, Filter, SortAsc } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import {
  fetchApps,
  fetchModels,
  fetchFields,
  createReport,
} from '../../services/reportsService';
import {
  AppMetadata,
  ModelMetadata,
  FieldMetadata,
  ReportJoin,
  ReportAggregate,
  ReportFilter,
} from '../../models/reports';

const AGGREGATE_FUNCTIONS = [
  { value: 'count', label: 'Count' },
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Average' },
  { value: 'min', label: 'Minimum' },
  { value: 'max', label: 'Maximum' },
];

const LOGICAL_OPERATORS = [
  { value: 'AND', label: 'AND' },
  { value: 'OR', label: 'OR' },
];

const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascending' },
  { value: 'desc', label: 'Descending' },
];

export function CreateReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Basic report info
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportModule, setReportModule] = useState('');
  const [reportScope, setReportScope] = useState('GLOBAL');

  // Metadata
  const [apps, setApps] = useState<AppMetadata[]>([]);
  const [models, setModels] = useState<ModelMetadata[]>([]);
  const [fields, setFields] = useState<FieldMetadata[]>([]);
  const [allAvailableFields, setAllAvailableFields] = useState<FieldMetadata[]>([]);

  // Selected model and fields
  const [selectedApp, setSelectedApp] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Query components
  const [joins, setJoins] = useState<ReportJoin[]>([]);
  const [groupBy, setGroupBy] = useState<string[]>([]);
  const [aggregates, setAggregates] = useState<ReportAggregate[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [orderBy, setOrderBy] = useState<string[]>([]);

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const appsData = await fetchApps();
      setApps(appsData);
    } catch (error) {
      toast.error('Failed to load applications');
    }
  };

  const handleAppChange = async (appLabel: string) => {
    setSelectedApp(appLabel);
    setSelectedModel('');
    setModels([]);
    setFields([]);
    
    try {
      const modelsData = await fetchModels(appLabel);
      setModels(modelsData);
    } catch (error) {
      toast.error('Failed to load models');
    }
  };

  const handleModelChange = async (modelPath: string) => {
    setSelectedModel(modelPath);
    setFields([]);
    setAllAvailableFields([]);
    
    const [appLabel] = modelPath.split('.');
    try {
      const fieldsData = await fetchFields(appLabel, modelPath.split('.')[1]);
      setFields(fieldsData);
      setAllAvailableFields(fieldsData);
    } catch (error) {
      toast.error('Failed to load fields');
    }
  };

  const loadFieldsForJoin = async (join: ReportJoin, index: number) => {
    try {
      // Parse the field to get app and model info
      const fieldParts = join.field.split('__');
      if (fieldParts.length === 2) {
        // This is a related field, we need to find the related model
        const relatedField = fields.find(f => f.name === fieldParts[0]);
        if (relatedField?.related_model) {
          const [relatedApp, relatedModel] = relatedField.related_model.split('.');
          const relatedFields = await fetchFields(relatedApp, relatedModel);
          
          // Update allAvailableFields to include related fields with proper naming
          const newFields = relatedFields.map(field => ({
            ...field,
            name: `${join.field}__${field.name}`,
            verbose_name: `${field.verbose_name} (via ${join.field})`
          }));
          
          setAllAvailableFields(prev => [...prev, ...newFields]);
        }
      }
    } catch (error) {
      toast.error('Failed to load fields for join');
    }
  };

  const updateJoin = (index: number, field: keyof ReportJoin, value: any) => {
    const updatedJoins = [...joins];
    updatedJoins[index] = { ...updatedJoins[index], [field]: value };
    setJoins(updatedJoins);
    
    // If field changed, load fields for the new join
    if (field === 'field') {
      loadFieldsForJoin({ ...updatedJoins[index], [field]: value }, index);
    }
  };

  const handleFieldToggle = (fieldName: string, checked: boolean) => {
    if (checked) {
      setSelectedFields([...selectedFields, fieldName]);
    } else {
      setSelectedFields(selectedFields.filter(f => f !== fieldName));
    }
  };

  const addJoin = () => {
    if (fields.length === 0) return;
    const firstRelationField = fields.find(f => f.is_relation);
    if (firstRelationField) {
      const newJoin = { field: firstRelationField.name, type: 'select' };
      setJoins([...joins, newJoin]);
      // Load fields for the new join
      loadFieldsForJoin(newJoin, joins.length);
    }
  };

  const removeJoin = (index: number) => {
    setJoins(joins.filter((_, i) => i !== index));
  };

  const addAggregate = () => {
    if (allAvailableFields.length === 0) return;
    const firstField = allAvailableFields[0];
    setAggregates([...aggregates, {
      field: firstField.name,
      function: 'count',
      alias: `${firstField.name}_count`,
    }]);
  };

  const removeAggregate = (index: number) => {
    setAggregates(aggregates.filter((_, i) => i !== index));
  };

  const updateAggregate = (index: number, field: keyof ReportAggregate, value: any) => {
    const updatedAggregates = [...aggregates];
    updatedAggregates[index] = { ...updatedAggregates[index], [field]: value };
    setAggregates(updatedAggregates);
  };

  const addFilter = () => {
    if (allAvailableFields.length === 0) return;
    const firstField = allAvailableFields[0];
    setFilters([...filters, {
      field: firstField.name,
      operator: firstField.operators[0]?.value || 'eq',
      value: firstField.type === 'BooleanField' ? true : '',
      logical: 'AND',
    }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, field: keyof ReportFilter, value: any) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    setFilters(updatedFilters);
  };

  const addOrderBy = () => {
    if (allAvailableFields.length === 0) return;
    const firstField = allAvailableFields[0];
    setOrderBy([...orderBy, firstField.name]);
  };

  const removeOrderBy = (index: number) => {
    setOrderBy(orderBy.filter((_, i) => i !== index));
  };

  const updateOrderBy = (index: number, value: string) => {
    const updatedOrderBy = [...orderBy];
    updatedOrderBy[index] = value;
    setOrderBy(updatedOrderBy);
  };

  const handleSave = async () => {
    if (!reportName || !selectedModel || selectedFields.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const reportData = {
        name: reportName,
        description: reportDescription,
        module: reportModule || 'Custom Reports',
        scope: reportScope,
        group: null,
        query_definition: {
          model: selectedModel,
          fields: selectedFields,
          joins: joins.length > 0 ? joins : undefined,
          group_by: groupBy.length > 0 ? groupBy : undefined,
          aggregates: aggregates.length > 0 ? aggregates : undefined,
          filters: filters.length > 0 ? filters : undefined,
          order_by: orderBy.length > 0 ? orderBy : undefined,
        },
      };

      const newReport = await createReport(reportData);
      toast.success('Report created successfully');
      navigate(`/reports/viewer/${newReport.id}`);
    } catch (error) {
      toast.error('Failed to create report');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/reports')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <h1 className="text-3xl font-bold">Create Dynamic Report</h1>
        <p className="text-muted-foreground">
          Build custom reports by selecting data sources and defining queries
        </p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide basic details about your report
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Report Name *</Label>
                <Input
                  id="name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label htmlFor="module">Module</Label>
                <Input
                  id="module"
                  value={reportModule}
                  onChange={(e) => setReportModule(e.target.value)}
                  placeholder="e.g., Admissions Management"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe what this report shows"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="scope">Scope</Label>
              <Select value={reportScope} onValueChange={setReportScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                  <SelectItem value="STATION">Station</SelectItem>
                  <SelectItem value="DEPARTMENT">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Source
            </CardTitle>
            <CardDescription>
              Select the application and model to query data from
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Application *</Label>
                <Select value={selectedApp} onValueChange={handleAppChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent>
                    {apps.map((app) => (
                      <SelectItem key={app.app_label} value={app.app_label}>
                        {app.name} ({app.models_count} models)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Model *</Label>
                <Select
                  value={selectedModel}
                  onValueChange={handleModelChange}
                  disabled={!selectedApp}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.model_path} value={model.model_path}>
                        {model.verbose_name} ({model.fields_count} fields)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Field Selection */}
            {allAvailableFields.length > 0 && (
              <div>
                <Label>Select Fields *</Label>
                <div className="mt-2 border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {allAvailableFields.map((field) => (
                      <div key={field.name} className="flex items-start space-x-2">
                        <Checkbox
                          id={`field-${field.name}`}
                          checked={selectedFields.includes(field.name)}
                          onCheckedChange={(checked) =>
                            handleFieldToggle(field.name, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`field-${field.name}`}
                            className="text-sm font-normal leading-tight"
                          >
                            {field.verbose_name}
                            <div className="text-xs text-muted-foreground mt-1">
                              {field.type}
                              {field.name.includes('__') && (
                                <span className="ml-1 text-blue-600">
                                  (from join)
                                </span>
                              )}
                            </div>
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Query Configuration */}
        {selectedModel && (
          <>
            {/* Joins */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Joins</CardTitle>
                  <Button size="sm" onClick={addJoin}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Join
                  </Button>
                </div>
                <CardDescription>
                  Define relationships to include related data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {joins.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No joins defined. Click "Add Join" to create one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {joins.map((join, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Select
                            value={join.field}
                            onValueChange={(value) => updateJoin(index, 'field', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allAvailableFields
                                .filter((f) => f.is_relation && !f.name.includes('__'))
                                .map((field) => (
                                  <SelectItem key={field.name} value={field.name}>
                                    {field.verbose_name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={join.type}
                            onValueChange={(value) => updateJoin(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="left">Left Join</SelectItem>
                              <SelectItem value="inner">Inner Join</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeJoin(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Group By */}
            <Card>
              <CardHeader>
                <CardTitle>Group By</CardTitle>
                <CardDescription>
                  Fields to group results by (for aggregation)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {allAvailableFields.map((field) => (
                    <div key={field.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`group-${field.name}`}
                        checked={groupBy.includes(field.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setGroupBy([...groupBy, field.name]);
                          } else {
                            setGroupBy(groupBy.filter((f) => f !== field.name));
                          }
                        }}
                      />
                      <Label htmlFor={`group-${field.name}`} className="text-sm font-normal">
                        {field.verbose_name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Aggregates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Aggregates</CardTitle>
                  <Button size="sm" onClick={addAggregate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Aggregate
                  </Button>
                </div>
                <CardDescription>
                  Define aggregate functions (COUNT, SUM, AVG, etc.)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {aggregates.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No aggregates defined. Click "Add Aggregate" to create one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {aggregates.map((aggregate, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 grid grid-cols-3 gap-2">
                          <Select
                            value={aggregate.field}
                            onValueChange={(value) => updateAggregate(index, 'field', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allAvailableFields.map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.verbose_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={aggregate.function}
                            onValueChange={(value) => updateAggregate(index, 'function', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AGGREGATE_FUNCTIONS.map((func) => (
                                <SelectItem key={func.value} value={func.value}>
                                  {func.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input
                            value={aggregate.alias}
                            onChange={(e) => updateAggregate(index, 'alias', e.target.value)}
                            placeholder="Alias"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAggregate(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </CardTitle>
                  <Button size="sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Filter
                  </Button>
                </div>
                <CardDescription>
                  Define conditions to filter the data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No filters defined. Click "Add Filter" to create one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filters.map((filter, index) => {
                      const field = allAvailableFields.find((f) => f.name === filter.field);
                      return (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1 grid grid-cols-4 gap-2">
                            <Select
                              value={filter.field}
                              onValueChange={(value) => updateFilter(index, 'field', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {allAvailableFields.map((field) => (
                                  <SelectItem key={field.name} value={field.name}>
                                    {field.verbose_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Select
                              value={filter.operator}
                              onValueChange={(value) => updateFilter(index, 'operator', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {field?.operators.map((op) => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={filter.value}
                              onChange={(e) => updateFilter(index, 'value', e.target.value)}
                              placeholder="Value"
                              type={field?.ui_type === 'date' ? 'date' : 'text'}
                            />
                            <Select
                              value={filter.logical || 'AND'}
                              onValueChange={(value) => updateFilter(index, 'logical', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LOGICAL_OPERATORS.map((op) => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFilter(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order By */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <SortAsc className="h-5 w-5 mr-2" />
                    Order By
                  </CardTitle>
                  <Button size="sm" onClick={addOrderBy}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Sort
                  </Button>
                </div>
                <CardDescription>
                  Define the sort order for results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orderBy.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No sort order defined. Click "Add Sort" to create one.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {orderBy.map((field, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <Select
                            value={field.startsWith('-') ? field.substring(1) : field}
                            onValueChange={(value) => {
                              const currentField = orderBy[index];
                              const isDesc = currentField.startsWith('-');
                              const newField = isDesc ? `-${value}` : value;
                              updateOrderBy(index, newField);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {allAvailableFields.map((field) => (
                                <SelectItem key={field.name} value={field.name}>
                                  {field.verbose_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={field.startsWith('-') ? 'desc' : 'asc'}
                            onValueChange={(direction) => {
                              const fieldName = field.startsWith('-') ? field.substring(1) : field;
                              const newField = direction === 'desc' ? `-${fieldName}` : fieldName;
                              updateOrderBy(index, newField);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SORT_DIRECTIONS.map((dir) => (
                                <SelectItem key={dir.value} value={dir.value}>
                                  {dir.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOrderBy(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving || !reportName || !selectedModel || selectedFields.length === 0}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Creating...' : 'Create Report'}
          </Button>
        </div>
      </div>
    </div>
  );
}
