import { getText } from "@/lib/text";
import { pickText } from "@/lib/cta";
import BeforeAfterSliderView, { type SliderProps, type SliderText } from "./BeforeAfterSliderView";

/**
 * The before and after slider for server pages (case studies, care cards).
 * It reads its words from the Studio when the page doesn't hand them over,
 * so the slider's labels never need a copy of the original wording in the
 * browser code. Client components use BeforeAfterSliderView directly.
 */
export default async function BeforeAfterSlider({
  text,
  ...props
}: Omit<SliderProps, "text"> & { text?: SliderText }) {
  return <BeforeAfterSliderView {...props} text={text ?? pickText(await getText("site"), "slider")} />;
}
