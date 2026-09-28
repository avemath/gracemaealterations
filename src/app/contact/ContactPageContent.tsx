"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SanityImage from "@/components/ui/SanityImage";
import Accordion from "@/components/ui/Accordion";
import { analytics } from "@/lib/analytics";
import type { SanityFaqItem, SanityImage as SanityImageType } from "@/lib/sanity.queries";

// ── Branches ───────────────────────────────────────────────────────────────

type Branch = "tailoring" | "bridal" | "party";

const BRANCH_IDS: Branch[] = ["tailoring", "bridal", "party"];

/** Older links used ?service=custom for special occasion work. */
function branchFromParam(value: string | null): Branch | null {
  if (!value) return null;
  if (value === "custom") return "party";
  return BRANCH_IDS.includes(value as Branch) ? (value as Branch) : null;
}

const REFERRALS = [
  "Google",
  "Instagram",
  "Bridal shop",
  "Wedding planner",
  "The Knot / WeddingWire",
  "A friend who was a client",
  "Other",
];

const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;

const INITIAL_FORM = {
  name: "",
  email: "",
  garmentDetails: "",
  referralSource: "",
  eventDate: "",
  dressDesigner: "",
  dressArrival: "",
  venue: "",
  garmentCount: "",
  // Honeypot: real people never fill this in.
  company: "",
};

type FormData = typeof INITIAL_FORM;
type FormErrors = Partial<Record<keyof FormData | "files", string>>;
type AttachmentState = { filename: string; content: string; preview: string };

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Please add your name.";
  if (!data.email.trim()) errors.email = "Please add an email address so I can reply.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "That email address does not look right.";
  return errors;
}

// ── Icons ──────────────────────────────────────────────────────────────────

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
const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

// ── Props ──────────────────────────────────────────────────────────────────

interface ContactText {
  heroLabel: string;
  heroHeading: string;
  waitlistBannerBold: string;
  waitlistBannerText: string;
  successHeading: string;
  successMessage: string;
  waitlistSuccessMessage: string;
}

interface Availability {
  limitedMode: boolean;
  waitlistServices: string[];
  reopensLabel: string;
  limitedNote: string;
}

