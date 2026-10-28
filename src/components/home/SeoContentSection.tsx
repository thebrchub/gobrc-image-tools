
import { ShieldCheck } from 'lucide-react';

const faqs = [
  {
    question: 'How can I compress an image online?',
    answer:
      'Open the Image Compressor, select your image and adjust the available quality settings. Preview the result and download the compressed image when you are satisfied with the balance between file size and quality.',
  },
  {
    question: 'Can I convert JPG, PNG and WebP images?',
    answer:
      'Yes. The Image Converter lets you choose between JPEG, PNG and WebP output formats. Upload a supported image, select the format you need and download the converted file.',
  },
  {
    question: 'How can I resize an image to exact dimensions?',
    answer:
      'Use the Image Resizer & Cropper to enter your desired width and height. You can adjust how the image fits the new dimensions and preview the result before downloading.',
  },
  {
    question: 'How do I create images for Instagram or YouTube?',
    answer:
      'Use the Social Image Maker to select a preset for supported formats such as Instagram posts, Instagram Stories or YouTube thumbnails. You can also customize backgrounds and text.',
  },
  {
    question: 'Do I need to install an image editing app?',
    answer:
      'No installation is required. GoBRC Image Tools runs in your web browser, so you can use the available image utilities directly from your device.',
  },
];

export default function SeoContentSection() {
  return (
    <section
  aria-labelledby="image-tools-guide-title"
  className="border-t border-[#E9E1D8] bg-[#FCFAF6] px-5 py-12 sm:px-8 sm:py-14"
>
      <div className="w-full">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)] lg:gap-14 xl:gap-20">
          {/* Intro and browser-processing note */}
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#D9512B]">
              THE GO-BRC GUIDE
            </p>

            <h2
              id="image-tools-guide-title"
              className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-[-0.045em] text-[#242323] sm:text-4xl"
            >
              A simpler way to work with images
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#817970]">
              Images are used everywhere, from websites and online stores to
              social media and presentations. GoBRC Image Tools brings everyday
              image tasks into one convenient browser-based workspace.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#817970]">
              Whether you need to reduce a file size, change an image format,
              adjust dimensions or prepare a graphic for sharing, choose the
              tool that fits your task and get started.
            </p>

            <div className="mt-6 flex items-start gap-3 border border-[#E9E1D8] bg-white p-4">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-[#36784B]"
              />
              <div>
                <p className="text-sm font-bold text-[#242323]">
                  Designed for browser-based use
                </p>
                <p className="mt-1 text-xs leading-6 text-[#817970]">
                  Supported tools process images locally in your browser,
                  helping keep files on your device during processing.
                </p>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.16em] text-[#D9512B]">
              GOT QUESTIONS?
            </p>

            <h3 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-[#242323]">
              Frequently Asked Questions
            </h3>

            <div className="mt-5 divide-y divide-[#E9E1D8] border-y border-[#E9E1D8]">
              {faqs.map((faq) => (
                <details key={faq.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold leading-6 text-[#35302B] marker:hidden">
                    <span>{faq.question}</span>
                    <span className="shrink-0 text-lg font-normal text-[#D9512B] transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-3 pr-6 text-sm leading-7 text-[#817970]">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
