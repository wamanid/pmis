import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AvailableFilter } from '../../models/reports';

interface FilterValue {
  field: string;
  operator: string;
  value: any;
}

interface ReportFiltersProps {
  availableFilters: AvailableFilter[];
  onFiltersChange: (filters: Record<string, any>) => void;
}

const OPERATOR_LABELS: Record<string, string> = {
  eq: 'Equals',
  ne: 'Not Equals',
  contains: 'Contains',
  startswith: 'Starts With',
  endswith: 'Ends With',
  isnull: 'Is Null',
  gt: 'Greater Than',
  gte: 'Greater Than or Equal',
  lt: 'Less Than',
  lte: 'Less Than or Equal',
  in: 'In',
};

export function ReportFilters({ availableFilters, onFiltersChange }: ReportFiltersProps) {
  const [filters, setFilters] = useState<FilterValue[]>([]);

  const addFilter = () => {
    if (availableFilters.length === 0) return;
    
    const firstFilter = availableFilters[0];
    const newFilter: FilterValue = {
      field: firstFilter.field,
      operator: firstFilter.operators[0],
      value: firstFilter.type === 'boolean' ? true : '',
    };
    
    const updatedFilters = [...filters, newFilter];
    setFilters(updatedFilters);
    updateParentFilters(updatedFilters);
  };

  const removeFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index);
    setFilters(updatedFilters);
    updateParentFilters(updatedFilters);
  };

  const updateFilter = (index: number, field: keyof FilterValue, value: any) => {
    const updatedFilters = [...filters];
    updatedFilters[index] = { ...updatedFilters[index], [field]: value };
    
    // If field changed, reset operator and value
    if (field === 'field') {
      const filterDef = availableFilters.find(f => f.field === value);
      if (filterDef) {
        updatedFilters[index].operator = filterDef.operators[0];
        updatedFilters[index].value = filterDef.type === 'boolean' ? true : '';
      }
    }
    
    setFilters(updatedFilters);
    updateParentFilters(updatedFilters);
  };

  const updateParentFilters = (currentFilters: FilterValue[]) => {
    const filterParams: Record<string, any> = {};
    currentFilters.forEach((filter, index) => {
      filterParams[`filter_${index}_field`] = filter.field;
      filterParams[`filter_${index}_operator`] = filter.operator;
      filterParams[`filter_${index}_value`] = filter.value;
    });
    onFiltersChange(filterParams);
  };

  const clearFilters = () => {
    setFilters([]);
    onFiltersChange({});
  };

  if (!availableFilters || availableFilters.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Report Filters</CardTitle>
          <div className="flex gap-2">
            {filters.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
            <Button size="sm" onClick={addFilter}>
              <Plus className="h-4 w-4 mr-2" />
              Add Filter
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filters.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No filters applied. Click "Add Filter" to add filtering criteria.
          </p>
        ) : (
          <div className="space-y-3">
            {filters.map((filter, index) => {
              const filterDef = availableFilters.find(f => f.field === filter.field);
              
              return (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Field Selection */}
                    <Select
                      value={filter.field}
                      onValueChange={(value) => updateFilter(index, 'field', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFilters.map((f) => (
                          <SelectItem key={f.field} value={f.field}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Operator Selection */}
                    <Select
                      value={filter.operator}
                      onValueChange={(value) => updateFilter(index, 'operator', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {filterDef?.operators.map((op) => (
                          <SelectItem key={op} value={op}>
                            {OPERATOR_LABELS[op] || op}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Value Input */}
                    {filterDef?.type === 'boolean' ? (
                      <Select
                        value={String(filter.value)}
                        onValueChange={(value) => updateFilter(index, 'value', value === 'true')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">True</SelectItem>
                          <SelectItem value="false">False</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : filterDef?.type === 'number' ? (
                      <Input
                        type="number"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', Number(e.target.value))}
                        placeholder="Enter value"
                      />
                    ) : (
                      <Input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, 'value', e.target.value)}
                        placeholder="Enter value"
                      />
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFilter(index)}
                    className="shrink-0"
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
  );
}
