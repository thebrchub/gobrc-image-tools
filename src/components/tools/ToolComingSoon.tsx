  
import { Link } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Construction } from 'lucide-react';

interface ToolComingSoonProps {
  title: string;
  description: string;
}

export default function ToolComingSoon({
  title,
  description,
}: ToolComingSoonProps) {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#176B45] hover:underline"
      >
        <ArrowLeft size={16} />
        All image tools
      </Link>

      <section className="mt-8 rounded-[28px] border border-[#E2E7DE] bg-white p-6 shadow-[0_12px_35px_rgba(38,56,36,0.05)] sm:p-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3E3] text-[#176B45]">
          <ImagePlus size={26} />
        </div>

        <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.15em] text-[#64806A]">
          GoBRC Image Tools
        </p>

        <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-[#202820] sm:text-4xl">
          {title}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-[#687268] sm:text-base">
          {description}
        </p>

        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#E2E7DE] bg-[#F7F8F4] p-4">
          <Construction size={20} className="mt-0.5 shrink-0 text-[#64806A]" />
          <div>
            <p className="text-sm font-bold text-[#354237]">
              We're building this tool
            </p>
            <p className="mt-1 text-xs leading-5 text-[#687268]">
              This page is a placeholder. Image processing will be added next.
            </p>
          </div>
        </div>

        <Link
          to="/"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#176B45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#125B3A]"
        >
          Explore all tools
        </Link>
      </section>
    </main>
  );
}
 