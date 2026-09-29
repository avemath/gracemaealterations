import type { MetadataRoute } from "next";

/** Lets "Add to Home Screen" use the proper name, colors and icon. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grace Mae Alterations",
    short_name: "Grace Mae",
    description: "Bridal and clothing alterations in Pittsburgh, PA, by appointment.",
    start_url: "/",
    display: "browser",
    background_color: "#FAF7F2",
    theme_color: "#242020",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
