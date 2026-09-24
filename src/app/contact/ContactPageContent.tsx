"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SanityImage from "@/components/ui/SanityImage";
import Accordion from "@/components/ui/Accordion";
import type { SanityFaqItem, SanityImage as SanityImageType } from "@/lib/sanity.queries";

// ── Constants ──────────────────────────────────────────────────

const BRIDAL_ALTERATIONS = [
  { value: "hem", label: "Hem (standard, cathedral, horsehair)" },
  { value: "bustle", label: "Bustle addition" },
  { value: "bodice_waist", label: "Bodice / Waist adjustment" },
  { value: "corset_conversion", label: "Corset back conversion" },
  { value: "straps_sleeves", label: "Straps / Sleeves" },
  { value: "neckline", label: "Neckline modification" },
  { value: "cups_boning", label: "Cups / Boning" },
  { value: "lace_beading", label: "Lace / Beading work" },
  { value: "other", label: "Other (describe in notes)" },
];

const TAILORING_ALTERATIONS = [
  { value: "hem", label: "Hem" },
  { value: "take_in", label: "Take in" },
  { value: "let_out", label: "Let out" },
  { value: "sleeve", label: "Sleeve length / taper" },
  { value: "waist", label: "Waist / Seat adjustment" },
  { value: "zipper", label: "Zipper repair / replacement" },
  { value: "other", label: "Other" },
];

const INITIAL_FORM = {
  name: "", email: "", phone: "", serviceType: "", eventDate: "",
  garmentDetails: "", referralSource: "",
  fabricNotes: "", dressSizeOrdered: "", currentStreetSize: "",
  shoesUndergarments: "", garmentType: "", currentSize: "",
};

type FormData = typeof INITIAL_FORM;
type FormErrors = Partial<Record<keyof FormData | "files", string>>;
type AttachmentState = { filename: string; content: string; preview: string };

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Full name is required.";
  if (!data.email.trim()) errors.email = "Email address is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Please enter a valid email address.";
  return errors;
}

// ── Sub-components ─────────────────────────────────────────────

const CheckboxItem = ({
  label, value, checked, onChange,
}: {
  label: string; value: string; checked: boolean; onChange: () => void;
}) => (
  <label className="flex items-start gap-2.5 cursor-pointer group select-none">
    <div
      className={`mt-0.5 w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors duration-200 ${
        checked ? "bg-gold border-gold" : "border-blush group-hover:border-gold/50"
      }`}
      aria-hidden="true"
    >
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="#FAF7F2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} value={value} />
    <span className="font-jost text-sm text-charcoal/65 leading-tight">{label}</span>
  </label>
);

// ── Icons ──────────────────────────────────────────────────────

const InstagramIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const MailIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const PinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.49 2 2 0 0 1 3.6 2.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.06 6.06l.95-.86a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// ── Props ──────────────────────────────────────────────────────

interface ContactText {
  heroLabel: string;
  heroHeading: string;
  waitlistBannerBold: string;
  waitlistBannerText: string;
  successHeading: string;
  successMessage: string;
  waitlistSuccessMessage: string;
}

interface Props {
  site: {
    email: string; instagram: string; instagramUrl: string;
    location: string; availability: string; responseTime: string;
    phone?: string; isAcceptingClients: boolean;
  };
  faq: SanityFaqItem[];
  contactImage: SanityImageType | null;
  text: ContactText;
}

// ── Main component ─────────────────────────────────────────────

