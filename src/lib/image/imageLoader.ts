
export interface LoadedImage {
  image: HTMLImageElement;
  width: number;
  height: number;
}

export function loadImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (!image.naturalWidth || !image.naturalHeight) {
        reject(new Error('This image has invalid dimensions.'));
        return;
      }

      resolve({
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('We could not read this image. Try another file.'));
    };

    image.src = objectUrl;
  });
}
