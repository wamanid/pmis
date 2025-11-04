import { Users } from 'lucide-react';

export function PrisonerEntryExit() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Prisoner Entry and Exit</h1>
        <p className="text-muted-foreground">
          Manage prisoner entry and exit records with barcode scanning
        </p>
      </div>
      <div className="bg-muted/50 rounded-lg p-12 text-center">
        <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="mb-2">Prisoner Entry & Exit Module</h3>
        <p className="text-muted-foreground">
          This module is under development
        </p>
      </div>
    </div>
  );
}
