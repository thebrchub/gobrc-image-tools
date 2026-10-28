import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Crop,
  Lock,
  LockKeyholeOpen,
  RefreshCw,
  SlidersHorizontal,
  LoaderCircle,
  Info,
} from 'lucide-react';
import SEO from '../components/SEO';

import FileDropzone from '../components/tools/FileDropzone';
import ImagePreview from '../components/tools/ImagePreview';
import DownloadPanel from '../components/tools/DownloadPanel';

import { validateImageFile, formatFileSize } from '../lib/image/fileValidation';
import { loadImage } from '../lib/image/imageLoader';
import { type OutputFormat } from '../lib/image/canvasProcessor';
import {
  resizeImage,
  type ResizeMode,
  type CropArea,
} from '../lib/image/resizeProcessor';

const MAX_DIMENSION = 12000;

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [source, setSource] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState('1200');
  const [height, setHeight] = useState('800');
  const [lockRatio, setLockRatio] = useState(true);
  const [mode, setMode] = useState<ResizeMode>('fit');
  const [format, setFormat] = useState<OutputFormat>('image/webp');
  const [quality, setQuality] = useState(0.9);

  const [cropEnabled, setCropEnabled] = useState(false);
  const [crop, setCrop] = useState<CropArea>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalRatio = source.width > 0 && source.height > 0
    ? source.width / source.height
    : 1;

  const validWidth = Number(width);
  const validHeight = Number(height);

  const validDimensions =
    Number.isInteger(validWidth) &&
    Number.isInteger(validHeight) &&
    validWidth >= 1 &&
    validHeight >= 1 &&
    validWidth <= MAX_DIMENSION &&
    validHeight <= MAX_DIMENSION;

  const activeCrop = useMemo(() => {
    if (!cropEnabled) return undefined;

    return {
      x: crop.x,
      y: crop.y,
      width: crop.width,
      height: crop.height,
    };
  }, [cropEnabled, crop]);

  const handleFile = async (nextFile: File) => {
    const validationError = validateImageFile(nextFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setOutputBlob(null);
    setFile(nextFile);

    try {
      const loaded = await loadImage(nextFile);
      const nextWidth = loaded.width;
      const nextHeight = loaded.height;

      setSource({ width: nextWidth, height: nextHeight });
      setWidth(String(nextWidth));
      setHeight(String(nextHeight));
      setCrop({
        x: 0,
        y: 0,
        width: nextWidth,
        height: nextHeight,
      });
      setCropEnabled(false);
    } catch {
      setFile(null);
      setSource({ width: 0, height: 0 });
      setError('We could not read this image. Please choose another file.');
    }
  };

  useEffect(() => {
    if (!file) {
      setOriginalUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    if (!outputBlob) {
      setOutputUrl(null);
      return;
    }

    const url = URL.createObjectURL(outputBlob);
    setOutputUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [outputBlob]);

  useEffect(() => {
    if (!file || !validDimensions) {
      setOutputBlob(null);
      setIsLoading(false);
      return;
    }

    if (
      cropEnabled &&
      (
        crop.width < 1 ||
        crop.height < 1 ||
        crop.x < 0 ||
        crop.y < 0 ||
        crop.x + crop.width > source.width ||
        crop.y + crop.height > source.height
      )
    ) {
      setOutputBlob(null);
      setIsLoading(false);
      setError('The crop area must stay inside the original image.');
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setOutputBlob(null);
    setError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await resizeImage(file, {
          width: validWidth,
          height: validHeight,
          mode,
          format,
          quality,
          crop: activeCrop,
        });

        if (!cancelled) setOutputBlob(result.blob);
      } catch (processingError) {
        if (!cancelled) {
          setError(
            processingError instanceof Error
              ? processingError.message
              : 'Could not resize this image.',
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    file,
    validDimensions,
    validWidth,
    validHeight,
    mode,
    format,
    quality,
    cropEnabled,
    activeCrop,
    crop,
    source.width,
    source.height,
  ]);

  const updateWidth = (value: string) => {
    setWidth(value);
    const nextWidth = Number(value);

    if (
      lockRatio &&
      source.width > 0 &&
      Number.isInteger(nextWidth) &&
      nextWidth > 0
    ) {
      setHeight(String(Math.max(1, Math.round(nextWidth / originalRatio))));
    }
  };

  const updateHeight = (value: string) => {
    setHeight(value);
    const nextHeight = Number(value);

    if (
      lockRatio &&
      source.height > 0 &&
      Number.isInteger(nextHeight) &&
      nextHeight > 0
    ) {
      setWidth(String(Math.max(1, Math.round(nextHeight * originalRatio))));
    }
  };

  const updateCrop = (key: keyof CropArea, value: string) => {
    const numericValue = value === '' ? 0 : Number(value);
    setCrop((current) => ({
      ...current,
      [key]: Number.isFinite(numericValue)
        ? Math.max(0, Math.floor(numericValue))
        : 0,
    }));
  };

  const reset = () => {
    setFile(null);
    setOutputBlob(null);
    setSource({ width: 0, height: 0 });
    setWidth('1200');
    setHeight('800');
    setLockRatio(true);
    setMode('fit');
    setFormat('image/webp');
    setQuality(0.9);
    setCropEnabled(false);
    setCrop({ x: 0, y: 0, width: 0, height: 0 });
    setError(null);
    setIsLoading(false);
  };

  return (
    <>
    <SEO
  title="Free Image Resizer & Cropper Online | GoBRC"
  description="Resize images to your desired dimensions and crop them for your needs. Preview your changes and download the result with GoBRC Image Tools."
  path="/image-resizer"
/>
    <main className="min-h-[70vh] bg-[#F9F7F3] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1200px]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6A64] hover:text-[#D9512B]"
        >
          <ArrowLeft size={16} />
          All image tools
        </Link>

        <header className="mt-7 max-w-3xl">
          <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#D9512B]">
            IMAGE TOOL 03
          </p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.055em] text-[#242323] sm:text-5xl">
            Image Resizer & Cropper
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#777067] sm:text-base">
            Get the exact image dimensions you need. Preserve proportions,
            fit or fill a canvas, and optionally crop using pixel coordinates.
          </p>
        </header>

        <div className="mt-9 grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5">
            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display font-extrabold text-[#242323]">
                  1. Choose an image
                </h2>
                {file && (
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#817970] hover:text-[#D9512B]"
                  >
                    <RefreshCw size={14} />
                    Start over
                  </button>
                )}
              </div>

              <FileDropzone onFile={handleFile} disabled={isLoading} />

              {file && (
                <div className="mt-4 border border-[#E9E1D8] bg-[#FCFAF6] p-3">
                  <p className="truncate text-sm font-bold text-[#35302B]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-[#817970]">
                    Original: {source.width} × {source.height} px · {formatFileSize(file.size)}
                  </p>
                </div>
              )}
            </section>

            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#D9512B]" />
                <h2 className="font-display font-extrabold text-[#242323]">
                  2. Set dimensions
                </h2>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                <div>
                  <label htmlFor="resize-width" className="mb-2 block text-sm font-bold text-[#242323]">
                    Width (px)
                  </label>
                  <input
                    id="resize-width"
                    type="number"
                    min="1"
                    max={MAX_DIMENSION}
                    value={width}
                    onChange={(event) => updateWidth(event.target.value)}
                    className="min-h-12 w-full border border-[#E9E1D8] bg-[#FCFAF6] px-3 text-sm outline-none focus:border-[#F36B45]"
                  />
                </div>

                <button
                  type="button"
                  aria-pressed={lockRatio}
                  aria-label={lockRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                  onClick={() => setLockRatio((value) => !value)}
                  className={`mb-0.5 flex h-11 w-11 items-center justify-center border ${
                    lockRatio
                      ? 'border-[#F0B09A] bg-[#FFF0E9] text-[#D9512B]'
                      : 'border-[#E9E1D8] bg-white text-[#817970]'
                  }`}
                  title={lockRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                >
                  {lockRatio ? <Lock size={17} /> : <LockKeyholeOpen size={17} />}
                </button>

                <div>
                  <label htmlFor="resize-height" className="mb-2 block text-sm font-bold text-[#242323]">
                    Height (px)
                  </label>
                  <input
                    id="resize-height"
                    type="number"
                    min="1"
                    max={MAX_DIMENSION}
                    value={height}
                    onChange={(event) => updateHeight(event.target.value)}
                    className="min-h-12 w-full border border-[#E9E1D8] bg-[#FCFAF6] px-3 text-sm outline-none focus:border-[#F36B45]"
                  />
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-[#817970]">
                {lockRatio
                  ? 'Aspect ratio is locked. Changing either dimension adjusts the other.'
                  : 'Aspect ratio is unlocked. You can set width and height independently.'}
              </p>

              {!validDimensions && (
                <p role="alert" className="mt-3 text-xs font-semibold text-[#A34232]">
                  Enter whole-number dimensions from 1 to {MAX_DIMENSION.toLocaleString()} pixels.
                </p>
              )}

              <div className="mt-6 border-t border-[#E9E1D8] pt-5">
                <label className="mb-2 block text-sm font-bold text-[#242323]">
                  Resize method
                </label>

                <div className="grid gap-2">
                  {([
                    ['fit', 'Fit inside', 'Show the full image; unused space may remain.'],
                    ['cover', 'Fill and crop', 'Fill the exact dimensions, cropping overflow from the center.'],
                    ['stretch', 'Stretch', 'Fill the exact dimensions, which may distort the image.'],
                  ] as const).map(([value, label, description]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={mode === value}
                      onClick={() => setMode(value)}
                      className={`border p-3 text-left ${
                        mode === value
                          ? 'border-[#F36B45] bg-[#FFF6F1]'
                          : 'border-[#E9E1D8] bg-[#FCFAF6] hover:border-[#E9B19D]'
                      }`}
                    >
                      <span className="block text-sm font-bold text-[#35302B]">
                        {label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#817970]">
                        {description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <Crop size={19} className="mt-0.5 text-[#D9512B]" />
                <div className="flex-1">
                  <h2 className="font-display font-extrabold text-[#242323]">
                    3. Crop area (optional)
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#817970]">
                    Set a crop rectangle in the original image's pixel coordinates.
                    The selected area will fill your output dimensions.
                  </p>
                </div>
              </div>

              <label className="mt-4 flex items-center gap-3 text-sm font-semibold text-[#35302B]">
                <input
                  type="checkbox"
                  checked={cropEnabled}
                  disabled={!file}
                  onChange={(event) => {
                    const enabled = event.target.checked;
                    setCropEnabled(enabled);

                    if (enabled && source.width > 0 && source.height > 0) {
                      setCrop({
                        x: 0,
                        y: 0,
                        width: source.width,
                        height: source.height,
                      });
                    }
                  }}
                  className="h-4 w-4 accent-[#F36B45]"
                />
                Enable custom crop
              </label>

              {cropEnabled && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {([
                    ['x', 'Left / X'],
                    ['y', 'Top / Y'],
                    ['width', 'Crop width'],
                    ['height', 'Crop height'],
                  ] as const).map(([key, label]) => (
                    <div key={key}>
                      <label htmlFor={`crop-${key}`} className="mb-1.5 block text-xs font-bold text-[#6F6A64]">
                        {label} (px)
                      </label>
                      <input
                        id={`crop-${key}`}
                        type="number"
                        min="0"
                        max={key === 'x' || key === 'width' ? source.width : source.height}
                        value={crop[key]}
                        onChange={(event) => updateCrop(key, event.target.value)}
                        className="min-h-11 w-full border border-[#E9E1D8] bg-[#FCFAF6] px-3 text-sm outline-none focus:border-[#F36B45]"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-start gap-2 bg-[#F9F7F3] p-3 text-xs leading-5 text-[#817970]">
                <Info size={15} className="mt-0.5 shrink-0" />
                <p>
                  Custom crop uses pixel coordinates rather than a draggable crop
                  box. A visual crop editor can be added as a later improvement.
                </p>
              </div>
            </section>

            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <h2 className="font-display font-extrabold text-[#242323]">
                4. Export settings
              </h2>

              <label htmlFor="resize-format" className="mb-2 mt-4 block text-sm font-bold text-[#242323]">
                Output format
              </label>
              <select
                id="resize-format"
                value={format}
                onChange={(event) => setFormat(event.target.value as OutputFormat)}
                className="min-h-12 w-full border border-[#E9E1D8] bg-[#FCFAF6] px-3 text-sm outline-none focus:border-[#F36B45]"
              >
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/png">PNG (.png)</option>
                <option value="image/webp">WebP (.webp)</option>
              </select>

              {format !== 'image/png' && (
                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <label htmlFor="resize-quality" className="text-sm font-bold text-[#242323]">
                      Output quality
                    </label>
                    <span className="bg-[#FFF0E9] px-2.5 py-1 text-sm font-extrabold text-[#D9512B]">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>
                  <input
                    id="resize-quality"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    className="mt-4 h-2 w-full accent-[#F36B45]"
                  />
                  <div className="mt-2 flex justify-between text-xs text-[#817970]">
                    <span>Smaller file</span>
                    <span>Higher quality</span>
                  </div>
                </div>
              )}

              {format === 'image/jpeg' && file?.type === 'image/png' && (
                <p className="mt-4 bg-[#FFF6F1] p-3 text-xs leading-5 text-[#815B4C]">
                  JPEG does not support transparency. Transparent areas will be
                  filled with white.
                </p>
              )}
            </section>

            {error && (
              <div role="alert" className="flex items-start gap-3 border border-[#F0D0C6] bg-[#FFF5F2] p-4 text-sm text-[#A34232]">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Image processing needs attention</p>
                  <p className="mt-1 leading-6">{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-24">
            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-extrabold text-[#242323]">
                    Preview result
                  </h2>
                  <p className="mt-1 text-xs text-[#817970]">
                    Output: {validDimensions ? `${validWidth} × ${validHeight} px` : 'Check dimensions'}
                  </p>
                </div>
                {isLoading && (
                  <LoaderCircle size={19} className="animate-spin text-[#D9512B]" />
                )}
              </div>

              {isLoading && (
                <div role="status" className="mb-4 flex items-center gap-2 bg-[#FFF0E9] p-3 text-xs font-semibold text-[#A34A2C]">
                  <LoaderCircle size={15} className="animate-spin" />
                  Processing image in your browser…
                </div>
              )}

              <ImagePreview
                originalUrl={originalUrl}
                outputUrl={outputUrl}
                fileName={file?.name ?? ''}
                originalSize={file?.size ?? 0}
                outputSize={outputBlob?.size ?? null}
                width={source.width}
                height={source.height}
                outputLabel="Resized"
              />

              {outputBlob && !isLoading && !error && (
                <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-[#438052]">
                  <CheckCircle2 size={15} className="shrink-0" />
                  Your resized image is ready.
                </p>
              )}
            </section>

            <DownloadPanel
              blob={outputBlob}
              fileName={file?.name ?? 'image'}
              disabled={isLoading || !!error || !validDimensions}
              suffix="resized"
              downloadLabel="Download resized image"
            />

            <p className="text-center text-xs leading-5 text-[#92887E]">
              Images are processed in your browser. Very large dimensions may
              use substantial memory or fail on some devices.
            </p>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}