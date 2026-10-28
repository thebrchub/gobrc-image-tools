
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';
import {
  ArrowLeft,
  Archive,
  Check,
  ChevronDown,
  Download,
  FileImage,
  FilePlus2,
  LoaderCircle,
  RefreshCw,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';

import SEO from '../components/SEO';
import {
  validateConverterFile,
  formatFileSize,
} from '../lib/image/fileValidation';
import {
  processImage,
  type OutputFormat,
  type ResizeOptions,
} from '../lib/image/canvasProcessor';

type FileStatus = 'ready' | 'converting' | 'done' | 'error';

interface ImageSettings extends ResizeOptions {
  quality: number;
}

interface QueueItem {
  id: string;
  file: File;
  format: OutputFormat;
  status: FileStatus;
  blob: Blob | null;
  settings: ImageSettings;
  error?: string;
}

const formats: { value: OutputFormat; label: string }[] = [
  { value: 'image/webp', label: 'WebP' },
  { value: 'image/jpeg', label: 'JPG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/svg+xml', label: 'SVG' },
];

const DEFAULT_SETTINGS: ImageSettings = {
  quality: 0.9,
  enabled: false,
  width: 1200,
  height: 800,
  maintainAspectRatio: true,
};

function extensionFor(format: OutputFormat): string {
  switch (format) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/svg+xml':
      return 'svg';
  }
}

