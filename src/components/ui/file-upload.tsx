import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useImageUpload } from "@/hooks/use-image-upload";
import { ImagePlus, X, Upload, Trash2, FileText, File } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload?: (url: string, file: File) => void;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
  allowedExtensions?: string[];
}

export function FileUpload({ 
  onUpload, 
  acceptedTypes = ["image/*", ".pdf"], 
  maxSize = 10,
  className,
  allowedExtensions = ["jpg", "jpeg", "png", "gif", "pdf"]
}: FileUploadProps) {
  const {
    previewUrl,
    fileName,
    fileType,
    uploadedFile,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  } = useImageUpload({
    onUpload,
    acceptedTypes,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    setError(null);
    
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && !allowedExtensions.includes(extension)) {
      setError(`File type not supported. Allowed: ${allowedExtensions.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file && validateFile(file)) {
        const fakeEvent = {
          target: {
            files: [file],
          },
        } as React.ChangeEvent<HTMLInputElement>;
        handleFileChange(fakeEvent);
      }
    },
    [handleFileChange, maxSize, allowedExtensions],
  );

  const isImage = fileType?.startsWith('image/');
  const isPDF = fileType === 'application/pdf';

  const getFileIcon = () => {
    if (isImage) return <ImagePlus className="h-6 w-6 text-white/60" />;
    if (isPDF) return <FileText className="h-6 w-6 text-white/60" />;
    return <File className="h-6 w-6 text-white/60" />;
  };

  return (
    <div className={cn("w-full max-w-md space-y-4", className)}>
      <Input
        type="file"
        accept={acceptedTypes.join(',')}
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && validateFile(file)) {
            handleFileChange(e);
          }
        }}
      />

      {!previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "flex h-48 cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-white/20 bg-white/5 backdrop-blur-sm transition-colors hover:bg-white/10",
            isDragging && "border-violet-500/50 bg-violet-500/10",
          )}
        >
          <div className="rounded-full bg-white/10 p-3 shadow-sm">
            <ImagePlus className="h-6 w-6 text-white/60" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/90">Click to select file</p>
            <p className="text-xs text-white/60">
              or drag and drop here
            </p>
            <p className="text-xs text-white/40 mt-1">
              Supports: {allowedExtensions.join(', ')} (max {maxSize}MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="group relative h-48 overflow-hidden rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm">
            {isImage ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-3">
                {getFileIcon()}
                <div className="text-center">
                  <p className="text-sm font-medium text-white/90 truncate max-w-[200px]">
                    {fileName}
                  </p>
                  <p className="text-xs text-white/60">
                    {isPDF ? 'PDF Document' : 'File uploaded'}
                  </p>
                </div>
              </div>
            )}
            
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleThumbnailClick}
                className="h-9 w-9 p-0 bg-white/20 hover:bg-white/30 border-white/20"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                className="h-9 w-9 p-0 bg-red-500/80 hover:bg-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {fileName && (
            <div className="mt-2 flex items-center gap-2 text-sm text-white/70">
              <span className="truncate flex-1">{fileName}</span>
              <button
                onClick={handleRemove}
                className="ml-auto rounded-full p-1 hover:bg-white/10 text-white/60 hover:text-white/90"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
          {error}
        </div>
      )}
    </div>
  );
}