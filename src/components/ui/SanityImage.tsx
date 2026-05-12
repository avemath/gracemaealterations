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
  if (fill) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "linear-gradient(135deg, #F5EFE6 0%, #EDE5D8 100%)", border: "1px solid #C9A84C" }} role="img" aria-label={`Image placeholder: ${placeholderLabel}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>
        <p className="font-cormorant text-gold tracking-widest uppercase text-center px-4" style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}>{placeholderLabel}</p>
        <p className="text-charcoal/40 font-jost" style={{ fontSize: "0.6rem" }}>Replace with your photo</p>
      </div>
    );
  }

  return (
    <ImagePlaceholder
      label={placeholderLabel}
      aspectRatio={placeholderRatio}
      className={className}
    />
  );
}
