import React, { useState, useRef, useCallback } from "react";
import { Upload, X, File, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { cn } from "../ui/utils";

interface FileUploadProps {
  id: string;
  name: string;
  allowedFileTypes?: string[]; // e.g., ['image/png', 'image/jpeg', 'application/pdf']
  description?: string;
  maxSizeMB?: number;
  onFileChange?: (base64Data: string | null, file: File | null) => void;
  value?: string | null; // For controlled component
  disabled?: boolean;
  className?: string;
  icon?: React.ReactNode; // Optional custom icon for empty state
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  name,
  allowedFileTypes = [],
  description,
  maxSizeMB = 5,
  onFileChange,
  icon,
  value,
  disabled = false,
  className,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        setUploadProgress(0);
      };
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };
      
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type
    if (allowedFileTypes.length > 0 && !allowedFileTypes.includes(file.type)) {
      const allowedExtensions = allowedFileTypes
        .map((type) => type.split("/")[1])
        .join(", ");
      return `Invalid file type. Allowed types: ${allowedExtensions}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);
      
      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setSelectedFile(file);
      setIsProcessing(true);

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        setBase64Data(base64);
        setUploadProgress(100);
        
        // Call parent callback
        if (onFileChange) {
          onFileChange(base64, file);
        }
      } catch (err) {
        setError("Failed to process file");
        setSelectedFile(null);
        setBase64Data(null);
        if (onFileChange) {
          onFileChange(null, null);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [allowedFileTypes, maxSizeMB, onFileChange]
  );

  // Handle file input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Handle remove file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setBase64Data(null);
    setUploadProgress(0);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onFileChange) {
      onFileChange(null, null);
    }
  };

  // Handle click to open file dialog
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={id}
        name={name}
        type="file"
        className="hidden"
        onChange={handleInputChange}
        accept={allowedFileTypes.join(",")}
        disabled={disabled}
      />

      {/* Upload area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
          isDragging && !disabled
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-500"
        )}
      >
        {!selectedFile ? (
          // Empty state
          <div className="flex flex-col items-center justify-center text-center space-y-2">
            {icon ? (
              <div className="text-gray-400">{icon}</div>
            ) : (
              <Upload className="h-10 w-10 text-gray-400" />
            )}
            <div className="text-sm">
              <span className="font-semibold text-primary">Click to upload</span>
              <span className="text-gray-600"> or drag and drop</span>
            </div>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
            {allowedFileTypes.length > 0 && (
              <p className="text-xs text-gray-500">
                Allowed types: {allowedFileTypes.map((type) => type.split("/")[1]).join(", ")}
              </p>
            )}
            <p className="text-xs text-gray-500">Max size: {maxSizeMB}MB</p>
          </div>
        ) : (
          // File selected state
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  {uploadProgress === 100 && !error ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : error ? (
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  ) : (
                    <File className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={disabled}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            {isProcessing && uploadProgress < 100 && (
              <div className="space-y-1">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-gray-500 text-right">
                  {uploadProgress}%
                </p>
              </div>
            )}

            {/* Success message */}
            {uploadProgress === 100 && !error && (
              <p className="text-xs text-green-600">
                File uploaded and encoded successfully
              </p>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
