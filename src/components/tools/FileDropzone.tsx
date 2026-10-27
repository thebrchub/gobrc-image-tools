
import { useRef, useState } from 'react';
import { ImagePlus, Upload, FileImage } from 'lucide-react';

interface FileDropzoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function FileDropzone({
  onFile,
  disabled = false,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (files?.length) onFile(files[0]);
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) handleFiles(event.dataTransfer.files);
      }}
      className={`relative flex min-h-[230px] flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-colors sm:min-h-[260px] ${
        dragging
          ? 'border-[#F36B45] bg-[#FFF0E9]'
          : 'border-[#DCCFC3] bg-[#FCFAF6] hover:border-[#F0A18A]'
      } ${disabled ? 'pointer-events-none opacity-60' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.currentTarget.value = '';
        }}
      />

      <div className="flex h-14 w-14 items-center justify-center bg-[#FFF0E9] text-[#D9512B]">
        {dragging ? <ImagePlus size={27} /> : <Upload size={25} />}
      </div>

      <h3 className="mt-5 font-display text-lg font-extrabold text-[#242323]">
        Drop your image here
      </h3>

      <p className="mt-2 text-sm leading-6 text-[#817970]">
        or choose a file from your device
      </p>

      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className="mt-5 inline-flex min-h-11 items-center gap-2 bg-[#F36B45] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#D9512B] disabled:opacity-50"
      >
        <FileImage size={17} />
        Choose image
      </button>

      <p className="mt-4 text-xs text-[#92887E]">
        JPG, PNG or WebP · Maximum 20 MB
      </p>
    </div>
  );
}
