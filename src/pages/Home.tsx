
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  Minimize2,
  FileImage,
  Crop,
  LayoutTemplate,
  ShieldCheck,
  Zap,
  Image as ImageIcon,
  Sparkles,
  CircleCheck,
} from 'lucide-react';

const tools = [
  {
    title: 'Image Compressor',
    description: 'Make images lighter without sacrificing more quality than necessary.',
    eyebrow: 'MAKE IT SMALLER',
    to: '/image-compressor',
    icon: Minimize2,
    tone: 'peach',
  },
  {
    title: 'Image Converter',
    description: 'Switch between JPEG, PNG and WebP for the format you need.',
    eyebrow: 'CHANGE FORMAT',
    to: '/image-converter',
    icon: FileImage,
    tone: 'lavender',
  },
  {
    title: 'Resize & Crop',
    description: 'Get the dimensions and framing right for every destination.',
    eyebrow: 'GET THE RIGHT FIT',
    to: '/image-resizer',
    icon: Crop,
    tone: 'yellow',
  },
  {
    title: 'Social Image Maker',
    description: 'Prepare images for posts, stories, profiles and thumbnails.',
    eyebrow: 'READY TO SHARE',
    to: '/social-image-maker',
    icon: LayoutTemplate,
    tone: 'mint',
  },
] as const;

const toneClasses = {
  peach: 'bg-[#FFF0E9] text-[#D9512B]',
  lavender: 'bg-[#F0ECFA] text-[#7258A8]',
  yellow: 'bg-[#FFF3D8] text-[#9B6B15]',
  mint: 'bg-[#E6F2E8] text-[#36784B]',
};