export default function ContactPageContent({ site, faq, contactImage, text }: Props) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [charCount, setCharCount] = useState(0);
  const [attachments, setAttachments] = useState<AttachmentState[]>([]);
  const [bridalAlterations, setBridalAlterations] = useState<string[]>([]);
  const [tailoringAlterations, setTailoringAlterations] = useState<string[]>([]);

  const isWaitlist = !site.isAcceptingClients;
  const svc = formData.serviceType;

  const maxPhotos = svc === "bridal" ? 6 : svc === "tailoring" ? 3 : svc === "custom" ? 4 : 2;
  const photoHint =
    svc === "bridal"
      ? "Front of dress, back of dress, bodice close-up, train close-up, size label, any areas of concern (up to 6)"
      : svc === "tailoring"
      ? "Full garment front, full garment back, close-up of area to alter (up to 3)"
      : svc === "custom"
      ? "Full garment, close-ups of repair areas, any reference photos (up to 4)"
      : "Any helpful photos of your garment (up to 2)";

  const garmentLabel =
    svc === "bridal" ? "Additional Notes" :
    svc === "tailoring" ? "Additional Notes / Special Instructions" :
    svc === "custom" ? "Describe Your Project" :
    "Tell Me About Your Garment";

  const garmentPlaceholder =
    svc === "bridal" ? "Any additional context, concerns, or special requests for your dress..." :
    svc === "tailoring" ? "Anything else I should know about the garment or the alteration..." :
    svc === "custom" ? "Describe the project — what needs to be done, materials involved, any deadlines..." :
    "Describe the garment, what alterations you need, and anything else I should know...";

  // ── Handlers ──────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "garmentDetails") setCharCount(value.length);
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const toggleAlt = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => setter((prev) => prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxPhotos - attachments.length;
    if (remaining <= 0) return;
    let hasError = false;
    files.slice(0, remaining).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, files: `"${file.name}" exceeds 5 MB.` }));
        hasError = true;
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setAttachments((prev) => [...prev, { filename: file.name, content: dataUrl, preview: dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
    if (!hasError) setErrors((prev) => ({ ...prev, files: undefined }));
    e.target.value = "";
  };

  const removeAttachment = (i: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
    setErrors((prev) => ({ ...prev, files: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isWaitlist,
          alterationsNeeded: bridalAlterations,
          tailoringAlterations,
          attachments: attachments.map(({ filename, content }) => ({ filename, content })),
        }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) {
        setFormData(INITIAL_FORM);
        setCharCount(0);
        setAttachments([]);
        setBridalAlterations([]);
        setTailoringAlterations([]);
      }
    } catch { setStatus("error"); }
  };

  const fieldClass = (field: keyof FormData) =>
    `w-full bg-transparent border-b py-3 font-jost text-sm text-charcoal placeholder:text-charcoal/25 outline-none transition-all duration-300 ${
      errors[field] ? "border-red-400 focus:border-red-400" : "border-blush focus:border-gold"
    }`;

  const sectionLabel = "font-jost text-[0.65rem] tracking-[0.2em] uppercase text-gold mb-5 block";

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative flex items-end overflow-hidden bg-near_black" style={{ minHeight: "40vh" }} aria-label="Contact hero">
        <div className="absolute inset-0 bg-gradient-to-br from-near_black via-near_black to-charcoal/60 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-14 pt-36 lg:pt-44">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label text-gold/70 mb-4">{text.heroLabel}</p>
            <h1 className="font-cormorant italic text-ivory text-5xl lg:text-6xl mb-5">
              {text.heroHeading}
            </h1>
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </motion.div>
        </div>
      </section>

      {/* ── WAITLIST BANNER ────────────────────────────────────── */}
      <AnimatePresence>
        {isWaitlist && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gold/10 border-y border-gold/25 px-6 py-4" role="status"
          >
            <p className="max-w-7xl mx-auto font-jost text-sm text-charcoal/70 text-center leading-relaxed">
              <span className="font-medium text-charcoal">{text.waitlistBannerBold}</span>{" "}
              {text.waitlistBannerText}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTACT LAYOUT ─────────────────────────────────────── */}
      <section className="bg-ivory py-14 lg:py-20 px-6" aria-label="Contact information and form">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 lg:gap-24">

            {/* ── Left: Info ────────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="font-cormorant italic text-charcoal text-3xl mb-8">Contact Information</h2>
              <ul className="space-y-7 mb-10" role="list">
                <li className="flex items-start gap-4">
                  <span className="text-gold mt-0.5 flex-shrink-0"><PinIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Location</p>
                    <p className="font-jost text-charcoal/60 text-sm">{site.location}</p>
                    <p className="font-jost text-charcoal/60 text-sm">{site.availability}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-gold mt-0.5 flex-shrink-0"><MailIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Email</p>
                    <a href={`mailto:${site.email}`} className="font-jost text-charcoal/60 text-sm hover:text-gold transition-colors duration-300">
                      {site.email}
                    </a>
                  </div>
                </li>
                {site.phone && (
                  <li className="flex items-start gap-4">
                    <span className="text-gold mt-0.5 flex-shrink-0"><PhoneIcon /></span>
                    <div>
                      <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Call or Text</p>
                      <a href={`tel:${site.phone.replace(/\D/g, "")}`} className="font-jost text-charcoal/60 text-sm hover:text-gold transition-colors duration-300 block">
                        {site.phone}
                      </a>
                      <a href={`sms:${site.phone.replace(/\D/g, "")}`} className="font-jost text-charcoal/40 text-xs hover:text-gold transition-colors duration-300 mt-0.5 block">
                        Tap to send a text →
                      </a>
                    </div>
                  </li>
                )}
                <li className="flex items-start gap-4">
                  <span className="text-gold mt-0.5 flex-shrink-0"><InstagramIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Instagram</p>
                    <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-jost text-charcoal/60 text-sm hover:text-gold transition-colors duration-300">
                      {site.instagram}
                    </a>
                  </div>
                </li>
              </ul>
              <div className="border border-gold/20 bg-gold/5 p-5 mb-10">
                <p className="font-cormorant italic text-charcoal text-lg leading-snug">&ldquo;{site.responseTime}&rdquo;</p>
              </div>
              <div className="overflow-hidden max-h-96">
                <SanityImage image={contactImage} placeholderLabel="CONTACT_IMAGE" placeholderRatio="landscape" />
              </div>
            </motion.div>

            {/* ── Right: Form ───────────────────────────────────── */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
              <h2 className="font-cormorant italic text-charcoal text-3xl mb-8">
                {isWaitlist ? "Join the Waitlist" : "Send a Request"}
              </h2>

              {status === "success" ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
                  <div className="w-12 h-px bg-gold mx-auto mb-8" aria-hidden="true" />
                  <h3 className="font-cormorant italic text-charcoal text-4xl mb-4">{text.successHeading}</h3>
                  <p className="font-jost text-charcoal/60 text-sm leading-relaxed max-w-sm mx-auto">
                    {isWaitlist ? text.waitlistSuccessMessage : text.successMessage}
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} noValidate aria-label="Contact request form">
                  <div className="space-y-8">

                    {/* Name */}
                    <div className="group">
                      <label htmlFor="name" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                        Full Name <span className="text-gold" aria-label="required">*</span>
                      </label>
                      <input id="name" name="name" type="text" autoComplete="name" required value={formData.name} onChange={handleChange} className={fieldClass("name")} placeholder="Your full name" aria-invalid={!!errors.name} />
                      {errors.name && <p className="mt-1.5 font-jost text-xs text-red-400" role="alert">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div className="group">
                      <label htmlFor="email" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                        Email Address <span className="text-gold" aria-label="required">*</span>
                      </label>
                      <input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} className={fieldClass("email")} placeholder="your@email.com" aria-invalid={!!errors.email} />
                      {errors.email && <p className="mt-1.5 font-jost text-xs text-red-400" role="alert">{errors.email}</p>}
                    </div>

                    {/* Phone + Service */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="group">
                        <label htmlFor="phone" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                          Phone <span className="text-charcoal/50 normal-case tracking-normal">(optional)</span>
                        </label>
                        <input id="phone" name="phone" type="tel" autoComplete="tel" value={formData.phone} onChange={handleChange} className={fieldClass("phone")} placeholder="(412) 000-0000" />
                      </div>
                      <div className="group">
                        <label htmlFor="serviceType" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                          Service Type
                        </label>
                        <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange} className={`${fieldClass("serviceType")} bg-ivory cursor-pointer`}>
                          <option value="">Select...</option>
                          <option value="bridal">Bridal Alteration</option>
                          <option value="tailoring">Everyday Tailoring</option>
                          <option value="custom">Custom Work / Repairs</option>
                          <option value="unsure">Not Sure Yet</option>
                        </select>
                      </div>
                    </div>

                    {/* Event Date */}
                    <div className="group">
                      <label htmlFor="eventDate" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                        Event Date <span className="text-charcoal/50 normal-case tracking-normal">(if applicable)</span>
                      </label>
                      <input id="eventDate" name="eventDate" type="date" value={formData.eventDate} onChange={handleChange} className={`${fieldClass("eventDate")} bg-ivory`} />
                    </div>

                    {/* ── Service-specific section ─────────────── */}
                    <AnimatePresence mode="wait">
                      {svc === "bridal" && (
                        <motion.div
                          key="bridal"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="border border-gold/20 bg-gold/[0.03] p-6 space-y-7"
                        >
                          <span className={sectionLabel}>Dress Details</span>
                          <p className="font-jost text-xs text-charcoal/45 -mt-4">All fields optional — share what you know, skip what you don&apos;t.</p>

                          {/* Fabric notes */}
                          <div className="group">
                            <label htmlFor="fabricNotes" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                              Fabric / Construction Notes
                            </label>
                            <input id="fabricNotes" name="fabricNotes" type="text" value={formData.fabricNotes} onChange={handleChange} className={fieldClass("fabricNotes")} placeholder="e.g. lace bodice, heavy beading, horsehair hem" />
                          </div>

                          {/* Sizes */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="group">
                              <label htmlFor="dressSizeOrdered" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                                Dress Size Ordered
                              </label>
                              <input id="dressSizeOrdered" name="dressSizeOrdered" type="text" value={formData.dressSizeOrdered} onChange={handleChange} className={fieldClass("dressSizeOrdered")} placeholder="e.g. 12, 4W" />
                            </div>
                            <div className="group">
                              <label htmlFor="currentStreetSize" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                                Current Street Size
                              </label>
                              <input id="currentStreetSize" name="currentStreetSize" type="text" value={formData.currentStreetSize} onChange={handleChange} className={fieldClass("currentStreetSize")} placeholder="e.g. 8, size 6 jeans" />
                            </div>
                          </div>

                          {/* Alterations needed */}
                          <div>
                            <p className="font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-3">
                              Alterations Requested <span className="text-charcoal/40 normal-case tracking-normal">(check all that apply)</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {BRIDAL_ALTERATIONS.map(({ value, label }) => (
                                <CheckboxItem
                                  key={value} label={label} value={value}
                                  checked={bridalAlterations.includes(value)}
                                  onChange={() => toggleAlt(setBridalAlterations, value)}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Shoes / undergarments */}
                          <div className="group">
                            <label htmlFor="shoesUndergarments" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                              Shoes &amp; Undergarments Picked?
                            </label>
                            <select id="shoesUndergarments" name="shoesUndergarments" value={formData.shoesUndergarments} onChange={handleChange} className={`${fieldClass("shoesUndergarments")} bg-gold/[0.03] cursor-pointer`}>
                              <option value="">Select...</option>
                              <option value="yes">Yes — I have both</option>
                              <option value="shoes_only">Shoes only</option>
                              <option value="not_yet">Not yet / still deciding</option>
                            </select>
                          </div>
                        </motion.div>
                      )}

                      {svc === "tailoring" && (
                        <motion.div
                          key="tailoring"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="border border-gold/20 bg-gold/[0.03] p-6 space-y-7"
                        >
                          <span className={sectionLabel}>Garment Details</span>
                          <p className="font-jost text-xs text-charcoal/45 -mt-4">All fields optional — share what you know.</p>

                          {/* Garment type + size */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="group">
                              <label htmlFor="garmentType" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                                Garment Type
                              </label>
                              <select id="garmentType" name="garmentType" value={formData.garmentType} onChange={handleChange} className={`${fieldClass("garmentType")} bg-gold/[0.03] cursor-pointer`}>
                                <option value="">Select...</option>
                                <option value="pants">Pants / Trousers</option>
                                <option value="dress">Dress</option>
                                <option value="skirt">Skirt</option>
                                <option value="jacket">Jacket / Blazer</option>
                                <option value="shirt">Shirt / Blouse</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className="group">
                              <label htmlFor="currentSize" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                                Current Size
                              </label>
                              <input id="currentSize" name="currentSize" type="text" value={formData.currentSize} onChange={handleChange} className={fieldClass("currentSize")} placeholder="e.g. 10, Medium, 32x30" />
                            </div>
                          </div>

                          {/* Tailoring alterations */}
                          <div>
                            <p className="font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-3">
                              Alterations Needed <span className="text-charcoal/40 normal-case tracking-normal">(check all that apply)</span>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {TAILORING_ALTERATIONS.map(({ value, label }) => (
                                <CheckboxItem
                                  key={value} label={label} value={value}
                                  checked={tailoringAlterations.includes(value)}
                                  onChange={() => toggleAlt(setTailoringAlterations, value)}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {svc === "custom" && (
                        <motion.div
                          key="custom"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="border border-gold/20 bg-gold/[0.03] p-6 space-y-7"
                        >
                          <span className={sectionLabel}>Project Details</span>
                          <div className="group">
                            <label htmlFor="currentSize" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                              Approximate Size
                            </label>
                            <input id="currentSize" name="currentSize" type="text" value={formData.currentSize} onChange={handleChange} className={fieldClass("currentSize")} placeholder="e.g. size 8, Medium, vintage 1970s 10" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Garment details / notes */}
                    <div className="group">
                      <div className="flex items-baseline justify-between mb-2">
                        <label htmlFor="garmentDetails" className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/70 group-focus-within:text-gold transition-colors duration-300">
                          {garmentLabel}
                        </label>
                        <span className="font-jost text-xs text-charcoal/40">{charCount}</span>
                      </div>
                      <textarea id="garmentDetails" name="garmentDetails" rows={4} value={formData.garmentDetails} onChange={handleChange} className={`${fieldClass("garmentDetails")} resize-none`} placeholder={garmentPlaceholder} />
                    </div>

                    {/* Photo upload */}
                    <div>
                      <p className="font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-1">
                        Attach Photos <span className="text-charcoal/45 normal-case tracking-normal">(optional · max {maxPhotos} · 5 MB each)</span>
                      </p>
                      <p className="font-jost text-charcoal/35 text-xs mb-3 leading-relaxed">{photoHint}</p>

                      {attachments.length < maxPhotos && (
                        <label htmlFor="photos" className="flex flex-col items-center justify-center gap-2 border border-dashed border-blush hover:border-gold/50 p-7 cursor-pointer transition-colors duration-300 group">
                          <span className="text-charcoal/30 group-hover:text-gold transition-colors duration-300"><UploadIcon /></span>
                          <span className="font-jost text-charcoal/40 text-xs">Click to attach photos</span>
                          <span className="font-jost text-charcoal/25 text-xs">JPG, PNG, HEIC, WEBP</span>
                          <input id="photos" type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                        </label>
                      )}
                      {errors.files && <p className="mt-2 font-jost text-xs text-red-400" role="alert">{errors.files}</p>}
                      {attachments.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-3">
                          {attachments.map((file, i) => (
                            <div key={i} className="relative group/thumb flex-shrink-0">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={file.preview} alt={file.filename} className="w-20 h-20 object-cover border border-blush" />
                              <button type="button" onClick={() => removeAttachment(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-charcoal text-ivory text-xs flex items-center justify-center rounded-full opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-200" aria-label={`Remove ${file.filename}`}>×</button>
                              <p className="font-jost text-charcoal/30 text-[10px] mt-1 truncate max-w-[5rem]">{file.filename}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Referral */}
                    <div className="group">
                      <label htmlFor="referralSource" className="block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/70 mb-2 group-focus-within:text-gold transition-colors duration-300">
                        How Did You Hear About Me?
                      </label>
                      <select id="referralSource" name="referralSource" value={formData.referralSource} onChange={handleChange} className={`${fieldClass("referralSource")} bg-ivory cursor-pointer`}>
                        <option value="">Select one...</option>
                        <option value="google">Google Search</option>
                        <option value="instagram">Instagram</option>
                        <option value="wordofmouth">Word of Mouth</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <button type="submit" disabled={status === "submitting"} className="btn-gold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none" aria-label={isWaitlist ? "Join the waitlist" : "Send your contact request"}>
                        {status === "submitting" ? "Sending…" : isWaitlist ? "Join the Waitlist" : "Send My Request"}
                      </button>
                      {status === "error" && (
                        <p className="mt-4 font-jost text-xs text-red-400" role="alert">
                          Something went wrong. Please email me at{" "}
                          <a href={`mailto:${site.email}`} className="underline hover:text-red-600 transition-colors">{site.email}</a>.
                        </p>
                      )}
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="bg-blush py-14 lg:py-20 px-6" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6 }} className="mb-10">
            <p className="section-label mb-4">Common Questions</p>
            <h2 id="faq-heading" className="font-cormorant italic text-charcoal text-4xl lg:text-5xl">Frequently Asked</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Accordion items={faq} />
          </motion.div>
        </div>
      </section>
    </>
  );
}
