import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileImage,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Info,
} from 'lucide-react';
import SEO from '../components/SEO';

import FileDropzone from '../components/tools/FileDropzone';
import ImagePreview from '../components/tools/ImagePreview';
import DownloadPanel from '../components/tools/DownloadPanel';

import { validateConverterFile } from '../lib/image/fileValidation';
import { loadImage } from '../lib/image/imageLoader';
import {
  processImage,
  type OutputFormat,
} from '../lib/image/canvasProcessor';

const formats: {
  value: OutputFormat;
  label: string;
  description: string;
}[] = [
  {
    value: 'image/jpeg',
    label: 'JPEG',
    description: 'Good for photographs and smaller everyday images.',
  },
  {
    value: 'image/png',
    label: 'PNG',
    description: 'Supports transparency and lossless image encoding.',
  },
  {
    value: 'image/webp',
    label: 'WebP',
    description: 'Modern format that often offers a good size-quality balance.',
  },
  {
  value: 'image/svg+xml',
  label: 'SVG',
  description: 'Vector format, or an SVG wrapper for raster images.',
},
];

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [format, setFormat] = useState<OutputFormat>('image/webp');
  const [quality, setQuality] = useState(0.9);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (nextFile: File) => {
    const validationError = validateConverterFile(nextFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setOutputBlob(null);
    setFile(nextFile);

    try {
      const loaded = await loadImage(nextFile);
      setDimensions({
        width: loaded.width,
        height: loaded.height,
      });
    } catch {
      setFile(null);
      setDimensions({ width: 0, height: 0 });
      setError('We could not read this image. Please try another file.');
    }
  };

  // Create and clean up the original preview URL.
  useEffect(() => {
    if (!file) {
      setOriginalUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Create and clean up the converted preview URL.
  useEffect(() => {
    if (!outputBlob) {
      setOutputUrl(null);
      return;
    }

    const url = URL.createObjectURL(outputBlob);
    setOutputUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [outputBlob]);

  // Convert when the source image, target format or quality changes.
  useEffect(() => {
    if (!file) {
      setOutputBlob(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    setIsLoading(true);
    setOutputBlob(null);
    setError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const result = await processImage(file, quality, format);

        if (!cancelled) {
          setOutputBlob(result.blob);
        }
      } catch (processingError) {
        if (!cancelled) {
          setError(
            processingError instanceof Error
              ? processingError.message
              : 'Conversion failed. Please try another image or format.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [file, format, quality]);

  const reset = () => {
    setFile(null);
    setOutputBlob(null);
    setDimensions({ width: 0, height: 0 });
    setFormat('image/webp');
    setQuality(0.9);
    setError(null);
    setIsLoading(false);
  };

  const selectedFormat = formats.find((item) => item.value === format);

  const sourceFormat = file?.type === 'image/jpeg'
    ? 'JPEG'
    : file?.type === 'image/png'
      ? 'PNG'
      : file?.type === 'image/webp'
        ? 'WebP'
        : null;

 const isSameFormat = file
  ? format === 'image/svg+xml'
    ? file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
    : file.type === format
  : false;

  return (
    <>
    <SEO
  title="Free Image Converter Online | GoBRC"
  description="Convert images between JPG, PNG and WebP formats online. Choose your output format and download the converted image with GoBRC."
  path="/image-converter"
/>
    <main className="min-h-[70vh] bg-[#F9F7F3] px-5 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-[1200px]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#6F6A64] transition-colors hover:text-[#D9512B]"
        >
          <ArrowLeft size={16} />
          All image tools
        </Link>

        <header className="mt-7 max-w-3xl">
          <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#D9512B]">
            IMAGE TOOL 02
          </p>

          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.055em] text-[#242323] sm:text-5xl">
            Image Converter
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777067] sm:text-base">
            Convert images between JPEG, PNG, WebP and SVG. Choose your output
            format, preview the converted image and download it when ready.
          </p>
        </header>

        <div className="mt-9 grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left column */}
          <div className="space-y-5">
            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-display text-base font-extrabold text-[#242323]">
                  1. Choose an image
                </h2>

                {file && (
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#817970] transition-colors hover:text-[#D9512B]"
                  >
                    <RefreshCw size={14} />
                    Start over
                  </button>
                )}
              </div>

              <FileDropzone
  onFile={handleFile}
  disabled={isLoading}
accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif,image/x-icon,image/vnd.microsoft.icon,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.ico,.svg"
supportedFormats="JPG, PNG, WebP, GIF, BMP, AVIF, ICO or SVG"
/>

              {file && (
                <div className="mt-4 flex items-start gap-3 border border-[#E9E1D8] bg-[#FCFAF6] p-3">
                  <FileImage size={18} className="mt-0.5 shrink-0 text-[#D9512B]" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#35302B]">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-[#817970]">
                      Source format: {sourceFormat ?? 'Unknown'}
                      {isSameFormat ? ' · Same as selected output' : ''}
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-5">
                <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#D9512B]">
                  CONVERSION SETTINGS
                </p>
                <h2 className="mt-2 font-display text-base font-extrabold text-[#242323]">
                  2. Choose output format
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {formats.map((item) => {
                  const active = format === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFormat(item.value)}
                      className={`min-w-0 border p-4 text-left transition-colors ${
                        active
                          ? 'border-[#F36B45] bg-[#FFF0E9]'
                          : 'border-[#E9E1D8] bg-[#FCFAF6] hover:border-[#E9B19D]'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center ${
                          active
                            ? 'bg-[#F36B45] text-white'
                            : 'bg-white text-[#6F6257]'
                        }`}
                      >
                        <FileImage size={18} />
                      </span>

                      <span className="mt-3 block text-sm font-extrabold text-[#242323]">
                        {item.label}
                      </span>

                      <span className="mt-1 block text-xs leading-5 text-[#817970]">
                        {item.description}
                      </span>

                      {active && (
                        <span className="mt-3 block text-[10px] font-extrabold tracking-[0.1em] text-[#D9512B]">
                          SELECTED
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {(format === 'image/jpeg' || format === 'image/webp') && (
                <div className="mt-5 border-t border-[#E9E1D8] pt-5">
                  <div className="flex items-center justify-between gap-3">
                    <label
                      htmlFor="converter-quality"
                      className="text-sm font-bold text-[#242323]"
                    >
                      Output quality
                    </label>
                    <span className="bg-[#FFF0E9] px-2.5 py-1 text-sm font-extrabold text-[#D9512B]">
                      {Math.round(quality * 100)}%
                    </span>
                  </div>

                  <input
                    id="converter-quality"
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={quality}
                    onChange={(event) => setQuality(Number(event.target.value))}
                    className="mt-4 h-2 w-full cursor-pointer accent-[#F36B45]"
                  />

                  <div className="mt-2 flex justify-between text-xs text-[#817970]">
                    <span>Smaller file</span>
                    <span>Higher quality</span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-[#817970]">
                    This setting affects JPEG and WebP exports. PNG uses
                    lossless browser encoding and doesn't use this slider.
                  </p>
                </div>
              )}

              {format === 'image/jpeg' && file && file.type !== 'image/jpeg' && (
                <div className="mt-4 flex items-start gap-2 border-l-2 border-[#F36B45] bg-[#FFF6F1] p-3 text-xs leading-5 text-[#815B4C]">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>
                    JPEG does not support transparency. If your source has
                    transparent areas, they will appear white in the converted
                    image.
                  </p>
                </div>
              )}

              {isSameFormat && (
                <p className="mt-4 text-xs leading-5 text-[#817970]">
                  Your image is already in this format. You can still export
                  it again, but that may not provide any benefit.
                </p>
              )}
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 border border-[#F0D0C6] bg-[#FFF5F2] p-4 text-sm text-[#A34232]"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Conversion needs attention</p>
                  <p className="mt-1 leading-6">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-4">
                <h2 className="font-display text-base font-extrabold text-[#242323]">
                  3. Preview conversion
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#817970]">
                  Compare the source image with your chosen output.
                </p>
              </div>

              {isLoading && (
                <div
                  role="status"
                  className="mb-4 flex items-center gap-2 bg-[#FFF0E9] p-3 text-xs font-semibold text-[#A34A2C]"
                >
                  <LoaderCircle size={15} className="animate-spin" />
                  Converting in your browser…
                </div>
              )}

              <ImagePreview
                originalUrl={originalUrl}
                outputUrl={outputUrl}
                fileName={file?.name ?? ''}
                originalSize={file?.size ?? 0}
                outputSize={outputBlob?.size ?? null}
                width={dimensions.width}
                height={dimensions.height}
                outputLabel="Converted"
              />

              {outputBlob && !isLoading && !error && (
                <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-[#438052]">
                  <CheckCircle2 size={15} className="shrink-0" />
                  Converted to {selectedFormat?.label}. Ready to download.
                </p>
              )}
            </section>

            <DownloadPanel
              blob={outputBlob}
              fileName={file?.name ?? 'image'}
              disabled={isLoading || !!error}
              suffix={format === 'image/jpeg' ? 'converted' : 'converted'}
              downloadLabel={`Download ${selectedFormat?.label ?? 'converted'} image`}
            />

            <p className="text-center text-xs leading-5 text-[#92887E]">
              Images are converted locally in your browser by this workflow.
              Output size and visual quality depend on the source image and
              selected format.
            </p>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}