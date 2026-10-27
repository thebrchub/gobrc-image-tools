
import { loadImage } from './imageLoader';

export type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ProcessedImage {
  blob: Blob;
  width: number;
  height: number;
  format: OutputFormat;
}

export async function processImage(
  file: File,
  quality: number,
  format: OutputFormat,
): Promise<ProcessedImage> {
  const { image, width, height } = await loadImage(file);
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
        if (result) resolve(result);
        else reject(new Error('Could not create the compressed image.'));
      },
      format,
      format === 'image/png' ? undefined : quality,
    );
  });

  // Some browsers may fall back to PNG if a requested format is unsupported.
  if (blob.type !== format) {
    throw new Error(
      `Your browser could not export ${format.replace('image/', '').toUpperCase()}. Try another output format.`,
    );
  }

  return { blob, width, height, format };
}
