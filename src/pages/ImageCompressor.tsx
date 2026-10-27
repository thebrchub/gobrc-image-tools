
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  LoaderCircle,
  RotateCcw,
  SlidersHorizontal,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

import FileDropzone from '../components/tools/FileDropzone';
import ImagePreview from '../components/tools/ImagePreview';
import QualitySlider from '../components/tools/QualitySlider';
import DownloadPanel from '../components/tools/DownloadPanel';

import { validateImageFile } from '../lib/image/fileValidation';
import { loadImage } from '../lib/image/imageLoader';
import {
  processImage,
  type OutputFormat,
} from '../lib/image/canvasProcessor';

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState<OutputFormat>('image/jpeg');
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (nextFile: File) => {
    const validationError = validateImageFile(nextFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setOutputBlob(null);
    setFile(nextFile);

    // Preserve the input format by default.
    setFormat(nextFile.type as OutputFormat);

    try {
      const loaded = await loadImage(nextFile);

      setDimensions({
        width: loaded.width,
        height: loaded.height,
      });
    } catch {
      setFile(null);
      setError('We could not read this image. Please try another file.');
    }
  };

  // Manage the original image preview URL.
  useEffect(() => {
    if (!file) {
      setOriginalUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setOriginalUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Manage the compressed image preview URL.
  useEffect(() => {
    if (!outputBlob) {
      setOutputUrl(null);
      return;
    }

    const url = URL.createObjectURL(outputBlob);
    setOutputUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [outputBlob]);

  // Re-process when the image, quality or format changes.
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
              : 'Image processing failed. Please try another image.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [file, quality, format]);

  const reset = () => {
    setFile(null);
    setOutputBlob(null);
    setDimensions({ width: 0, height: 0 });
    setQuality(0.8);
    setFormat('image/jpeg');
    setError(null);
    setIsLoading(false);
  };

  return (
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
            IMAGE TOOL 01
          </p>

          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.055em] text-[#242323] sm:text-5xl">
            Image Compressor
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#777067] sm:text-base">
            Reduce image file sizes with a quality setting you control.
            Preview the result, compare file sizes and download when you're ready.
          </p>
        </header>

        <div className="mt-9 grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left: upload and settings */}
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
                    <RotateCcw size={14} />
                    Start over
                  </button>
                )}
              </div>

              <FileDropzone onFile={handleFile} disabled={isLoading} />
            </section>

            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#D9512B]" />
                <h2 className="font-display text-base font-extrabold text-[#242323]">
                  2. Compression settings
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="output-format"
                    className="mb-2 block text-sm font-bold text-[#242323]"
                  >
                    Output format
                  </label>

                  <select
                    id="output-format"
                    value={format}
                    onChange={(event) =>
                      setFormat(event.target.value as OutputFormat)
                    }
                    className="min-h-12 w-full border border-[#E9E1D8] bg-[#FCFAF6] px-3 text-sm text-[#242323] outline-none focus:border-[#F36B45] focus:ring-2 focus:ring-[#F36B45]/15"
                  >
                    <option value="image/jpeg">JPEG (.jpg)</option>
                    <option value="image/png">PNG (.png)</option>
                    <option value="image/webp">WebP (.webp)</option>
                  </select>

                  {format === 'image/jpeg' && file?.type === 'image/png' && (
                    <p className="mt-2 text-xs leading-5 text-[#A45B37]">
                      JPEG does not support transparency. Transparent areas
                      will be filled with white.
                    </p>
                  )}
                </div>

                <QualitySlider
                  quality={quality}
                  onChange={setQuality}
                  disabled={!file || format === 'image/png' || isLoading}
                />

                {format === 'image/png' && (
                  <p className="border-l-2 border-[#F36B45] bg-[#FFF6F1] p-3 text-xs leading-5 text-[#815B4C]">
                    PNG export uses lossless browser encoding. The quality
                    slider doesn't apply, and the resulting file may not
                    be smaller than the original.
                  </p>
                )}
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 border border-[#F0D0C6] bg-[#FFF5F2] p-4 text-sm text-[#A34232]"
              >
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-bold">Something needs attention</p>
                  <p className="mt-1 leading-6">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: preview and download */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-base font-extrabold text-[#242323]">
                    3. Preview your result
                  </h2>
                  <p className="mt-1 text-xs text-[#817970]">
                    Compare the original and processed image.
                  </p>
                </div>

                {isLoading && (
                  <LoaderCircle
                    size={19}
                    className="shrink-0 animate-spin text-[#D9512B]"
                  />
                )}
              </div>

              {isLoading && (
                <div
                  role="status"
                  className="mb-4 flex items-center gap-2 bg-[#FFF0E9] p-3 text-xs font-semibold text-[#A34A2C]"
                >
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
                width={dimensions.width}
                height={dimensions.height}
              />

              {outputBlob && !isLoading && !error && (
                <p className="mt-3 flex items-center gap-2 text-xs leading-5 text-[#438052]">
                  <CheckCircle2 size={15} className="shrink-0" />
                  Your processed image is ready.
                </p>
              )}
            </section>

            <DownloadPanel
              blob={outputBlob}
              fileName={file?.name ?? 'image'}
              disabled={isLoading || !!error}
            />

            <p className="text-center text-xs leading-5 text-[#92887E]">
              Images are processed in your browser by this tool. They are
              not intentionally uploaded to an application server by this
              processing workflow.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
