import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Fingerprint, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface BiometricCaptureProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
}

export default function BiometricCapture({ 
  value, 
  onChange, 
  label = 'Fingerprint Verification',
  disabled = false 
}: BiometricCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle');

  const handleCapture = async () => {
    setIsCapturing(true);
    setCaptureStatus('capturing');
    
    // Simulate biometric capture process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock biometric signature
      const biometricData = `BIO_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      onChange(biometricData);
      setCaptureStatus('success');
      toast.success('Fingerprint captured successfully');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setCaptureStatus('idle');
      }, 3000);
    } catch (error) {
      setCaptureStatus('error');
      toast.error('Failed to capture fingerprint');
      
      setTimeout(() => {
        setCaptureStatus('idle');
      }, 3000);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setCaptureStatus('idle');
    toast.info('Fingerprint data cleared');
  };

  const getStatusColor = () => {
    switch (captureStatus) {
      case 'capturing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadge = () => {
    if (value && captureStatus === 'success') {
      return <Badge className="bg-green-600">Captured</Badge>;
    }
    if (value && captureStatus === 'idle') {
      return <Badge className="bg-green-600">Verified</Badge>;
    }
    if (captureStatus === 'error') {
      return <Badge variant="destructive">Failed</Badge>;
    }
    if (captureStatus === 'capturing') {
      return <Badge className="bg-blue-600">Capturing...</Badge>;
    }
    return <Badge variant="outline">Not Captured</Badge>;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm">{label}</label>
        {getStatusBadge()}
      </div>
      
      <Card className="border-2 border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Fingerprint Icon with Animation */}
            <div className={`relative ${getStatusColor()}`}>
              {captureStatus === 'capturing' ? (
                <Loader2 className="h-16 w-16 animate-spin" />
              ) : captureStatus === 'success' ? (
                <div className="relative">
                  <Fingerprint className="h-16 w-16" />
                  <CheckCircle className="h-6 w-6 absolute -top-1 -right-1 bg-white rounded-full text-green-600" />
                </div>
              ) : captureStatus === 'error' ? (
                <div className="relative">
                  <Fingerprint className="h-16 w-16" />
                  <AlertCircle className="h-6 w-6 absolute -top-1 -right-1 bg-white rounded-full text-red-600" />
                </div>
              ) : (
                <Fingerprint className="h-16 w-16" />
              )}
            </div>

            {/* Status Message */}
            <div className="text-center">
              {captureStatus === 'capturing' && (
                <p className="text-sm text-blue-600">Please place finger on scanner...</p>
              )}
              {captureStatus === 'success' && (
                <p className="text-sm text-green-600">Fingerprint captured successfully</p>
              )}
              {captureStatus === 'error' && (
                <p className="text-sm text-red-600">Capture failed. Please try again.</p>
              )}
              {captureStatus === 'idle' && !value && (
                <p className="text-sm text-gray-500">No fingerprint data captured</p>
              )}
              {captureStatus === 'idle' && value && (
                <p className="text-sm text-green-600">Fingerprint verified and stored</p>
              )}
            </div>

            {/* Biometric Data Display */}
            {value && (
              <div className="w-full p-3 bg-gray-50 rounded border text-xs text-gray-600 font-mono break-all">
                {value}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 w-full">
              <Button
                type="button"
                onClick={handleCapture}
                disabled={disabled || isCapturing}
                className="flex-1"
                style={{ backgroundColor: isCapturing ? '#94a3b8' : '#650000' }}
              >
                {isCapturing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Capturing...
                  </>
                ) : (
                  <>
                    <Fingerprint className="mr-2 h-4 w-4" />
                    {value ? 'Re-capture' : 'Capture Fingerprint'}
                  </>
                )}
              </Button>
              
              {value && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={disabled || isCapturing}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
