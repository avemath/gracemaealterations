import type { Metadata } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getCareCard } from "@/lib/sanity.queries";
import { SITE_URL } from "@/lib/metadata";
import { getText, fill } from "@/lib/text";
import PrintButton from "./PrintButton";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const text = await getText("forms");
  return {
    title: text.careCardPrintTabTitle,
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

/**
 * The printable card: business-card size (3.5 × 2 in), one side, with the QR
 * code for this garment's care page. Printing hides everything else on the
 * page, and a dashed line marks where to trim.
 */
export default async function CareCardPrint({ params }: { params: { code: string } }) {
  const [card, text] = await Promise.all([getCareCard(params.code), getText("forms")]);
  if (!card) notFound();
  const garment = { garment: card.garment };

  const url = `${SITE_URL}/care/${card.code}`;
  const qr = await QRCode.toString(url, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#1C1C1C", light: "#00000000" },
  });

  return (
    <div className="bg-ivory px-6 pt-32 pb-20 lg:pt-40">
      <style>{`
        @media print {
          @page { size: letter; margin: 0.5in; }
          body * { visibility: hidden !important; }
          .care-card, .care-card * { visibility: visible !important; }
          .care-card { position: absolute; left: 0; top: 0; box-shadow: none !important; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto">
        <h1 className="font-cormorant italic text-charcoal text-3xl mb-2">{fill(text.careCardPrintHeading, garment)}</h1>
        <p className="font-jost text-charcoal/75 text-sm leading-[1.65] mb-8 max-w-[55ch]">{text.careCardPrintNote}</p>

        <div
          className="care-card bg-white shadow-[0_8px_30px_rgba(28,28,28,0.12)] outline outline-1 outline-dashed outline-charcoal/30 outline-offset-[6px]"
          style={{ width: "3.5in", height: "2in" }}
        >
          <div className="h-full grid grid-cols-[1fr_1.15in] gap-[0.18in] p-[0.2in] items-center">
            <div className="h-full flex flex-col justify-between">
              <div>
                <p className="font-cormorant italic text-charcoal leading-none" style={{ fontSize: "18pt" }}>
                  Grace Mae
                </p>
                <p className="font-jost uppercase text-charcoal/75 mt-[3pt]" style={{ fontSize: "5.5pt", letterSpacing: "0.2em" }}>
                  {text.careCardSubtitle}
                </p>
              </div>
              <div className="h-px bg-[#C9A84C] w-[0.4in]" aria-hidden="true" />
              <div>
                <p className="font-cormorant italic text-charcoal leading-tight" style={{ fontSize: "10.5pt" }}>
                  {fill(text.careCardHeading, garment)}
                </p>
                <p className="font-jost text-charcoal/75 leading-snug mt-[3pt]" style={{ fontSize: "6.5pt" }}>
                  {text.careCardScan}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-[1.15in] h-[1.15in] [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: qr }} />
              <p className="font-jost text-charcoal/75 mt-[4pt] text-center" style={{ fontSize: "5pt" }}>
                gracemaealterations.com
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4 print:hidden">
          <PrintButton label={text.careCardPrintButton} />
          <a href={`/care/${card.code}`} className="font-jost text-xs text-gold_ink tracking-[0.18em] uppercase py-2">
            {text.careCardPrintOpen}
          </a>
        </div>
      </div>
    </div>
  );
}
