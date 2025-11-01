import { ClipboardCheck } from 'lucide-react';

export function PendingApprovals() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Pending Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve pending admissions
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-12 text-center">
        <ClipboardCheck className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="mb-2">Pending Approvals Module</h3>
        <p className="text-muted-foreground">
          This section will display admissions pending approval
        </p>
      </div>
    </div>
  );
}
