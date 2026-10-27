
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  ImagePlus,
  Info,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

import FileDropzone from '../components/tools/FileDropzone';
import DownloadPanel from '../components/tools/DownloadPanel';
import { validateImageFile, formatFileSize } from '../lib/image/fileValidation';
import { loadImage } from '../lib/image/imageLoader';

type TextPosition = 'top' | 'middle' | 'bottom';
type ImageFit = 'cover' | 'contain';
type OutputFormat = 'image/png' | 'image/jpeg';

const PRESETS = {
  instagram: { label: 'Instagram Post', width: 1080, height: 1080 },
  story: { label: 'Instagram Story', width: 1080, height: 1920 },
  youtube: { label: 'YouTube Thumbnail', width: 1280, height: 720 },
  facebook: { label: 'Facebook Cover', width: 1640, height: 624 },
  linkedin: { label: 'LinkedIn Post', width: 1200, height: 1200 },
  landscape: { label: 'Landscape Post', width: 1200, height: 630 },
} as const;

type PresetKey = keyof typeof PRESETS;

const MAX_HEADLINE_LENGTH = 160;

export default function SocialImageMaker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [presetKey, setPresetKey] = useState<PresetKey>('instagram');
  const [headline, setHeadline] = useState('YOUR HEADLINE HERE');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#242323');
  const [textSize, setTextSize] = useState(64);
  const [textPosition, setTextPosition] = useState<TextPosition>('bottom');
  const [imageFit, setImageFit] = useState<ImageFit>('cover');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('image/png');

  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [sourceDimensions, setSourceDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const preset = PRESETS[presetKey];

  const handleFile = (nextFile: File) => {
    const validationError = validateImageFile(nextFile);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setOutputBlob(null);
    setFile(nextFile);
  };

  const reset = () => {
    setFile(null);
    setOutputBlob(null);
    setSourceDimensions({ width: 0, height: 0 });
    setPresetKey('instagram');
    setHeadline('YOUR HEADLINE HERE');
    setTextColor('#FFFFFF');
    setBackgroundColor('#242323');
    setTextSize(64);
    setTextPosition('bottom');
    setImageFit('cover');
    setOutputFormat('image/png');
    setError(null);
    setIsRendering(false);
  };

  useEffect(() => {
    if (!file) {
      setOutputBlob(null);
      setSourceDimensions({ width: 0, height: 0 });
      setIsRendering(false);
      return;
    }

    let cancelled = false;

    const renderDesign = async () => {
      setIsRendering(true);
      setOutputBlob(null);
      setError(null);

      try {
        const loaded = await loadImage(file);

        if (cancelled) return;

        setSourceDimensions({
          width: loaded.width,
          height: loaded.height,
        });

        const canvas = canvasRef.current;

        if (!canvas) {
          throw new Error('The preview canvas is not available.');
        }

        canvas.width = preset.width;
        canvas.height = preset.height;

        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Your browser could not start image processing.');
        }

        context.clearRect(0, 0, preset.width, preset.height);
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, preset.width, preset.height);

        const scale =
          imageFit === 'cover'
            ? Math.max(
                preset.width / loaded.width,
                preset.height / loaded.height,
              )
            : Math.min(
                preset.width / loaded.width,
                preset.height / loaded.height,
              );

        const drawWidth = loaded.width * scale;
        const drawHeight = loaded.height * scale;

        context.save();
        context.beginPath();
        context.rect(0, 0, preset.width, preset.height);
        context.clip();

        context.drawImage(
          loaded.image,
          (preset.width - drawWidth) / 2,
          (preset.height - drawHeight) / 2,
          drawWidth,
          drawHeight,
        );

        context.restore();

        const text = headline.trim();

        if (text) {
          const fontSize = Math.round((textSize / 1080) * preset.width);

          context.font = `800 ${fontSize}px Manrope, Arial, sans-serif`;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillStyle = textColor;
          context.shadowColor = 'rgba(0, 0, 0, 0.55)';
          context.shadowBlur = fontSize * 0.12;
          context.shadowOffsetX = 0;
          context.shadowOffsetY = fontSize * 0.04;

          const maxWidth = preset.width * 0.84;
          const lines: string[] = [];
          let currentLine = '';

          for (const word of text.split(/\s+/)) {
            const candidate = currentLine
              ? `${currentLine} ${word}`
              : word;

            if (
              currentLine &&
              context.measureText(candidate).width > maxWidth
            ) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              currentLine = candidate;
            }
          }

          if (currentLine) lines.push(currentLine);

          const lineHeight = fontSize * 1.18;
          const totalHeight = lines.length * lineHeight;
          const margin = preset.height * 0.09;

          let startY = margin + totalHeight / 2;

          if (textPosition === 'middle') {
            startY =
              preset.height / 2 - (totalHeight - lineHeight) / 2;
          } else if (textPosition === 'bottom') {
            startY =
              preset.height - margin - totalHeight + lineHeight / 2;
          }

          lines.forEach((line, index) => {
            context.fillText(
              line,
              preset.width / 2,
              startY + index * lineHeight,
              maxWidth,
            );
          });

          context.shadowColor = 'transparent';
          context.shadowBlur = 0;
          context.shadowOffsetY = 0;
        }

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (result) => {
              if (result) {
                resolve(result);
              } else {
                reject(new Error('Could not export your design.'));
              }
            },
            outputFormat,
            outputFormat === 'image/jpeg' ? 0.92 : undefined,
          );
        });

        if (!cancelled) {
          setOutputBlob(blob);
        }
      } catch (renderError) {
        if (!cancelled) {
          setOutputBlob(null);
          setError(
            renderError instanceof Error
              ? renderError.message
              : 'Something went wrong while creating your design.',
          );
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    const timeoutId = window.setTimeout(() => {
      void renderDesign();
    }, 100);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [
    file,
    presetKey,
    preset,
    headline,
    textColor,
    backgroundColor,
    textSize,
    textPosition,
    imageFit,
    outputFormat,
  ]);

  const labelClass =
    'mb-2 block text-sm font-bold text-[#242323]';

  const inputClass =
    'min-h-11 w-full border border-[#E9E1D8] bg-[#FCFAF6] px-3 text-sm text-[#35302B] outline-none focus:border-[#F36B45]';

  const cardClass =
    'border border-[#E9E1D8] bg-white p-4 sm:p-5';

  return (
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
            IMAGE TOOL 04
          </p>

          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.055em] text-[#242323] sm:text-5xl">
            Social Image Maker
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#777067] sm:text-base">
            Create social-ready graphics with platform presets, custom
            backgrounds and headlines. Design and export everything
            directly in your browser.
          </p>
        </header>

        <div className="mt-9 grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          {/* LEFT: SETTINGS */}
          <div className="space-y-5">
            <section className={cardClass}>
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

              <FileDropzone onFile={handleFile} disabled={isRendering} />

              {file && (
                <div className="mt-4 border border-[#E9E1D8] bg-[#FCFAF6] p-3">
                  <p className="truncate text-sm font-bold text-[#35302B]">
                    {file.name}
                  </p>
                  <p className="mt-1 text-xs text-[#817970]">
                    Original: {sourceDimensions.width} ×{' '}
                    {sourceDimensions.height} px · {formatFileSize(file.size)}
                  </p>
                </div>
              )}
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-[#D9512B]" />
                <h2 className="font-display font-extrabold text-[#242323]">
                  2. Choose a canvas
                </h2>
              </div>

              <label htmlFor="social-preset" className={labelClass}>
                Platform preset
              </label>

              <select
                id="social-preset"
                value={presetKey}
                onChange={(event) =>
                  setPresetKey(event.target.value as PresetKey)
                }
                className={inputClass}
              >
                {Object.entries(PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label} — {item.width} × {item.height}
                  </option>
                ))}
              </select>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(Object.entries(PRESETS) as [
                  PresetKey,
                  (typeof PRESETS)[PresetKey],
                ][]).map(([key, item]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={presetKey === key}
                    onClick={() => setPresetKey(key)}
                    className={`border p-3 text-left transition ${
                      presetKey === key
                        ? 'border-[#F36B45] bg-[#FFF6F1]'
                        : 'border-[#E9E1D8] bg-[#FCFAF6] hover:border-[#E9B19D]'
                    }`}
                  >
                    <div className="mb-3 flex h-12 items-center justify-center bg-[#F4E8D9]">
                      <div
                        className="border-2 border-[#D9512B] bg-white"
                        style={{
                          width: `${Math.max(
                            18,
                            32 * Math.min(1, item.width / item.height),
                          )}px`,
                          height: `${Math.max(
                            18,
                            32 * Math.min(1, item.height / item.width),
                          )}px`,
                        }}
                      />
                    </div>
                    <span className="block text-xs font-bold leading-5 text-[#35302B]">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-[10px] text-[#817970]">
                      {item.width} × {item.height}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex items-start gap-2 bg-[#F9F7F3] p-3 text-xs leading-5 text-[#817970]">
                <Info size={15} className="mt-0.5 shrink-0" />
                <p>
                  The selected preset sets the final image dimensions.
                  Your design preview updates automatically.
                </p>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <ImagePlus size={18} className="text-[#D9512B]" />
                <h2 className="font-display font-extrabold text-[#242323]">
                  3. Image settings
                </h2>
              </div>

              <label className={labelClass}>Image fitting</label>

              <div className="grid gap-2">
                {([
                  [
                    'cover',
                    'Fill canvas',
                    'Fill the entire canvas; the edges may be cropped.',
                  ],
                  [
                    'contain',
                    'Fit entire image',
                    'Show the complete image; background space may remain.',
                  ],
                ] as const).map(([value, label, description]) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={imageFit === value}
                    onClick={() => setImageFit(value)}
                    className={`border p-3 text-left ${
                      imageFit === value
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

              <div className="mt-5">
                <label htmlFor="social-background" className={labelClass}>
                  Background color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    id="social-background"
                    type="color"
                    value={backgroundColor}
                    onChange={(event) =>
                      setBackgroundColor(event.target.value)
                    }
                    className="h-11 w-14 cursor-pointer border border-[#E9E1D8] bg-[#FCFAF6] p-1"
                  />
                  <span className="text-sm font-bold uppercase text-[#817970]">
                    {backgroundColor}
                  </span>
                </div>
              </div>
            </section>

            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-2">
                <Sparkles size={18} className="text-[#D9512B]" />
                <h2 className="font-display font-extrabold text-[#242323]">
                  4. Headline settings
                </h2>
              </div>

              <label htmlFor="social-headline" className={labelClass}>
                Headline text
              </label>

              <textarea
                id="social-headline"
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                maxLength={MAX_HEADLINE_LENGTH}
                rows={3}
                placeholder="Enter your headline..."
                className={`${inputClass} resize-y py-3`}
              />

              <p className="mt-1 text-right text-xs text-[#817970]">
                {headline.length}/{MAX_HEADLINE_LENGTH} characters
              </p>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="social-text-size" className={labelClass}>
                    Text size
                  </label>
                  <span className="bg-[#FFF0E9] px-2.5 py-1 text-sm font-extrabold text-[#D9512B]">
                    {textSize}px
                  </span>
                </div>

                <input
                  id="social-text-size"
                  type="range"
                  min="24"
                  max="112"
                  step="2"
                  value={textSize}
                  onChange={(event) =>
                    setTextSize(Number(event.target.value))
                  }
                  className="h-2 w-full accent-[#F36B45]"
                />

                <div className="mt-2 flex justify-between text-xs text-[#817970]">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>

              <div className="mt-5">
                <label className={labelClass}>Text color</label>

                <div className="flex flex-wrap items-center gap-3">
                  {['#FFFFFF', '#242323', '#F36B45', '#FFD166'].map(
                    (color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Set text color to ${color}`}
                        aria-pressed={textColor === color}
                        onClick={() => setTextColor(color)}
                        className={`h-8 w-8 border border-black/10 ${
                          textColor === color
                            ? 'ring-2 ring-[#F36B45] ring-offset-2'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ),
                  )}

                  <input
                    type="color"
                    value={textColor}
                    onChange={(event) => setTextColor(event.target.value)}
                    aria-label="Custom text color"
                    className="h-9 w-10 cursor-pointer border border-[#E9E1D8] bg-[#FCFAF6] p-1"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className={labelClass}>Text position</label>

                <div className="grid grid-cols-3 gap-2">
                  {(['top', 'middle', 'bottom'] as const).map((position) => (
                    <button
                      key={position}
                      type="button"
                      aria-pressed={textPosition === position}
                      onClick={() => setTextPosition(position)}
                      className={`border px-3 py-2.5 text-sm font-bold capitalize ${
                        textPosition === position
                          ? 'border-[#F36B45] bg-[#FFF6F1] text-[#D9512B]'
                          : 'border-[#E9E1D8] bg-[#FCFAF6] text-[#6F6A64] hover:border-[#E9B19D]'
                      }`}
                    >
                      {position}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="border border-[#F0D0C6] bg-[#FFF5F2] p-4 text-sm text-[#A34232]"
              >
                <p className="font-bold">Image processing needs attention</p>
                <p className="mt-1 leading-6">{error}</p>
              </div>
            )}
          </div>

          {/* RIGHT: STICKY PREVIEW AND DOWNLOAD */}
          <div className="space-y-5 lg:sticky lg:top-24">
            <section className={cardClass}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-extrabold text-[#242323]">
                    Preview your design
                  </h2>
                  <p className="mt-1 text-xs text-[#817970]">
                    {preset.width} × {preset.height} px
                  </p>
                </div>

                {isRendering && (
                  <span className="text-xs font-bold text-[#D9512B]">
                    Updating…
                  </span>
                )}
              </div>

              <div className="flex min-h-[300px] items-center justify-center overflow-hidden border border-[#E9E1D8] bg-[#F3F0EB] p-3 sm:min-h-[400px] sm:p-5">
                {file ? (
                  <canvas
                    ref={canvasRef}
                    aria-label="Live preview of the social image"
                    className="block h-auto max-h-[540px] max-w-full"
                  />
                ) : (
                  <div className="max-w-xs py-10 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-[#E9E1D8] bg-white text-[#D9512B]">
                      <ImagePlus size={22} />
                    </div>
                    <p className="text-sm font-bold text-[#35302B]">
                      Your preview will appear here
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#817970]">
                      Upload an image to begin creating your social graphic.
                    </p>
                  </div>
                )}
              </div>

              {file && (
                <div className="mt-4 flex items-start justify-between gap-3 border-t border-[#E9E1D8] pt-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#35302B]">
                      {file.name}
                    </p>
                    <p className="mt-1 text-xs text-[#817970]">
                      Original: {formatFileSize(file.size)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-[#817970]">
                    {outputFormat === 'image/png' ? 'PNG' : 'JPEG'}
                  </span>
                </div>
              )}

              {outputBlob && !isRendering && !error && (
                <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[#438052]">
                  <CheckCircle2 size={15} className="shrink-0" />
                  Your social image is ready to download.
                </p>
              )}
            </section>

            <section className={cardClass}>
              <h2 className="font-display font-extrabold text-[#242323]">
                5. Export your design
              </h2>

              
<div className="mt-4">
  <p className="mb-2 text-sm font-bold text-[#242323]">
    Output format
  </p>

  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      aria-pressed={outputFormat === 'image/png'}
      onClick={() => setOutputFormat('image/png')}
      className={`border p-3 text-left transition ${
        outputFormat === 'image/png'
          ? 'border-[#F36B45] bg-[#FFF6F1]'
          : 'border-[#E9E1D8] bg-[#FCFAF6] hover:border-[#E9B19D]'
      }`}
    >
      <span className="block text-sm font-bold text-[#35302B]">
        PNG
      </span>
      <span className="mt-1 block text-xs leading-5 text-[#817970]">
        Best for graphics
      </span>
      {outputFormat === 'image/png' && (
        <span className="mt-2 block text-xs font-bold text-[#D9512B]">
          Selected
        </span>
      )}
    </button>

    <button
      type="button"
      aria-pressed={outputFormat === 'image/jpeg'}
      onClick={() => setOutputFormat('image/jpeg')}
      className={`border p-3 text-left transition ${
        outputFormat === 'image/jpeg'
          ? 'border-[#F36B45] bg-[#FFF6F1]'
          : 'border-[#E9E1D8] bg-[#FCFAF6] hover:border-[#E9B19D]'
      }`}
    >
      <span className="block text-sm font-bold text-[#35302B]">
        JPEG
      </span>
      <span className="mt-1 block text-xs leading-5 text-[#817970]">
        Smaller file size
      </span>
      {outputFormat === 'image/jpeg' && (
        <span className="mt-2 block text-xs font-bold text-[#D9512B]">
          Selected
        </span>
      )}
    </button>
  </div>
</div>


              {outputFormat === 'image/jpeg' && (
                <p className="mt-3 bg-[#FFF6F1] p-3 text-xs leading-5 text-[#815B4C]">
                  JPEG does not support transparency. Empty canvas areas
                  will use your selected background color.
                </p>
              )}

              <div className="mt-5">
                <DownloadPanel
                  blob={outputBlob}
                  fileName={file?.name ?? 'social-image'}
                  disabled={!file || !outputBlob || isRendering || !!error}
                  suffix="social"
                  downloadLabel="Download social image"
                />
              </div>
            </section>

            <div className="flex items-start gap-2 text-xs leading-5 text-[#92887E]">
              <Download size={14} className="mt-0.5 shrink-0" />
              <p>
                Images are processed locally in your browser. Nothing is
                uploaded to a server.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