function ImageArtwork() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-[440px] overflow-hidden rounded-2xl bg-[#E9B99D]">
      <div className="absolute inset-0 bg-[linear-gradient(140deg,#E9B99D_0%,#F5D8BD_48%,#C5CDB2_100%)]" />

      <div className="absolute -right-8 top-5 h-48 w-48 rounded-full bg-[#F4E5D0]/80" />
      <div className="absolute -left-8 bottom-[-54px] h-52 w-52 rounded-full bg-[#DA7E5D]" />

      <div className="absolute left-[14%] top-[13%] h-[72%] w-[63%] rotate-[-5deg] rounded-[48%_48%_12%_12%] bg-[#C56F4C] shadow-xl">
        <div className="absolute inset-x-[17%] top-[10%] h-[78%] rounded-[48%_48%_10%_10%] bg-[#F2C8A5]" />
        <div className="absolute left-[28%] top-[29%] h-2 w-2 rounded-full bg-[#49372E]" />
        <div className="absolute right-[28%] top-[29%] h-2 w-2 rounded-full bg-[#49372E]" />
        <div className="absolute left-[40%] top-[43%] h-3 w-5 rounded-b-full border-b-2 border-[#A45B4A]" />
      </div>

      <div className="absolute bottom-[12%] right-[9%] h-20 w-20 rotate-[10deg] rounded-2xl border border-white/70 bg-white/80 p-2 shadow-xl backdrop-blur">
        <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#F9F4EC]">
          <ImageIcon size={34} className="text-[#E65E38]" />
        </div>
      </div>

      <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.12em] text-[#51443A]">
        CREATIVE WORKSPACE
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="overflow-hidden border-b border-[#E9E1D8] bg-[#F5E8D8]">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 border border-[#E7D3C0] bg-[#FAF3EA] px-3 py-2 text-[11px] font-extrabold tracking-[0.12em] text-[#8A4B35]">
              <Sparkles size={14} />
              YOUR EVERYDAY IMAGE WORKSPACE
            </div>

            <h1 className="mt-7 max-w-2xl font-display text-5xl font-extrabold leading-[1.02] tracking-[-0.065em] text-[#242323] sm:text-6xl lg:text-[76px]">
              Make every
              <br />
              image work
              <br />
              <span className="text-[#E65E38]">harder.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#625950] sm:text-lg sm:leading-8">
              Compress, convert, resize and create. Get your images
              ready for websites, social media and everything in between.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/image-compressor"
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#F36B45] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#D9512B]"
              >
                Start with an image
                <ArrowRight size={17} />
              </Link>

              <a
                href="#tools"
                className="inline-flex min-h-12 items-center justify-center border border-[#D8C7B6] bg-[#FAF3EA] px-5 py-3 text-sm font-bold text-[#35302B] transition-colors hover:bg-white"
              >
                Explore the tools
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-[#6F6257]">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-[#D9512B]" />
                Browser-first processing
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap size={16} className="text-[#D9512B]" />
                No-fuss workflow
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#E6A17F]/35 blur-3xl" />

            <div className="relative border border-white/80 bg-[#FCFAF6] p-4 shadow-[12px_16px_0_rgba(69,49,35,0.07)] sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="font-display text-base font-extrabold tracking-tight text-[#242323]">
                    The creative desk
                  </p>
                  <p className="mt-1 text-xs text-[#817970]">
                    A tool for every image task
                  </p>
                </div>
                <span className="border border-[#E9E1D8] bg-white px-3 py-1.5 text-xs font-bold text-[#514D48]">
                  4 tools
                </span>
              </div>

              <ImageArtwork />

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {tools.map(({ title, icon: Icon, tone, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex min-w-0 items-center gap-2.5 border border-[#E9E1D8] bg-white p-3 transition-colors hover:border-[#F0A18A] hover:bg-[#FFFAF7]"
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center ${toneClasses[tone]}`}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0 text-xs font-bold leading-4 text-[#35302B]">
                      {title}
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-[#E9E1D8] pt-4">
                <CircleCheck size={17} className="shrink-0 text-[#438052]" />
                <p className="text-xs leading-5 text-[#6F6A64]">
                  Process images locally wherever supported.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section id="tools" className="scroll-mt-24 bg-[#F9F7F3] px-5 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#D9512B]">
                THE TOOLKIT
              </p>
              <h2 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-[-0.05em] text-[#242323] sm:text-4xl lg:text-5xl">
                Less fiddling.
                <br className="hidden sm:block" /> More getting things done.
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-[#777067] sm:text-base">
              Useful image tools without the clutter. Pick what you need
              and get straight to work.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {tools.map(({ title, description, eyebrow, to, icon: Icon, tone }, index) => (
              <Link
                key={to}
                to={to}
                className="group flex min-h-[275px] flex-col border border-[#E7E0D8] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#F0A18A] hover:shadow-[8px_10px_0_rgba(69,49,35,0.045)] sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`flex h-12 w-12 items-center justify-center ${toneClasses[tone]}`}
                  >
                    <Icon size={23} strokeWidth={1.9} />
                  </span>
                  <span className="text-xs font-bold text-[#A29A91]">
                    0{index + 1}
                  </span>
                </div>

                <p className="mt-7 text-[10px] font-extrabold tracking-[0.14em] text-[#A07864]">
                  {eyebrow}
                </p>

                <h3 className="mt-2 font-display text-xl font-extrabold tracking-[-0.04em] text-[#242323]">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-[#777067]">
                  {description}
                </p>

                <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-bold text-[#D9512B]">
                  Open tool
                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-4 border border-[#E7D3C0] bg-[#F5E8D8] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#F36B45] text-white">
                <Sparkles size={19} />
              </span>
              <div>
                <p className="font-display font-extrabold text-[#242323]">
                  More creative tools are on the way.
                </p>
                <p className="mt-1 text-sm leading-6 text-[#777067]">
                  Background removal is on our roadmap for a future release.
                </p>
              </div>
            </div>

            <span className="w-fit border border-[#D8C7B6] bg-[#FAF3EA] px-3 py-2 text-xs font-bold text-[#8A4B35]">
              COMING LATER
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
