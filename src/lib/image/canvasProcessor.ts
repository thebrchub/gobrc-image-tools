
import { loadImage } from './imageLoader';

export type OutputFormat =
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'image/svg+xml';

export interface ResizeOptions {
  enabled: boolean;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
}

const MAX_DIMENSION = 12000;

function getOutputDimensions(
  originalWidth: number,
  originalHeight: number,
  resize?: ResizeOptions,
) {
  if (!resize?.enabled) {
    return { width: originalWidth, height: originalHeight };
  }

  const requestedWidth = Math.floor(resize.width);
  const requestedHeight = Math.floor(resize.height);

  if (
    !Number.isFinite(requestedWidth) ||
    !Number.isFinite(requestedHeight) ||
    requestedWidth < 1 ||
    requestedHeight < 1 ||
    requestedWidth > MAX_DIMENSION ||
    requestedHeight > MAX_DIMENSION
  ) {
    throw new Error(
      `Width and height must be between 1 and ${MAX_DIMENSION} pixels.`,
    );
  }

  if (!resize.maintainAspectRatio) {
    return { width: requestedWidth, height: requestedHeight };
  }

  const scale = Math.min(
    requestedWidth / originalWidth,
    requestedHeight / originalHeight,
  );

  return {
    width: Math.max(1, Math.round(originalWidth * scale)),
    height: Math.max(1, Math.round(originalHeight * scale)),
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read the image.'));
      }
    };

    reader.onerror = () => reject(new Error('Could not read the image.'));
    reader.readAsDataURL(file);
  });
}

async function createSvgBlob(
  file: File,
  width: number,
  height: number,
): Promise<Blob> {
  const isSvg =
    file.type.toLowerCase() === 'image/svg+xml' ||
    /\.svg$/i.test(file.name);

  // SVG -> SVG is a pass-through, not a vectorization operation.
  if (isSvg) {
    return new Blob([await file.arrayBuffer()], {
      type: 'image/svg+xml',
    });
  }

  // Raster -> SVG embeds the original image inside an SVG document.
  const dataUrl = await fileToDataUrl(file);

  const svg = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<image width="${width}" height="${height}" preserveAspectRatio="none" href="${dataUrl}" xlink:href="${dataUrl}"/>`,
    '</svg>',
  ].join('');

  return new Blob([svg], { type: 'image/svg+xml' });
}

export async function processImage(
  file: File,
  quality: number,
  format: OutputFormat,
  resize?: ResizeOptions,
): Promise<ProcessedImage> {
  const { image, width: originalWidth, height: originalHeight } =
    await loadImage(file);

  const { width, height } = getOutputDimensions(
    originalWidth,
    originalHeight,
    resize,
  );

  if (format === 'image/svg+xml') {
    const blob = await createSvgBlob(file, width, height);

    return { blob, width, height, format };
  }

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Your browser could not start image processing.');
  }

  canvas.width = width;
  canvas.height = height;

  if (format === 'image/jpeg') {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);

  const normalizedQuality = Math.max(0, Math.min(1, quality));

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
      format === 'image/png' ? undefined : normalizedQuality,
    );
  });

  if (blob.type !== format) {
    throw new Error(
      `Your browser could not export ${format
        .replace('image/', '')
        .toUpperCase()}. Try another output format.`,
    );
  }

  return { blob, width, height, format };
}
