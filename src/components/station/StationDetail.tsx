import { useEffect, useState } from 'react';
import { MapPin, Phone, Mail, Calendar, Users, Building2, Shield, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { fetchStationById } from '../../services/systemAdministrationService';
import type { Station } from '../../models/system_administration';

export interface StationDetailProps {
  stationId: string;
  onError?: (error: string) => void;
}

export function StationDetail({ stationId, onError }: StationDetailProps) {
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStationById(stationId);
        setStation(data);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load station details';
        setError(errorMessage);
        onError?.(errorMessage);
        console.error('Failed to load station:', err);
      } finally {
        setLoading(false);
      }
    };

    if (stationId) {
      loadStation();
    }
  }, [stationId, onError]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !station) {
    return (
      <Card className="border-red-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>{error || 'Station not found'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{station.name}</CardTitle>
              <CardDescription className="mt-1">
                {station.station_code && `Station Code: ${station.station_code}`}
              </CardDescription>
            </div>
            <Badge variant={station.is_active ? 'default' : 'secondary'}>
              {station.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Region</p>
                <p className="text-sm font-medium">{station.region_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">District</p>
                <p className="text-sm font-medium">{station.district_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Security Level</p>
                <p className="text-sm font-medium">{station.security_level_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date Opened</p>
                <p className="text-sm font-medium">
                  {station.date_opened ? new Date(station.date_opened).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Station Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Classification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="text-sm font-medium">{station.category_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Station Type</p>
              <p className="text-sm font-medium">{station.station_type_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="text-sm font-medium">{station.gender_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jurisdiction Area</p>
              <p className="text-sm font-medium">{station.jurisdiction_area_name || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Capacity Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Capacity & Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Manual Capacity</p>
              <p className="text-sm font-medium">{station.manual_capacity || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Capacity</p>
              <p className="text-sm font-medium">{station.capacity || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Occupancy</p>
              <p className="text-sm font-medium">{station.occupancy || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Congestion</p>
              <p className="text-sm font-medium">{station.congestion || 'N/A'}</p>
            </div>
            {station.is_overcrowded && (
              <Badge variant="destructive" className="mt-2">
                Overcrowded
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-medium">{station.phone_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Fax Number</p>
                  <p className="text-sm font-medium">{station.fax_number || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{station.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Alternate Email</p>
                  <p className="text-sm font-medium">{station.alternate_email || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Physical Address</p>
                  <p className="text-sm font-medium">{station.physical_address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Postal Address</p>
                  <p className="text-sm font-medium">{station.postal_address || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">GPS Location</p>
                  <p className="text-sm font-medium">{station.gps_location || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">PMIS Available</p>
              <Badge variant={station.pmis_available ? 'default' : 'secondary'} className="mt-1">
                {station.pmis_available ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {new Date(station.created_datetime).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium">
                {new Date(station.updated_datetime).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
