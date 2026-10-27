
const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export interface ImageFileInfo {
  file: File;
  width: number;
  height: number;
  size: number;
  type: string;
}

export function validateImageFile(file: File): string | null {
  if (!SUPPORTED_TYPES.includes(file.type)) {
    return 'Please choose a JPG, PNG or WebP image.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'This image is larger than 20 MB. Please choose a smaller file.';
  }

  if (file.size === 0) {
    return 'This file is empty. Please choose another image.';
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function getImageExtension(mimeType: string): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      return 'img';
  }
}
