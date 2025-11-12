import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner@2.0.3';
import { 
  Camera, 
  Upload, 
  X, 
  CreditCard,
  FileImage,
  CheckCircle,
  Loader2,
  RotateCw,
  ZoomIn
} from 'lucide-react';

interface IdCaptureScreenProps {
  value?: IdCaptureData;
  onChange?: (data: IdCaptureData) => void;
  disabled?: boolean;
  showTitle?: boolean;
}

export interface IdCaptureData {
  idType: string;
  idNumber: string;
  frontImage: string;
  backImage: string;
}

const ID_TYPES = [
  { value: 'national_id', label: 'National ID' },
  { value: 'passport', label: 'Passport' },
  { value: 'driving_permit', label: 'Driving Permit' }
];

export default function IdCaptureScreen({ 
  value, 
  onChange, 
  disabled = false,
  showTitle = true 
}: IdCaptureScreenProps) {
  const [idData, setIdData] = useState<IdCaptureData>(value || {
    idType: '',
    idNumber: '',
    frontImage: '',
    backImage: ''
  });

  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [currentSide, setCurrentSide] = useState<'front' | 'back'>('front');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update parent component when data changes
  const updateData = (updates: Partial<IdCaptureData>) => {
    const newData = { ...idData, ...updates };
    setIdData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  // Start camera
  const startCamera = async (side: 'front' | 'back') => {
    setCurrentSide(side);
    setIsCameraDialogOpen(true);
    setIsCameraActive(false);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please check permissions.');
      setIsCameraDialogOpen(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
    setIsCameraDialogOpen(false);
    setPreviewImage(null);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewImage(imageData);
      setIsCapturing(false);
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setPreviewImage(null);
  };

  // Confirm and save photo
  const confirmPhoto = () => {
    if (!previewImage) return;

    if (currentSide === 'front') {
      updateData({ frontImage: previewImage });
      toast.success('ID front side captured successfully');
    } else {
      updateData({ backImage: previewImage });
      toast.success('ID back side captured successfully');
    }

    stopCamera();
  };

  // Handle file upload
  const handleFileUpload = (side: 'front' | 'back', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      if (side === 'front') {
        updateData({ frontImage: imageData });
        toast.success('ID front side uploaded successfully');
      } else {
        updateData({ backImage: imageData });
        toast.success('ID back side uploaded successfully');
      }
    };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = '';
  };

  // Remove image
  const removeImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      updateData({ frontImage: '' });
      toast.info('ID front side removed');
    } else {
      updateData({ backImage: '' });
      toast.info('ID back side removed');
    }
  };

  // Preview full image
  const [fullPreviewImage, setFullPreviewImage] = useState<string | null>(null);

  const ImageCaptureCard = ({ side, label }: { side: 'front' | 'back'; label: string }) => {
    const imageData = side === 'front' ? idData.frontImage : idData.backImage;
    const hasImage = !!imageData;

    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">{label}</Label>
              {hasImage ? (
                <Badge className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Captured
                </Badge>
              ) : (
                <Badge variant="outline">Not Captured</Badge>
              )}
            </div>

            {hasImage ? (
              <div className="relative">
                <img 
                  src={imageData} 
                  alt={label}
                  className="w-full h-48 object-cover rounded-lg border-2 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ borderColor: '#650000' }}
                  onClick={() => setFullPreviewImage(imageData)}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeImage(side)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={() => setFullPreviewImage(imageData)}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <FileImage className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">No image captured</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => startCamera(side)}
                disabled={disabled}
                style={{ borderColor: '#650000' }}
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                style={{ borderColor: '#650000' }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(side, e)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex items-center gap-2" style={{ color: '#650000' }}>
          <CreditCard className="h-6 w-6" />
          <h2>ID Document Capture</h2>
        </div>
      )}

      {/* ID Type and Number */}
      <Card>
        <CardHeader style={{ borderBottom: '2px solid #650000' }}>
          <CardTitle style={{ color: '#650000' }}>ID Information</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idType">ID Type *</Label>
              <Select
                value={idData.idType}
                onValueChange={(value) => updateData({ idType: value })}
                disabled={disabled}
              >
                <SelectTrigger id="idType" style={{ borderColor: idData.idType ? '#650000' : undefined }}>
                  <SelectValue placeholder="Select ID type..." />
                </SelectTrigger>
                <SelectContent>
                  {ID_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number *</Label>
              <Input
                id="idNumber"
                type="text"
                value={idData.idNumber}
                onChange={(e) => updateData({ idNumber: e.target.value.toUpperCase() })}
                placeholder="Enter ID number"
                disabled={disabled}
                style={{ borderColor: idData.idNumber ? '#650000' : undefined }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ID Images */}
      <Card>
        <CardHeader style={{ borderBottom: '2px solid #650000' }}>
          <CardTitle style={{ color: '#650000' }}>ID Document Images</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageCaptureCard side="front" label="ID Front Side" />
            <ImageCaptureCard side="back" label="ID Back Side" />
          </div>
        </CardContent>
      </Card>

      {/* Camera Dialog */}
      <Dialog open={isCameraDialogOpen} onOpenChange={(open) => !open && stopCamera()}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>
              Capture {currentSide === 'front' ? 'Front' : 'Back'} Side of ID
            </DialogTitle>
            <DialogDescription>
              Position the ID document within the frame and capture a clear image
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {previewImage ? (
              <div className="relative">
                <img 
                  src={previewImage} 
                  alt="Preview" 
                  className="w-full rounded-lg border-2"
                  style={{ borderColor: '#650000' }}
                />
              </div>
            ) : (
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
                {isCameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 text-white animate-spin" />
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
          </div>

          <DialogFooter>
            {previewImage ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={retakePhoto}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button
                  type="button"
                  onClick={confirmPhoto}
                  style={{ backgroundColor: '#650000' }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm & Save
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={stopCamera}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!isCameraActive || isCapturing}
                  style={{ backgroundColor: '#650000' }}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isCapturing ? 'Capturing...' : 'Capture Photo'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Image Preview Dialog */}
      <Dialog open={!!fullPreviewImage} onOpenChange={(open) => !open && setFullPreviewImage(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle style={{ color: '#650000' }}>ID Document Preview</DialogTitle>
          </DialogHeader>
          {fullPreviewImage && (
            <div className="w-full">
              <img 
                src={fullPreviewImage} 
                alt="Full preview" 
                className="w-full rounded-lg border-2"
                style={{ borderColor: '#650000' }}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFullPreviewImage(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
