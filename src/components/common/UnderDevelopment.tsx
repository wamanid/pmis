import { Building2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export function UnderDevelopment() {
  const location = useLocation();
  
  // Convert path to readable title
  const getTitle = () => {
    const path = location.pathname.replace(/^\//, '').replace(/\//g, '-');
    return path
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>{getTitle()}</h1>
        <p className="text-muted-foreground">Module under development</p>
      </div>
      <div className="bg-muted/50 rounded-lg p-12 text-center">
        <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="mb-2">Coming Soon</h3>
        <p className="text-muted-foreground">
          This module is under development
        </p>
      </div>
    </div>
  );
}
