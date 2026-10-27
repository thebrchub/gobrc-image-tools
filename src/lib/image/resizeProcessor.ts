import { loadImage } from './imageLoader';
import type { OutputFormat } from './canvasProcessor';

export type ResizeMode = 'fit' | 'stretch' | 'cover';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ResizeOptions {
  width: number;
  height: number;
  mode: ResizeMode;
  format: OutputFormat;
  quality: number;
  crop?: CropArea;
  backgroundColor?: string;
}

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
}

export async function resizeImage(
  file: File,
  options: ResizeOptions,
): Promise<ResizedImage> {
  const {
    width,
    height,
    mode,
    format,
    quality,
    crop,
    backgroundColor = '#FFFFFF',
  } = options;

  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 12000 ||
    height > 12000
  ) {
    throw new Error('Width and height must be between 1 and 12,000 pixels.');
  }

  const { image } = await loadImage(file);

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Your browser could not start image processing.');
  }

  canvas.width = width;
  canvas.height = height;

  // JPEG cannot preserve transparency.
  if (format === 'image/jpeg') {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);
  }

  if (crop) {
    const sx = Math.max(0, Math.min(image.naturalWidth - 1, crop.x));
    const sy = Math.max(0, Math.min(image.naturalHeight - 1, crop.y));
    const sw = Math.max(
      1,
      Math.min(crop.width, image.naturalWidth - sx),
    );
    const sh = Math.max(
      1,
      Math.min(crop.height, image.naturalHeight - sy),
    );

    // The selected crop fills the output dimensions.
    context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
  } else if (mode === 'stretch') {
    context.drawImage(image, 0, 0, width, height);
  } else {
    const scale =
      mode === 'cover'
        ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
        : Math.min(width / image.naturalWidth, height / image.naturalHeight);

    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const dx = (width - drawWidth) / 2;
    const dy = (height - drawHeight) / 2;

    if (mode === 'cover') {
      context.save();
      context.beginPath();
      context.rect(0, 0, width, height);
      context.clip();
    }

    context.drawImage(image, dx, dy, drawWidth, drawHeight);

    if (mode === 'cover') context.restore();
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result);
        else reject(new Error('Could not export this resized image.'));
      },
      format,
      format === 'image/png' ? undefined : quality,
    );
  });

  if (blob.type !== format) {
    throw new Error(
      `Your browser could not export ${format.replace('image/', '').toUpperCase()}. Please choose another format.`,
    );
  }

  return { blob, width, height, format };
}