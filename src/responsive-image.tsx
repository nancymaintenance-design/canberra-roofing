import React from 'react';
import manifest from './image-manifest.json';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; priority?: boolean };
/** Original src is retained as fallback; priority is reserved for first-screen media. */
export function ResponsiveImage({ src, alt, priority = false, sizes = '(max-width: 760px) calc(100vw - 3rem), 800px', ...props }: Props) {
  const image = (manifest as Record<string, { width: number; height: number; variants: { src: string; width: number }[] }>)[src];
  const img = <img {...props} src={src} alt={alt} sizes={props.srcSet ? sizes : undefined} width={props.width ?? image?.width} height={props.height ?? image?.height} loading={priority ? 'eager' : props.loading ?? 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding={priority ? undefined : 'async'} />;
  return image ? <picture><source type="image/webp" srcSet={image.variants.map(v => `${v.src} ${v.width}w`).join(', ')} sizes={sizes} />{img}</picture> : img;
}
