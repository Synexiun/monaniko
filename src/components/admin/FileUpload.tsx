'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';
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
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const canAddMore = value.length < maxFiles;

  // ── File upload via Cloudinary ──────────────────────────────
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
        setUploadError(
          err instanceof Error
            ? err.message.includes('cloud_name') || err.message.includes('Cloudinary') || err.message.includes('Invalid')
              ? 'Cloudinary is not configured. Use the "Paste URL" tab instead, or add Cloudinary credentials to your environment.'
              : err.message
            : 'Upload failed'
        );
      } finally {
        setIsUploading(false);
      }
    },
    [value, onChange, maxFiles, folder]
  );

  // ── Drag & drop handlers ────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current += 1;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault(); e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      uploadFiles(Array.from(e.dataTransfer.files));
    },
    [uploadFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) uploadFiles(Array.from(e.target.files));
      if (inputRef.current) inputRef.current.value = '';
    },
    [uploadFiles]
  );

  // ── URL input ───────────────────────────────────────────────
  const addUrl = useCallback(() => {
    const url = urlInput.trim();
    setUrlError(null);

    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setUrlError('Please enter a valid URL (must start with http:// or https://)');
      return;
    }

    if (value.includes(url)) {
      setUrlError('This URL is already added.');
      return;
    }

    if (value.length >= maxFiles) {
      setUrlError(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    onChange([...value, url]);
    setUrlInput('');
  }, [urlInput, value, onChange, maxFiles]);

  const removeFile = useCallback(
    (index: number) => onChange(value.filter((_, i) => i !== index)),
    [value, onChange]
  );

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm w-fit">
        <button
          type="button"
          onClick={() => { setTab('upload'); setUploadError(null); }}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 transition-colors',
            tab === 'upload' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => { setTab('url'); setUrlError(null); }}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 border-l border-gray-200 transition-colors',
            tab === 'url' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          )}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Paste URL
        </button>
      </div>

      {/* Upload tab */}
      {tab === 'upload' && canAddMore && (
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
                <><span className="font-medium text-gray-900">Click to upload</span> or drag and drop</>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, WEBP up to 10MB
              {maxFiles > 1 && ` · ${value.length}/${maxFiles} images`}
            </p>
          </div>
        </div>
      )}

      {tab === 'upload' && uploadError && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
          <p className="font-medium mb-0.5">Upload failed</p>
          <p className="text-red-500">{uploadError}</p>
          <button
            type="button"
            onClick={() => setTab('url')}
            className="mt-1.5 text-xs underline text-red-600 hover:text-red-800"
          >
            Switch to Paste URL instead →
          </button>
        </div>
      )}

      {/* URL tab */}
      {tab === 'url' && canAddMore && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlError(null); }}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addUrl())}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 transition-colors"
            />
            <button
              type="button"
              onClick={addUrl}
              disabled={!urlInput.trim()}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-400">
            Paste a direct image URL (from Cloudinary, Google Drive, Dropbox, etc.)
            {maxFiles > 1 && ` · ${value.length}/${maxFiles} images`}
          </p>
          {urlError && (
            <p className="text-xs text-red-600">{urlError}</p>
          )}
        </div>
      )}

      {/* Image previews */}
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
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const t = e.currentTarget;
                  t.style.display = 'none';
                  const fb = t.nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = 'flex';
                }}
              />
              <div className="w-full h-full items-center justify-center hidden flex-col gap-1 p-2">
                <ImageIcon className="w-6 h-6 text-gray-300" />
                <p className="text-[9px] text-gray-400 text-center break-all line-clamp-2">{url}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-all"
                aria-label={`Remove image ${index + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
