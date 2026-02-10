import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { ChevronRight, ChevronDown, Eye, Edit, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DietaryRequirement,
  DIETARY_REQUIREMENT_API_ENDPOINTS,
  fetchDietaryRequirements,
} from '../../../../services/medical/restrictionAndDietary/dietaryRequirementService';
import axiosInstance from '../../../../services/axiosInstance';

interface GroupedData {
  prisoner_restriction_id: string;
  prisoner_number: string;
  prisoner_name: string;
  reason_name: string;
  requirements: DietaryRequirement[];
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  dateRange: string;
}

interface DietaryRequirementsGroupedTableProps {
  selectedPrisonerId?: string;
  onView: (record: DietaryRequirement) => void;
  onEdit: (record: DietaryRequirement) => void;
  onDelete: (record: DietaryRequirement) => void;
  tableKey: number;
}

const DietaryRequirementsGroupedTable: React.FC<DietaryRequirementsGroupedTableProps> = ({
  selectedPrisonerId,
  onView,
  onEdit,
  onDelete,
  tableKey,
}) => {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [selectedPrisonerId, tableKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const filters: Record<string, any> = {};
      if (selectedPrisonerId) {
        filters.prisoner_restriction = selectedPrisonerId;
      }

      // Fetch all records (adjust page_size as needed)
      const response = await fetchDietaryRequirements(1, 1000, '', filters);
      
      // Group by prisoner restriction
      const grouped = groupByRestriction(response.results);
      setGroupedData(grouped);
    } catch (error: any) {
      console.error('Failed to fetch dietary requirements:', error);
      toast.error('Failed to load dietary requirements');
    } finally {
      setLoading(false);
    }
  };

  const groupByRestriction = (records: DietaryRequirement[]): GroupedData[] => {
    const groups: Record<string, DietaryRequirement[]> = {};

    records.forEach((record) => {
      const key = record.prisoner_restriction;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(record);
    });

    return Object.entries(groups).map(([restrictionId, requirements]) => {
      const firstRecord = requirements[0];
      const activeCount = requirements.filter((r) => isActive(r)).length;
      const inactiveCount = requirements.length - activeCount;

      // Extract prisoner info from prisoner_restriction_info
      // Format: "PRISONER_NUMBER - Prisoner Name (Reason)"
      const info = firstRecord.prisoner_restriction_info || '';
      const parts = info.split(' - ');
      const prisoner_number = parts[0] || 'N/A';
      const rest = parts[1] || '';
      const nameParts = rest.split(' (');
      const prisoner_name = nameParts[0] || 'N/A';
      const reason_name = nameParts[1]?.replace(')', '') || 'N/A';

      // Date range
      const dates = requirements.map((r) => new Date(r.start_date));
      const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));
      const dateRange = `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;

      return {
        prisoner_restriction_id: restrictionId,
        prisoner_number,
        prisoner_name,
        reason_name,
        requirements,
        totalCount: requirements.length,
        activeCount,
        inactiveCount,
        dateRange,
      };
    });
  };

  const isActive = (record: DietaryRequirement) => {
    const today = new Date();
    const startDate = new Date(record.start_date);
    const endDate = record.end_date ? new Date(record.end_date) : null;

    if (today < startDate) return false;
    if (endDate && today > endDate) return false;
    return true;
  };

  const toggleGroup = (restrictionId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(restrictionId)) {
        newSet.delete(restrictionId);
      } else {
        newSet.add(restrictionId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedGroups(new Set(groupedData.map((g) => g.prisoner_restriction_id)));
  };

  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Filter groups by search term
  const filteredGroups = groupedData.filter((group) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      group.prisoner_number.toLowerCase().includes(lowerSearch) ||
      group.prisoner_name.toLowerCase().includes(lowerSearch) ||
      group.reason_name.toLowerCase().includes(lowerSearch) ||
      group.requirements.some((r) =>
        r.dietary_requirement.toLowerCase().includes(lowerSearch)
      )
    );
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">Loading dietary requirements...</p>
        </CardContent>
      </Card>
    );
  }

  if (filteredGroups.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No dietary requirements found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <Maximize2 className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
        </div>

        <input
          type="text"
          placeholder="Search by prisoner, reason, or requirement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 max-w-md px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#650000]"
        />
      </div>

      {/* Grouped Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#650000' }}>
                <tr>
                  <th className="text-left text-white px-4 py-3 font-medium">
                    Prisoner Restriction
                  </th>
                  <th className="text-center text-white px-4 py-3 font-medium w-32">
                    Total
                  </th>
                  <th className="text-center text-white px-4 py-3 font-medium w-32">
                    Active
                  </th>
                  <th className="text-center text-white px-4 py-3 font-medium w-32">
                    Inactive
                  </th>
                  <th className="text-left text-white px-4 py-3 font-medium w-48">
                    Date Range
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group) => {
                  const isExpanded = expandedGroups.has(group.prisoner_restriction_id);

                  return (
                    <React.Fragment key={group.prisoner_restriction_id}>
                      {/* Group Header Row */}
                      <tr
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => toggleGroup(group.prisoner_restriction_id)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold" style={{ color: '#650000' }}>
                                {group.prisoner_number} | {group.prisoner_name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {group.reason_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge style={{ backgroundColor: '#650000' }} className="text-white">
                            {group.totalCount}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="default" className="bg-green-600">
                            {group.activeCount}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="secondary">
                            {group.inactiveCount}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {group.dateRange}
                        </td>
                      </tr>

                      {/* Expanded Rows */}
                      {isExpanded && (
                        <>
                          {/* Nested Table Header */}
                          <tr className="bg-gray-100 border-b">
                            <td colSpan={5} className="px-4 py-0">
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    <th className="text-left text-gray-700 px-4 py-2 text-sm font-medium">
                                      Dietary Requirement
                                    </th>
                                    <th className="text-left text-gray-700 px-4 py-2 text-sm font-medium w-32">
                                      Start Date
                                    </th>
                                    <th className="text-left text-gray-700 px-4 py-2 text-sm font-medium w-32">
                                      End Date
                                    </th>
                                    <th className="text-center text-gray-700 px-4 py-2 text-sm font-medium w-24">
                                      Status
                                    </th>
                                    <th className="text-center text-gray-700 px-4 py-2 text-sm font-medium w-32">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                              </table>
                            </td>
                          </tr>

                          {/* Nested Rows */}
                          {group.requirements.map((requirement, index) => (
                            <tr
                              key={requirement.id || index}
                              className="bg-gray-50 border-b border-gray-200"
                            >
                              <td colSpan={5} className="px-4 py-0">
                                <table className="w-full">
                                  <tbody>
                                    <tr>
                                      <td className="px-4 py-3 text-sm">
                                        <div className="max-w-md">
                                          <div className="line-clamp-2" title={requirement.dietary_requirement}>
                                            {requirement.dietary_requirement}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm w-32">
                                        {new Date(requirement.start_date).toLocaleDateString()}
                                      </td>
                                      <td className="px-4 py-3 text-sm w-32">
                                        {requirement.end_date
                                          ? new Date(requirement.end_date).toLocaleDateString()
                                          : 'Ongoing'}
                                      </td>
                                      <td className="px-4 py-3 text-center w-24">
                                        <Badge
                                          variant={isActive(requirement) ? 'default' : 'secondary'}
                                        >
                                          {isActive(requirement) ? 'Active' : 'Inactive'}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3 text-center w-32">
                                        <div className="flex items-center justify-center gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onView(requirement);
                                            }}
                                            className="text-blue-600 hover:bg-transparent hover:text-blue-600"
                                          >
                                            <Eye className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onEdit(requirement);
                                            }}
                                            className="text-amber-600 hover:bg-transparent hover:text-amber-600"
                                          >
                                            <Edit className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              onDelete(requirement);
                                            }}
                                            className="text-red-600 hover:bg-transparent hover:text-red-600"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredGroups.length} restriction{filteredGroups.length !== 1 ? 's' : ''} with{' '}
        {filteredGroups.reduce((sum, g) => sum + g.totalCount, 0)} total requirement
        {filteredGroups.reduce((sum, g) => sum + g.totalCount, 0) !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default DietaryRequirementsGroupedTable;
