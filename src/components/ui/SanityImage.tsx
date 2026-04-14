import Image from "next/image";
import { urlFor } from "@/lib/sanity.image";
import ImagePlaceholder from "./ImagePlaceholder";
import type { SanityImage as SanityImageType } from "@/lib/sanity.queries";

interface SanityImageProps {
  image?: SanityImageType | null;
  placeholderLabel: string;
  placeholderRatio?: "portrait" | "landscape" | "square" | "tall";
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

export default function SanityImage({
  image,
  placeholderLabel,
  placeholderRatio = "landscape",
  alt,
  className = "",
  fill = false,
  width,
  height,
  priority = false,
  sizes,
}: SanityImageProps) {
  // Show real image if Sanity asset exists
  if (image?.asset) {
    let src: string;
    try { src = urlFor(image).auto("format").quality(85).url(); }
    catch { return <ImagePlaceholder label={placeholderLabel} aspectRatio={placeholderRatio} className={className} />; }
    const resolvedAlt = alt ?? image.alt ?? placeholderLabel;

    if (fill) {
      return (
        <Image
          src={src}
          alt={resolvedAlt}
          fill
          className={`object-cover ${className}`}
          priority={priority}
          sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
        />
      );
    }

    return (
      <Image
        src={src}
        alt={resolvedAlt}
        width={width ?? 800}
        height={height ?? 600}
        className={`object-cover w-full h-full ${className}`}
        priority={priority}
        sizes={sizes ?? "(max-width: 768px) 100vw, 50vw"}
      />
    );
  }

  // No image yet — show the labeled placeholder
  return (
    <ImagePlaceholder
      label={placeholderLabel}
      aspectRatio={placeholderRatio}
      className={className}
    />
  );
}
