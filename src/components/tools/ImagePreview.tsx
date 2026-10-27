
import { Image as ImageIcon, ArrowRight, FileImage } from 'lucide-react';
import { formatFileSize } from '../../lib/image/fileValidation';

interface ImagePreviewProps {
  originalUrl: string | null;
  outputUrl: string | null;
  fileName: string;
  originalSize: number;
  outputSize: number | null;
  width: number;
  height: number;
  outputLabel?: string;
}

export default function ImagePreview({
  originalUrl,
  outputUrl,
  fileName,
  originalSize,
  outputSize,
  width,
  height,
  outputLabel = 'Compressed',
}: ImagePreviewProps) {
  const difference =
    outputSize !== null && originalSize > 0
      ? Math.round(((originalSize - outputSize) / originalSize) * 100)
      : null;

  return (
    <section className="border border-[#E9E1D8] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#F3EEE7] text-[#6F6257]">
          <FileImage size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-[#242323]">
            {fileName || 'Image preview'}
          </h3>
          <p className="mt-1 text-xs text-[#817970]">
            {width > 0 && height > 0 ? `${width} × ${height} px · ` : ''}
            Original: {formatFileSize(originalSize)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="min-w-0 border border-[#E9E1D8] bg-[#F9F7F3] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#6F6A64]">Original</span>
            <span className="text-xs text-[#817970]">
              {formatFileSize(originalSize)}
            </span>
          </div>

          <div className="flex h-48 items-center justify-center overflow-hidden bg-white p-2">
            {originalUrl ? (
              <img
                src={originalUrl}
                alt="Original image"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <ImageIcon size={32} className="text-[#B9AFA5]" />
            )}
          </div>
        </div>

        <div className="min-w-0 border border-[#F0D8CE] bg-[#FFFAF7] p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#D9512B]">
              {outputLabel}
            </span>
            <span className="text-xs text-[#817970]">
              {outputSize !== null ? formatFileSize(outputSize) : '—'}
            </span>
          </div>

          <div className="flex h-48 items-center justify-center overflow-hidden bg-white p-2">
            {outputUrl ? (
              <img
                src={outputUrl}
                alt={`${outputLabel} image preview`}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="px-3 text-center text-xs leading-5 text-[#A39A91]">
                Your output preview will appear here.
              </div>
            )}
          </div>
        </div>
      </div>

      {difference !== null && (
        <div
          className={`mt-4 flex items-center justify-between gap-3 p-3 ${
            difference > 0
              ? 'bg-[#EAF3E3] text-[#36784B]'
              : difference < 0
                ? 'bg-[#FFF0E9] text-[#A34A2C]'
                : 'bg-[#F3EEE7] text-[#6F6257]'
          }`}
        >
          <div className="flex items-center gap-2">
            <ArrowRight size={16} />
            <span className="text-sm font-bold">
              {difference > 0
                ? `${difference}% smaller`
                : difference < 0
                  ? `${Math.abs(difference)}% larger`
                  : 'Same file size'}
            </span>
          </div>

          <span className="text-xs font-semibold">
            {difference > 0
              ? `${formatFileSize(originalSize - outputSize!)} saved`
              : difference < 0
                ? `${formatFileSize(outputSize! - originalSize)} added`
                : 'No size change'}
          </span>
        </div>
      )}
    </section>
  );
}