interface Props {
  site: {
    email: string;
    instagram: string;
    instagramUrl: string;
    location: string;
    availability: string;
    responseTime: string;
    isAcceptingClients: boolean;
  };
  faq: SanityFaqItem[];
  contactImage: SanityImageType | null;
  availability: Availability;
  text: ContactText;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ContactPageContent({
  site,
  faq,
  contactImage,
  availability,
  text,
}: Props) {
  const { limitedMode, waitlistServices, reopensLabel, limitedNote } = availability;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [attachments, setAttachments] = useState<AttachmentState[]>([]);
  const startedRef = useRef(false);
  const formRef = useRef<HTMLDivElement>(null);

  // /contact?service=bridal preselects a card. Read on mount so the page stays
  // statically rendered.
  useEffect(() => {
    const requested = branchFromParam(new URLSearchParams(window.location.search).get("service"));
    if (requested) setBranch(requested);
  }, []);

  const siteWideWaitlist = !site.isAcceptingClients;
  const branchWaitlisted = branch === "bridal" && limitedMode && waitlistServices.includes("bridal");
  const isWaitlist = siteWideWaitlist || branchWaitlisted;

  const CARDS: { id: Branch; title: string; blurb: string }[] = [
    {
      id: "tailoring",
      title: "Tailoring or a repair",
      blurb: "Hems, waists, sleeves, zips. Open now, usually done within two weeks.",
    },
    {
      id: "bridal",
      title: limitedMode ? `Bridal (${reopensLabel} waitlist)` : "Bridal",
      blurb: limitedMode
        ? "Join the waitlist and you'll get first pick of fitting dates, in the order you joined."
        : "Hems, bustles, bodice work and fittings for your gown.",
    },
    {
      id: "party",
      title: "Bridal party or special occasion",
      blurb: "Bridesmaids, mothers, flower girls: one point of contact, one pickup day.",
    },
  ];

  const heading = branchWaitlisted
    ? "Join the bridal waitlist"
    : siteWideWaitlist
    ? "Join the waitlist"
    : "Send a request";

  // ── Handlers ─────────────────────────────────────────────────────────────

  const chooseBranch = (id: Branch) => {
    setBranch(id);
    setStatus("idle");
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (!startedRef.current) {
      startedRef.current = true;
      analytics.formStart(branch ?? "unspecified");
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_PHOTOS - attachments.length;
    if (remaining <= 0) return;
    let hasError = false;
    files.slice(0, remaining).forEach((file) => {
      if (file.size > MAX_BYTES) {
        setErrors((prev) => ({ ...prev, files: `"${file.name}" is over 5 MB.` }));
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
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          serviceType: branch ?? "unsure",
          isWaitlist,
          reopensLabel,
          attachments: attachments.map(({ filename, content }) => ({ filename, content })),
        }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) {
        analytics.formSubmit(branch ?? "unspecified");
        if (isWaitlist) analytics.waitlistJoin(branch ?? "bridal");
        setFormData(INITIAL_FORM);
        setAttachments([]);
      }
    } catch {
      setStatus("error");
    }
  };

  // ── Field helpers ────────────────────────────────────────────────────────

  const fieldClass = (field: keyof FormData) =>
    `w-full bg-transparent border-b py-3 min-h-[44px] font-jost text-sm text-charcoal placeholder:text-charcoal/40 outline-none transition-all duration-300 ${
      errors[field] ? "border-red-700 focus:border-red-700" : "border-blush focus:border-gold"
    }`;

  const labelClass =
    "block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/75 mb-2 group-focus-within:text-gold_ink transition-colors duration-300";

  const Field = ({
    name,
    label,
    type = "text",
    placeholder,
    optional,
  }: {
    name: keyof FormData;
    label: string;
    type?: string;
    placeholder?: string;
    optional?: boolean;
  }) => (
    <div className="group">
      <label htmlFor={name} className={labelClass}>
        {label}{" "}
        {optional && <span className="text-charcoal/75 normal-case tracking-normal">(optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={formData[name]}
        onChange={handleChange}
        className={`${fieldClass(name)} ${type === "date" ? "bg-ivory" : ""}`}
        placeholder={placeholder}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="mt-1.5 font-jost text-xs text-red-700" role="alert">
          Error: {errors[name]}
        </p>
      )}
    </div>
  );

  const notesLabel =
    branch === "tailoring"
      ? "The garment, and what you'd like done"
      : branch === "bridal"
      ? "Anything else I should know"
      : "Notes";

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="relative flex items-end overflow-hidden bg-near_black" style={{ minHeight: "40vh" }} aria-label="Contact hero">
        <div className="absolute inset-0 bg-gradient-to-br from-near_black via-near_black to-charcoal/60 pointer-events-none" aria-hidden="true" />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-14 pt-36 lg:pt-44">
          <motion.div initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="section-label text-gold mb-4">{text.heroLabel}</p>
            <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory mb-5">
              {text.heroHeading}
            </h1>
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </motion.div>
        </div>
      </section>

      {/* ── AVAILABILITY BANNER ────────────────────────────────── */}
      {(limitedMode || siteWideWaitlist) && (
        <div className="bg-gold/10 border-y border-gold/25 px-6 py-5" role="status">
          <p className="max-w-3xl mx-auto font-jost text-sm text-charcoal/75 leading-[1.65]">
            {limitedMode ? limitedNote : `${text.waitlistBannerBold} ${text.waitlistBannerText}`}
          </p>
        </div>
      )}

      {/* ── CONTACT LAYOUT ─────────────────────────────────────── */}
      <section className="bg-ivory py-14 lg:py-20 px-6" aria-label="Contact information and form">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-16 lg:gap-24">

            {/* ── Left: info. Email only, by design. ───────────── */}
            <motion.div initial={false} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <h2 className="font-cormorant italic text-charcoal text-3xl mb-8">Contact information</h2>
              <ul className="space-y-7 mb-10" role="list">
                <li className="flex items-start gap-4">
                  <span className="text-gold_ink mt-0.5 flex-shrink-0"><PinIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Location</p>
                    <p className="font-jost text-charcoal/75 text-sm">{site.location}</p>
                    <p className="font-jost text-charcoal/75 text-sm">{site.availability}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-gold_ink mt-0.5 flex-shrink-0"><MailIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Email</p>
                    <a href={`mailto:${site.email}`} className="font-jost text-charcoal/75 text-sm hover:text-gold_ink transition-colors duration-300">
                      {site.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-gold_ink mt-0.5 flex-shrink-0"><InstagramIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Instagram</p>
                    <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-jost text-charcoal/75 text-sm hover:text-gold_ink transition-colors duration-300">
                      {site.instagram}
                    </a>
                  </div>
                </li>
              </ul>

              <div className="border border-gold/20 bg-gold/5 p-5 mb-10">
                <p className="font-cormorant italic text-charcoal text-lg leading-snug">
                  &ldquo;{site.responseTime}&rdquo;
                </p>
              </div>

              <div className="overflow-hidden max-h-96">
                <SanityImage
                  image={contactImage}
                  placeholderLabel="CONTACT_IMAGE"
                  placeholderRatio="square"
                  sizes="(min-width:1024px) 40vw, 100vw"
                />
              </div>
            </motion.div>

            {/* ── Right: branching form ────────────────────────── */}
            <motion.div ref={formRef} initial={false} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
              {status === "success" ? (
                <div className="text-center py-20">
                  <div className="w-12 h-px bg-gold mx-auto mb-8" aria-hidden="true" />
                  <h2 className="font-cormorant italic text-charcoal text-4xl mb-4">{text.successHeading}</h2>
                  <p className="font-jost text-charcoal/75 text-sm leading-[1.65] max-w-sm mx-auto">
                    {isWaitlist ? text.waitlistSuccessMessage : text.successMessage}
                  </p>
                  <p className="font-jost text-charcoal/75 text-sm leading-[1.65] max-w-sm mx-auto mt-3">
                    {site.responseTime}
                  </p>
                </div>
              ) : (
                <>
                  {/* Step 1 */}
                  <h2 className="font-cormorant italic text-charcoal text-3xl mb-2">
                    What can I help with?
                  </h2>
                  <p className="font-jost text-charcoal/75 text-sm leading-[1.65] mb-6">
                    Pick one, then tell me a little about it.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10" role="group" aria-label="Type of request">
                    {CARDS.map((card) => {
                      const selected = branch === card.id;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => chooseBranch(card.id)}
                          aria-pressed={selected}
                          className={`text-left p-5 min-h-[44px] border transition-colors duration-300 ${
                            selected
                              ? "border-gold bg-gold/10"
                              : "border-blush hover:border-gold/50 bg-transparent"
                          }`}
                        >
                          <span className="block font-cormorant text-charcoal text-xl leading-tight mb-2">
                            {card.title}
                          </span>
                          <span className="block font-jost text-charcoal/75 text-xs leading-[1.5]">
                            {card.blurb}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Step 2 */}
                  <AnimatePresence initial={false}>
                    {branch && (
                      <motion.div
                        key={branch}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                      >
                        <h3 className="font-cormorant italic text-charcoal text-2xl mb-8">{heading}</h3>

                        <form onSubmit={handleSubmit} noValidate aria-label="Contact request form">
                          <div className="space-y-8">
                            <Field name="name" label="Full name" placeholder="Your full name" />
                            <Field name="email" label="Email address" type="email" placeholder="your@email.com" />

                            {branch === "bridal" && (
                              <>
                                <Field name="eventDate" label="Wedding date" type="date" />
                                <Field
                                  name="dressDesigner"
                                  label="Dress designer, or where you bought it"
                                  placeholder="e.g. Allure, or David's Bridal"
                                />
                                <Field
                                  name="dressArrival"
                                  label="When the dress arrives"
                                  type="date"
                                  optional
                                />
                                <Field name="venue" label="Venue" placeholder="Where you're getting married" optional />
                              </>
                            )}

                            {branch === "party" && (
                              <>
                                <Field name="eventDate" label="Event date" type="date" />
                                <Field
                                  name="garmentCount"
                                  label="How many garments"
                                  type="number"
                                  placeholder="e.g. 4"
                                />
                              </>
                            )}

                            <div className="group">
                              <label htmlFor="garmentDetails" className={labelClass}>
                                {notesLabel}
                              </label>
                              <textarea
                                id="garmentDetails"
                                name="garmentDetails"
                                rows={4}
                                value={formData.garmentDetails}
                                onChange={handleChange}
                                className={`${fieldClass("garmentDetails")} resize-none`}
                                placeholder={
                                  branch === "tailoring"
                                    ? "e.g. navy trousers, hem to flat shoes"
                                    : "Anything you want me to know"
                                }
                              />
                            </div>

                            {/* Photos */}
                            <div>
                              <p className="font-jost text-xs tracking-[0.12em] uppercase text-charcoal/75 mb-1">
                                Photos <span className="normal-case tracking-normal">(optional)</span>
                              </p>
                              <p id="photos-hint" className="font-jost text-charcoal/75 text-xs mb-3 leading-[1.65]">
                                Up to {MAX_PHOTOS} photos, 5 MB each. Front, back, and a close-up of
                                anything you are worried about.
                              </p>

                              {attachments.length < MAX_PHOTOS && (
                                <label
                                  htmlFor="photos"
                                  className="flex flex-col items-center justify-center gap-2 border border-dashed border-blush hover:border-gold/50 p-7 cursor-pointer transition-colors duration-300 group"
                                >
                                  <span className="text-charcoal/75 group-hover:text-gold_ink transition-colors duration-300">
                                    <UploadIcon />
                                  </span>
                                  <span className="font-jost text-charcoal/75 text-xs">Click to attach photos</span>
                                  <span className="font-jost text-charcoal/75 text-xs">JPG, PNG, HEIC, WEBP</span>
                                  <input
                                    id="photos"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    aria-describedby="photos-hint"
                                  />
                                </label>
                              )}
                              {errors.files && (
                                <p className="mt-2 font-jost text-xs text-red-700" role="alert">
                                  Error: {errors.files}
                                </p>
                              )}
                              {attachments.length > 0 && (
                                <ul className="flex flex-wrap gap-3 mt-3">
                                  {attachments.map((file, i) => (
                                    <li key={i} className="relative group/thumb flex-shrink-0">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src={file.preview} alt="" className="w-20 h-20 object-cover border border-blush" />
                                      <button
                                        type="button"
                                        onClick={() => removeAttachment(i)}
                                        className="absolute -top-3 -right-3 w-11 h-11 flex items-center justify-center opacity-0 focus-visible:opacity-100 group-hover/thumb:opacity-100 transition-opacity duration-200"
                                        aria-label={`Remove ${file.filename}`}
                                      >
                                        <span className="w-6 h-6 bg-charcoal text-ivory text-xs flex items-center justify-center rounded-full" aria-hidden="true">
                                          ×
                                        </span>
                                      </button>
                                      <p className="font-jost text-charcoal/75 text-[10px] mt-1 truncate max-w-[5rem]">
                                        {file.filename}
                                      </p>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>

                            {/* Referral */}
                            <div className="group">
                              <label htmlFor="referralSource" className={labelClass}>
                                How did you find me?
                              </label>
                              <select
                                id="referralSource"
                                name="referralSource"
                                value={formData.referralSource}
                                onChange={handleChange}
                                className={`${fieldClass("referralSource")} bg-ivory cursor-pointer`}
                              >
                                <option value="">Select one</option>
                                {REFERRALS.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Honeypot: hidden from people, tempting to bots. */}
                            <div className="hidden" aria-hidden="true">
                              <label htmlFor="company">Company</label>
                              <input
                                id="company"
                                name="company"
                                type="text"
                                tabIndex={-1}
                                autoComplete="off"
                                value={formData.company}
                                onChange={handleChange}
                              />
                            </div>

                            <div className="pt-2">
                              <button
                                type="submit"
                                disabled={status === "submitting"}
                                className="btn-gold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {status === "submitting"
                                  ? "Sending"
                                  : isWaitlist
                                  ? "Join the waitlist"
                                  : "Send my request"}
                              </button>
                              {status === "error" && (
                                <p className="mt-4 font-jost text-xs text-red-700" role="alert">
                                  Error: something went wrong. Please email me at{" "}
                                  <a href={`mailto:${site.email}`} className="underline">
                                    {site.email}
                                  </a>
                                  .
                                </p>
                              )}
                              <p className="mt-6 font-jost text-charcoal/75 text-xs leading-[1.65]">
                                {site.responseTime} By sending this you agree to my{" "}
                                <Link href="/policies" className="text-gold_ink underline">
                                  policies
                                </Link>
                                .
                              </p>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="bg-blush py-14 lg:py-20 px-6" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <p className="section-label mb-4">Common questions</p>
            <h2 id="faq-heading" className="font-cormorant italic text-charcoal text-[clamp(2rem,3.5vw,3.25rem)] leading-[1.1]">
              Frequently asked
            </h2>
          </div>
          <Accordion items={faq} />
        </div>
      </section>
    </>
  );
}
