import { useState, useRef, useCallback } from 'react';
import { Upload, Camera, X, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelect: (file: File, preview: string) => void;
  isAnalyzing: boolean;
  preview: string | null;
  onClear: () => void;
}

export const ImageUploader = ({ onImageSelect, isAnalyzing, preview, onClear }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelect(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (preview) {
    return (
      <div className="relative animate-fade-in">
        <div className="glass-card overflow-hidden">
          <div className="relative aspect-[4/3] w-full">
            <img
              src={preview}
              alt="Food preview"
              className="w-full h-full object-cover"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <span className="text-sm font-medium text-foreground">AI 分析中...</span>
                </div>
              </div>
            )}
          </div>
        </div>
        {!isAnalyzing && (
          <button
            onClick={onClear}
            className="absolute -top-3 -right-3 w-8 h-8 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`upload-zone ${isDragging ? 'upload-zone-active' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-float">
          <Upload className="w-8 h-8 text-primary" />
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-foreground mb-1">
            上传食物图片
          </p>
          <p className="text-sm text-muted-foreground">
            拖拽图片到这里，或点击上传
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <button className="btn-primary flex items-center gap-2">
            <Camera className="w-4 h-4" />
            拍照
          </button>
          <button className="btn-secondary flex items-center gap-2">
            <Upload className="w-4 h-4" />
            选择图片
          </button>
        </div>
      </div>
    </div>
  );
};
