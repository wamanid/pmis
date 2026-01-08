import { useState } from 'react';
import { StaffSelect } from './StaffSelect';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';

/**
 * Demo component showing how to use StaffSelect
 */
export function StaffSelectDemo() {
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Staff Select Demo</CardTitle>
        <CardDescription>
          Select a staff member from the searchable dropdown
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="staff-select">Select Staff</Label>
          <StaffSelect
            value={selectedStaffId}
            onValueChange={setSelectedStaffId}
            placeholder="Search and select staff..."
          />
        </div>

        {selectedStaffId && (
          <div className="rounded-md bg-muted p-4">
            <p className="text-sm font-medium">Selected Staff ID:</p>
            <p className="text-sm text-muted-foreground">{selectedStaffId}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label>With Filters (Available Staff Only)</Label>
          <StaffSelect
            value={selectedStaffId}
            onValueChange={setSelectedStaffId}
            placeholder="Select available staff..."
            availableOnly={true}
            statusFilter="active"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default StaffSelectDemo;
