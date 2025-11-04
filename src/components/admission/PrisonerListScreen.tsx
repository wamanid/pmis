import { useNavigate } from 'react-router-dom';
import { Eye, Edit, Shield, AlertCircle } from 'lucide-react';
import { DataTable } from '../common/DataTable';
import type { DataTableColumn } from '../common/DataTable.types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Prisoner } from '../../models/admission';

/**
 * Prisoner List Screen
 * Displays a list of admitted prisoners using the DataTable component
 */
function PrisonerListScreen() {
  const navigate = useNavigate();

  // Helper function to render security rating badge
  const getSecurityRatingBadge = (rating: number) => {
    if (rating >= 4) {
      return <Badge variant="destructive">High Risk ({rating})</Badge>;
    } else if (rating >= 2) {
      return <Badge variant="secondary">Medium Risk ({rating})</Badge>;
    } else {
      return <Badge variant="default">Low Risk ({rating})</Badge>;
    }
  };

  // Define table columns
  const columns: DataTableColumn[] = [
    {
      key: 'prison_number',
      label: 'Prison Number',
      sortable: true,
      filterable: true,
    },
    {
      key: 'full_name',
      label: 'Full Name',
      sortable: true,
      filterable: true,
    },
    {
      key: 'avg_security_rating',
      label: 'Security Rating',
      sortable: true,
      render: (value) => getSecurityRatingBadge(value as number),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value) =>
        value ? (
          <Badge variant="default" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      key: 'habitual',
      label: 'Habitual',
      sortable: true,
      filterable: true,
      render: (value) =>
        value ? (
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Yes
          </Badge>
        ) : (
          <span className="text-muted-foreground">No</span>
        ),
    },
    {
      key: 'is_dangerous',
      label: 'Dangerous',
      sortable: true,
      filterable: true,
      render: (value) =>
        value ? (
          <Badge variant="destructive" className="gap-1">
            <Shield className="h-3 w-3" />
            Yes
          </Badge>
        ) : (
          <span className="text-muted-foreground">No</span>
        ),
    },
    {
      key: 'created_datetime',
      label: 'Created Date',
      sortable: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admissions-management/prisoners/${row.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/admissions-management/prisoners/${row.id}/edit`)}
            title="Edit Prisoner"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Admitted Prisoners</h1>
        <p className="text-muted-foreground">
          View and manage all admitted prisoners in the system
        </p>
      </div>

      {/* DataTable */}
      <DataTable
        url="admission/prisoners/"
        title="Prisoner Records"
        columns={columns}
        config={{
          search: true,
          pagination: true,
          lengthMenu: [10, 25, 50, 100],
          export: {
            pdf: true,
            csv: true,
            print: true,
          },
          summary: true,
          rowSpacing: 'normal',
        }}
      />
    </div>
  );
}

export default PrisonerListScreen;
