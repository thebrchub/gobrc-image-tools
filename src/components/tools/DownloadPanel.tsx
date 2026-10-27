import { Download, FileImage } from 'lucide-react';
import { getImageExtension, formatFileSize } from '../../lib/image/fileValidation';

interface DownloadPanelProps {
  blob: Blob | null;
  fileName: string;
  disabled?: boolean;
  suffix?: string;
  downloadLabel?: string;
}

export default function DownloadPanel({
  blob,
  fileName,
  disabled = false,
  suffix = 'compressed',
  downloadLabel = 'Download compressed image',
}: DownloadPanelProps) {
  const handleDownload = () => {
    if (!blob || disabled) return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = fileName.replace(/\.[^.]+$/, '') || 'image';
    const extension = getImageExtension(blob.type);

    link.href = url;
    link.download = `${baseName}-${suffix}.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section className="border border-[#E9E1D8] bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#E6F2E8] text-[#36784B]">
          <FileImage size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-[#242323]">Your download</h3>
          <p className="mt-1 text-xs leading-5 text-[#817970]">
            {blob
              ? `Ready · ${formatFileSize(blob.size)}`
              : 'Choose an image to prepare your download.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        disabled={!blob || disabled}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 bg-[#F36B45] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#D9512B] disabled:cursor-not-allowed disabled:bg-[#D8CEC5] disabled:text-white"
      >
        <Download size={18} />
        {downloadLabel}
      </button>
    </section>
  );
}