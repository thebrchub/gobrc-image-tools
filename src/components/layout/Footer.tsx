
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const tools = [
  { label: 'Image Compressor', path: '/image-compressor' },
  { label: 'Image Converter', path: '/image-converter' },
  { label: 'Image Resizer & Cropper', path: '/image-resizer' },
  { label: 'Social Image Maker', path: '/social-image-maker' },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[#E9E1D8] bg-white">
      <div className="mx-auto w-full max-w-[1600px] px-6 sm:px-10 lg:px-14 xl:px-16">
        <div className="grid gap-10 py-10 sm:py-12 md:grid-cols-[1.25fr_0.7fr_0.9fr] md:gap-16 lg:gap-20">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="GoBRC Image Tools home"
            >
              

              <span className="text-lg font-extrabold tracking-tight text-[#242323]">
                GoBRC
                <span className="text-[#D9512B]"> Image Tools</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-6 text-[#777067]">
              Simple, practical tools for your everyday image tasks.
              Compress, convert, resize, and create — all in one place.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 border border-[#E9E1D8] bg-[#FCFAF6] px-3 py-2 text-xs font-semibold text-[#6F6A64]">
              <ShieldCheck size={15} className="text-[#D9512B]" />
              Browser-based image processing
            </div>
          </div>

          {/* Tools */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#D9512B]">
              Image tools
            </h2>

            <nav className="mt-4 flex flex-col items-start gap-3">
              {tools.map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  className="text-sm font-medium text-[#6F6A64] transition-colors hover:text-[#D9512B]"
                >
                  {tool.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* About */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#D9512B]">
              Built by BRC HUB
            </h2>

            <p className="mt-4 text-sm leading-6 text-[#777067]">
              A practical collection of image utilities from Blazing Render
              Creation Hub LLP.
            </p>

            <a
              href="https://www.brchub.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 border border-[#E9E1D8] px-4 py-2.5 text-sm font-bold text-[#35302B] transition hover:border-[#F36B45] hover:bg-[#FFF6F1]"
            >
              Explore BRC HUB
              <ArrowUpRight size={15} />
            </a>

            <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-[#92887E]">
              <Sparkles size={14} className="mt-0.5 shrink-0 text-[#D9512B]" />
              <p>Made for creators, makers, and everyday workflows.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#E9E1D8] py-5">
          <div className="flex flex-col gap-3 text-xs leading-5 text-[#92887E] sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} GoBRC Image Tools. All rights reserved.
            </p>

            <p className="flex items-center gap-1.5">
              Crafted with care by Blazing Render Creation Hub LLP.
              <ArrowRight size={13} className="text-[#D9512B]" />
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
