
interface QualitySliderProps {
  quality: number;
  onChange: (quality: number) => void;
  disabled?: boolean;
}

export default function QualitySlider({
  quality,
  onChange,
  disabled = false,
}: QualitySliderProps) {
  return (
    <section className={`border border-[#E9E1D8] bg-white p-5 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="image-quality"
          className="text-sm font-bold text-[#242323]"
        >
          Image quality
        </label>
        <span className="bg-[#FFF0E9] px-2.5 py-1 text-sm font-extrabold text-[#D9512B]">
          {Math.round(quality * 100)}%
        </span>
      </div>

      <input
        id="image-quality"
        type="range"
        min="0.1"
        max="1"
        step="0.05"
        value={quality}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-5 h-2 w-full cursor-pointer accent-[#F36B45] disabled:cursor-not-allowed"
      />

      <div className="mt-2 flex justify-between text-xs text-[#817970]">
        <span>Smaller file</span>
        <span>Higher quality</span>
      </div>

      <p className="mt-4 text-xs leading-5 text-[#817970]">
        Lower quality usually creates a smaller JPEG or WebP file.
        PNG exports do not use this quality setting.
      </p>
    </section>
  );
}
