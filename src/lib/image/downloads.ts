
import { getImageExtension } from './fileValidation';

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'image';

  link.href = url;
  link.download = `${baseName}.${getImageExtension(blob.type)}`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
