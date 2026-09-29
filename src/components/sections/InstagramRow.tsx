import SanityImage from "@/components/ui/SanityImage";
import type { SanityImage as SanityImageType } from "@/lib/sanity.queries";
import type { TextFor } from "@/lib/cta";

export interface InstagramPost {
  image?: SanityImageType;
  permalink?: string;
  alt?: string;
}

/**
 * Curated posts managed in Sanity. No Instagram script, no embed, no cookies:
 * just six images that link out.
 */
export default function InstagramRow({
  posts,
  handle,
  profileUrl,
  text,
}: {
  posts: InstagramPost[];
  handle: string;
  profileUrl: string;
  /** The Studio's heading, and the description for a photo without its own. */
  text: TextFor<"insta">;
}) {
  const shown = posts.filter((post) => post.image?.asset).slice(0, 6);
  if (shown.length === 0) return null;

  return (
    <section className="bg-ivory pb-14 lg:pb-20 px-6" aria-labelledby="instagram-heading">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-baseline justify-between mb-6">
          <h2 id="instagram-heading" className="section-label">
            {text.instaHeading}
          </h2>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-jost text-xs tracking-[0.16em] uppercase text-gold_ink hover:text-charcoal transition-colors duration-300"
          >
            {handle}
          </a>
        </div>
        <ul className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {shown.map((post, i) => (
            <li key={i} className="relative aspect-square overflow-hidden">
              {post.permalink ? (
                <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                  <SanityImage
                    image={post.image}
                    fill
                    alt={post.alt ?? text.instaAlt}
                    placeholderLabel={`INSTAGRAM_${i + 1}`}
                    sizes="(min-width:1024px) 16vw, 33vw"
                  />
                </a>
              ) : (
                <SanityImage
                  image={post.image}
                  fill
                  alt={post.alt ?? text.instaAlt}
                  placeholderLabel={`INSTAGRAM_${i + 1}`}
                  sizes="(min-width:1024px) 16vw, 33vw"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
