
import { loadImage } from './imageLoader';

export type OutputFormat =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/svg+xml';

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
}

function isSvgFile(file: File): boolean {
  return (
    file.type.toLowerCase() === 'image/svg+xml' ||
    /\.svg$/i.test(file.name)
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the image file.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Could not read the image file.'));
    };

    reader.readAsDataURL(file);
  });
}

async function createSvgBlob(
  file: File,
  width: number,
  height: number,
): Promise<Blob> {
  // SVG → SVG: preserve the original SVG instead of pretending
  // that a conversion or vectorization has taken place.
  if (isSvgFile(file)) {
    return new Blob([file], { type: 'image/svg+xml' });
  }

  // Raster → SVG: embed the original image inside an SVG container.
  const dataUrl = await readAsDataUrl(file);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${width}"
     height="${height}"
     viewBox="0 0 ${width} ${height}">
  <image
    width="${width}"
    height="${height}"
    href="${dataUrl}"
    xlink:href="${dataUrl}"
    preserveAspectRatio="none"
  />
</svg>`;

  return new Blob([svg], {
    type: 'image/svg+xml',
  });
}

export async function processImage(
  file: File,
  quality: number,
  format: OutputFormat,
): Promise<ProcessedImage> {
  const { image, width, height } = await loadImage(file);

  if (format === 'image/svg+xml') {
    const blob = await createSvgBlob(file, width, height);

    return {
      blob,
      width,
      height,
      format,
    };
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Your browser could not start image processing.');
  }

  canvas.width = width;
  canvas.height = height;

  // JPEG does not support transparency, so use a white background.
  if (format === 'image/jpeg') {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error('Could not create the converted image.'));
        }
      },
      format,
      format === 'image/png' ? undefined : quality,
    );
  });

  if (blob.type !== format) {
    throw new Error(
      `Your browser could not export ${format
        .replace('image/', '')
        .toUpperCase()}. Try another output format.`,
    );
  }

  return {
    blob,
    width,
    height,
    format,
  };
}
