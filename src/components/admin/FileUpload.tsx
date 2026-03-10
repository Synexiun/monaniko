'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  accept?: string;
  folder?: string;
}

export default function FileUpload({
  value,
  onChange,
  maxFiles = 5,
  accept = 'image/*',
  folder = 'mona-niko-gallery',
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const remaining = maxFiles - value.length;
      if (remaining <= 0) return;

      const filesToUpload = files.slice(0, remaining).filter((f) => f.type.startsWith('image/'));
      if (!filesToUpload.length) return;

      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append('folder', folder);
        filesToUpload.forEach((file) => formData.append('files', file));

        const res = await fetch('/api/upload', { method: 'POST', body: formData });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(err.error || 'Upload failed');
        }

        const { urls } = await res.json();
        onChange([...value, ...urls]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [value, onChange, maxFiles, folder]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      uploadFiles(Array.from(e.dataTransfer.files));
    },
    [uploadFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        uploadFiles(Array.from(e.target.files));
      }
      if (inputRef.current) inputRef.current.value = '';
    },
    [uploadFiles]
  );

  const removeFile = useCallback(
    (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    },
    [value, onChange]
  );

  const canAddMore = value.length < maxFiles;

  return (
    <div className="space-y-3">
      {canAddMore && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isUploading && inputRef.current?.click()}
          className={cn(
            'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-8 transition-colors',
            isUploading ? 'cursor-wait opacity-70' : 'cursor-pointer',
            isDragging
              ? 'border-gray-400 bg-gray-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={maxFiles > 1}
            onChange={handleFileSelect}
            className="hidden"
            disabled={isUploading}
          />
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isUploading ? (
                <span className="font-medium text-gray-700">Uploading…</span>
              ) : (
                <>
                  <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP up to 10MB
              {maxFiles > 1 && ` (${value.length}/${maxFiles} files)`}
            </p>
          </div>
        </div>
      )}

      {uploadError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {uploadError}
        </p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Upload preview ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-full h-full items-center justify-center hidden">
                <ImageIcon className="w-8 h-8 text-gray-300" />
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