function outputName(file: File, format: OutputFormat): string {
  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
  return `${baseName}.${extensionFor(format)}`;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface FormatSelectProps {
  value: OutputFormat;
  onChange: (value: OutputFormat) => void;
  disabled?: boolean;
  label: string;
}

function FormatSelect({
  value,
  onChange,
  disabled = false,
  label,
}: FormatSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = formats.find((format) => format.value === value);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between gap-3 border bg-white px-3 py-2.5 text-left text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#F36B45]/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? 'border-[#F36B45]'
            : 'border-[#E9E1D8] hover:border-[#D6C7BA]'
        }`}
      >
        <span className="font-medium text-[#302D29]">
          {selected?.label ?? 'Choose format'}
        </span>

        <ChevronDown
          size={16}
          aria-hidden="true"
          className={`shrink-0 text-[#817970] transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-[calc(100%+6px)] z-[100] w-full min-w-[160px] border border-[#E9E1D8] bg-white p-1 shadow-lg"
        >
          {formats.map((format) => {
            const active = format.value === value;

            return (
              <button
                key={format.value}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(format.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                  active
                    ? 'bg-[#FFF0E9] text-[#C84C2C]'
                    : 'text-[#35302B] hover:bg-[#FAF7F2]'
                }`}
              >
                <span className="font-medium">{format.label}</span>
                {active && <Check size={15} aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface SettingsDialogProps {
  fileName: string;
  format: OutputFormat;
  settings: ImageSettings;
  onClose: () => void;
  onApply: (settings: ImageSettings, applyToAll: boolean) => void;
  disabled: boolean;
}

function SettingsDialog({
  fileName,
  format,
  settings,
  onClose,
  onApply,
  disabled,
}: SettingsDialogProps) {
  const [draft, setDraft] = useState<ImageSettings>({ ...settings });
  const [applyToAll, setApplyToAll] = useState(false);
  const supportsQuality =
    format === 'image/jpeg' || format === 'image/webp';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#242323]/45 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-settings-title"
        className="max-h-[90vh] w-full max-w-[520px] overflow-y-auto border border-[#E9E1D8] bg-white shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-[#EEE8E1] px-5 py-4">
          <div className="min-w-0">
            <h2
              id="image-settings-title"
              className="text-lg font-bold text-[#242323]"
            >
              Image settings
            </h2>
            <p title={fileName} className="mt-1 truncate text-sm text-[#817970]">
              {fileName}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="p-1 text-[#817970] hover:bg-[#FAF7F2] hover:text-[#242323]"
          >
            <X size={20} />
          </button>
        </header>

        <div className="space-y-6 px-5 py-5">
          {supportsQuality && (
            <div>
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="image-quality"
                  className="text-sm font-medium text-[#35302B]"
                >
                  Quality
                </label>
                <span className="text-sm font-semibold text-[#D9512B]">
                  {Math.round(draft.quality * 100)}%
                </span>
              </div>

              <input
                id="image-quality"
                type="range"
                min="10"
                max="100"
                step="5"
                value={Math.round(draft.quality * 100)}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    quality: Number(event.target.value) / 100,
                  }))
                }
                className="mt-3 w-full cursor-pointer accent-[#F36B45]"
              />

              <div className="mt-1 flex justify-between text-xs text-[#92887E]">
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
            </div>
          )}

          <div className="border-t border-[#EEE8E1] pt-5">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#35302B]">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    enabled: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-[#D9512B]"
              />
              Resize during conversion
            </label>

            {draft.enabled && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="resize-width"
                      className="mb-1.5 block text-sm text-[#6F6A64]"
                    >
                      Width (px)
                    </label>
                    <input
                      id="resize-width"
                      type="number"
                      min="1"
                      max="12000"
                      value={draft.width}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          width: Number(event.target.value),
                        }))
                      }
                      className="w-full border border-[#E9E1D8] bg-white px-3 py-2.5 text-sm text-[#302D29] outline-none focus:border-[#F36B45] focus:ring-2 focus:ring-[#F36B45]/15"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="resize-height"
                      className="mb-1.5 block text-sm text-[#6F6A64]"
                    >
                      Height (px)
                    </label>
                    <input
                      id="resize-height"
                      type="number"
                      min="1"
                      max="12000"
                      value={draft.height}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          height: Number(event.target.value),
                        }))
                      }
                      className="w-full border border-[#E9E1D8] bg-white px-3 py-2.5 text-sm text-[#302D29] outline-none focus:border-[#F36B45] focus:ring-2 focus:ring-[#F36B45]/15"
                    />
                  </div>
                </div>

                <label className="flex cursor-pointer items-start gap-3 text-sm text-[#6F6A64]">
                  <input
                    type="checkbox"
                    checked={draft.maintainAspectRatio}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        maintainAspectRatio: event.target.checked,
                      }))
                    }
                    className="mt-0.5 h-4 w-4 accent-[#D9512B]"
                  />
                  <span>
                    <span className="font-medium text-[#35302B]">
                      Maintain aspect ratio
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[#817970]">
                      Fits the image inside the specified dimensions without
                      stretching it.
                    </span>
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        <footer className="flex flex-col gap-4 border-t border-[#EEE8E1] bg-[#FCFAF6] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6F6A64]">
            <input
              type="checkbox"
              checked={applyToAll}
              onChange={(event) => setApplyToAll(event.target.checked)}
              className="h-4 w-4 accent-[#D9512B]"
            />
            Apply settings to all
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-[#E9E1D8] bg-white px-4 py-2.5 text-sm font-semibold text-[#6F6A64] hover:bg-[#FAF7F2]"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                disabled ||
                (draft.enabled &&
                  (!Number.isFinite(draft.width) ||
                    !Number.isFinite(draft.height) ||
                    draft.width < 1 ||
                    draft.height < 1 ||
                    draft.width > 12000 ||
                    draft.height > 12000))
              }
              onClick={() => onApply(draft, applyToAll)}
              className="bg-[#F36B45] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#D9512B] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

export default function ImageConverter() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<QueueItem[]>([]);
  const [defaultFormat, setDefaultFormat] =
    useState<OutputFormat>('image/webp');
  const [applyToAll, setApplyToAll] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [pageError, setPageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [settingsItemId, setSettingsItemId] = useState<string | null>(null);

  const completed = items.filter(
    (item) => item.status === 'done' && item.blob,
  );

  const pending = items.some(
    (item) => item.status === 'ready' || item.status === 'error',
  );

  const allFinished =
    items.length > 0 &&
    items.every(
      (item) => item.status === 'done' || item.status === 'error',
    );

  const settingsItem = items.find((item) => item.id === settingsItemId);

  function addFiles(fileList: FileList | File[]) {
    const additions: QueueItem[] = [];
    const errors: string[] = [];

    for (const file of Array.from(fileList)) {
      const validationError = validateConverterFile(file);

      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
        continue;
      }

      additions.push({
        id: crypto.randomUUID(),
        file,
        format: defaultFormat,
        status: 'ready',
        blob: null,
        settings: { ...DEFAULT_SETTINGS },
      });
    }

    if (additions.length) {
      setItems((current) => [...current, ...additions]);
    }

    setPageError(
      errors.length
        ? `${errors.length} file(s) could not be added. ${errors
            .slice(0, 2)
            .join(' ')}`
        : '',
    );
  }

  function changeGlobalFormat(nextFormat: OutputFormat) {
    setDefaultFormat(nextFormat);

    if (applyToAll) {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          format: nextFormat,
          status: 'ready',
          blob: null,
          error: undefined,
        })),
      );
    }
  }

  function toggleApplyToAll(enabled: boolean) {
    setApplyToAll(enabled);

    if (enabled) {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          format: defaultFormat,
          status: 'ready',
          blob: null,
          error: undefined,
        })),
      );
    }
  }

  function changeItemFormat(id: string, format: OutputFormat) {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              format,
              status: 'ready',
              blob: null,
              error: undefined,
            }
          : item,
      ),
    );
  }

  function applySettings(
    settings: ImageSettings,
    applySettingsToAll: boolean,
  ) {
    setItems((current) =>
      current.map((item) => {
        if (!applySettingsToAll && item.id !== settingsItemId) {
          return item;
        }

        return {
          ...item,
          settings: { ...settings },
          status: 'ready',
          blob: null,
          error: undefined,
        };
      }),
    );

    setSettingsItemId(null);
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));

    if (settingsItemId === id) {
      setSettingsItemId(null);
    }
  }

  async function convertAll() {
    if (isConverting || !items.length) return;

    setIsConverting(true);
    setPageError('');

    const queue = items.filter(
      (item) => item.status === 'ready' || item.status === 'error',
    );

    try {
      for (const item of queue) {
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: 'converting',
                  blob: null,
                  error: undefined,
                }
              : entry,
          ),
        );

        try {
          const result = await processImage(
            item.file,
            item.settings.quality,
            item.format,
            {
              enabled: item.settings.enabled,
              width: item.settings.width,
              height: item.settings.height,
              maintainAspectRatio: item.settings.maintainAspectRatio,
            },
          );

          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    status: 'done',
                    blob: result.blob,
                    error: undefined,
                  }
                : entry,
            ),
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : 'Conversion failed. Try another format.';

          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? {
                    ...entry,
                    status: 'error',
                    blob: null,
                    error: message,
                  }
                : entry,
            ),
          );
        }
      }
    } finally {
      setIsConverting(false);
    }
  }

  async function downloadZip() {
    if (completed.length < 2 || isZipping) return;

    setIsZipping(true);
    setPageError('');

    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();

      for (const item of completed) {
        if (!item.blob) continue;

        const baseName = outputName(item.file, item.format);
        let name = baseName;
        let number = 2;

        while (usedNames.has(name.toLowerCase())) {
          const dot = baseName.lastIndexOf('.');
          name = `${baseName.slice(0, dot)}-${number}${baseName.slice(dot)}`;
          number += 1;
        }

        usedNames.add(name.toLowerCase());
        zip.file(name, item.blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, 'gobrc-converted-images.zip');
    } catch {
      setPageError(
        'Could not create the ZIP file. Try downloading the images individually.',
      );
    } finally {
      setIsZipping(false);
    }
  }

  function reset() {
    setItems([]);
    setPageError('');
    setSettingsItemId(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <>
      <SEO
        title="Free Image Converter Online | GoBRC"
        description="Convert multiple images to JPG, PNG, WebP or SVG online. Adjust image quality and dimensions, convert in batches and download individually or as a ZIP."
        path="/image-converter"
      />

      <main className="min-h-[70vh] bg-[#F9F7F3] px-4 py-8 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-[1100px]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6F6A64] hover:text-[#D9512B]"
          >
            <ArrowLeft size={16} />
            All image tools
          </Link>

          <header className="mt-6">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#242323] sm:text-4xl">
              Image Converter
            </h1>
            <p className="mt-2 text-sm text-[#777067]">
              Convert multiple images at once. Everything runs in your browser.
            </p>
          </header>

          <section className="relative mt-7 border border-[#E9E1D8] bg-white">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                addFiles(event.dataTransfer.files);
              }}
              className={`flex flex-col items-center justify-center border-b border-dashed px-5 py-8 text-center transition-colors ${
                isDragging ? 'bg-[#FFF0E9]' : 'bg-white'
              }`}
            >
              <FilePlus2
                size={26}
                aria-hidden="true"
                className="text-[#D9512B]"
              />
              <p className="mt-3 text-sm font-semibold text-[#242323]">
                Drop images here
              </p>
              <p className="mt-1 text-xs text-[#817970]">
                Or select multiple files from your device
              </p>

              <input
                ref={inputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.ico,.svg"
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) addFiles(event.target.files);
                  event.target.value = '';
                }}
              />

              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 bg-[#F36B45] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#D9512B]"
              >
                <FilePlus2 size={16} />
                Add images
              </button>
            </div>

            {items.length > 0 && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E1D8] bg-[#FCFAF6] px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-[#35302B]">
                      Convert to
                    </span>

                    <div className="w-[120px]">
                      <FormatSelect
                        value={defaultFormat}
                        onChange={changeGlobalFormat}
                        disabled={isConverting}
                        label="Default output format"
                      />
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#6F6A64]">
                      <input
                        type="checkbox"
                        checked={applyToAll}
                        disabled={isConverting}
                        onChange={(event) =>
                          toggleApplyToAll(event.target.checked)
                        }
                        className="h-4 w-4 accent-[#D9512B]"
                      />
                      Apply to all
                    </label>
                  </div>

                  <span className="text-xs text-[#817970]">
                    {items.length} {items.length === 1 ? 'file' : 'files'}
                  </span>
                </div>

                <div className="divide-y divide-[#EEE8E1]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_130px_110px_32px] sm:gap-4 sm:px-5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <FileImage
                          size={20}
                          aria-hidden="true"
                          className="shrink-0 text-[#8A8177]"
                        />
                        <div className="min-w-0">
                          <p
                            title={item.file.name}
                            className="truncate text-sm font-medium text-[#302D29]"
                          >
                            {item.file.name}
                          </p>
                          <p className="mt-0.5 text-xs text-[#92887E]">
                            {formatFileSize(item.file.size)}
                            {item.status === 'done' && item.blob
                              ? ` · ${formatFileSize(item.blob.size)} converted`
                              : ''}
                          </p>
                          {item.status === 'error' && (
                            <p className="mt-1 text-xs text-red-600">
                              {item.error}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="col-start-1 row-start-2 sm:col-start-2 sm:row-start-1">
                        <FormatSelect
                          value={item.format}
                          onChange={(format) =>
                            changeItemFormat(item.id, format)
                          }
                          disabled={isConverting || applyToAll}
                          label={`Output format for ${item.file.name}`}
                        />
                      </div>

                      <div className="col-start-2 row-start-1 flex items-center justify-end gap-3 sm:col-start-3">
                        {item.status === 'converting' ? (
                          <span
                            role="status"
                            className="inline-flex items-center gap-1.5 text-xs text-[#8A8177]"
                          >
                            <LoaderCircle size={14} className="animate-spin" />
                            <span className="hidden sm:inline">Converting</span>
                          </span>
                        ) : item.status === 'done' && item.blob ? (
                          <button
                            type="button"
                            onClick={() =>
                              downloadBlob(
                                item.blob!,
                                outputName(item.file, item.format),
                              )
                            }
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#438052] hover:text-[#2E653D]"
                          >
                            <Download size={15} />
                            Download
                          </button>
                        ) : item.status === 'error' ? (
                          <span className="text-xs font-medium text-red-600">
                            Failed
                          </span>
                        ) : (
                          <span className="text-xs text-[#92887E]">Ready</span>
                        )}
                      </div>

                      <div className="col-start-2 row-start-2 flex items-center justify-end gap-1 sm:col-start-4 sm:row-start-1">
                        <button
                          type="button"
                          onClick={() => setSettingsItemId(item.id)}
                          disabled={isConverting}
                          aria-label={`Settings for ${item.file.name}`}
                          title="Image settings"
                          className="flex h-8 w-8 items-center justify-center text-[#817970] transition-colors hover:bg-[#FFF0E9] hover:text-[#D9512B] disabled:opacity-40"
                        >
                          <Settings2 size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={isConverting}
                          aria-label={`Remove ${item.file.name}`}
                          title="Remove file"
                          className="flex h-8 w-8 items-center justify-center text-[#92887E] transition-colors hover:bg-[#FFF0E9] hover:text-[#D9512B] disabled:opacity-40"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-[#E9E1D8] bg-[#FCFAF6] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <button
                    type="button"
                    onClick={reset}
                    disabled={isConverting || isZipping}
                    className="inline-flex items-center justify-center gap-2 self-start text-sm font-medium text-[#777067] hover:text-[#D9512B] disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                    Clear files
                  </button>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {completed.length > 1 && (
                      <button
                        type="button"
                        onClick={downloadZip}
                        disabled={isZipping || isConverting}
                        className="inline-flex items-center justify-center gap-2 border border-[#D8CFC5] bg-white px-4 py-2.5 text-sm font-semibold text-[#35302B] hover:border-[#B8A99B] disabled:opacity-50"
                      >
                        {isZipping ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Archive size={16} />
                        )}
                        {isZipping
                          ? 'Creating ZIP…'
                          : `Download all ZIP (${completed.length})`}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={convertAll}
                      disabled={isConverting || !pending}
                      className="inline-flex items-center justify-center gap-2 bg-[#F36B45] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#D9512B] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isConverting ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : allFinished ? (
                        <RefreshCw size={16} />
                      ) : (
                        <Check size={16} />
                      )}
                      {isConverting
                        ? 'Converting…'
                        : allFinished
                          ? 'Retry failed'
                          : 'Convert all'}
                    </button>
                  </div>
                </div>

                {isConverting && (
                  <p
                    role="status"
                    className="border-t border-[#E9E1D8] px-5 py-2.5 text-xs text-[#777067]"
                  >
                    Processing images in your browser. Keep this tab open until
                    conversion finishes.
                  </p>
                )}
              </>
            )}
          </section>

          {pageError && (
            <div
              role="alert"
              className="mt-4 flex items-start justify-between gap-3 border border-[#F0D0C6] bg-[#FFF5F2] p-3 text-sm text-[#A34232]"
            >
              <p>{pageError}</p>
              <button
                type="button"
                onClick={() => setPageError('')}
                aria-label="Dismiss message"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {items.length > 0 && (
            <p className="mt-3 text-xs leading-5 text-[#92887E]">
              {completed.length} of {items.length} files converted.
              {items.some((item) => item.status === 'error')
                ? ' Failed files can be retried; successful files remain available.'
                : ''}
            </p>
          )}

          <p className="mt-5 text-xs leading-5 text-[#92887E]">
            Images are processed locally in your browser. SVG export wraps
            raster images in an SVG file; it does not turn pixels into editable
            vector paths.
          </p>
        </div>
      </main>

      {settingsItem && (
        <SettingsDialog
          fileName={settingsItem.file.name}
          format={settingsItem.format}
          settings={settingsItem.settings}
          disabled={isConverting}
          onClose={() => setSettingsItemId(null)}
          onApply={applySettings}
        />
      )}
    </>
  );
}
