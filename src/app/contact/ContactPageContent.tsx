"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import SanityImage from "@/components/ui/SanityImage";
import Accordion from "@/components/ui/Accordion";
import { analytics } from "@/lib/analytics";
import { preparePhoto } from "@/lib/compressImage";
import { dateFit, parseDateInput, statusText, type DateMessages } from "@/lib/bridalDates";
import PhotoCheck from "@/components/contact/PhotoCheck";
import type { PhotoCheckResult } from "@/lib/photoCheck";
import {
  BRIDAL_ALTERATIONS,
  SHOES_UNDERGARMENTS,
  MAX_PHOTOS,
  MAX_PHOTO_TOTAL_BYTES,
} from "@/lib/contactOptions";
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

/** Anything bigger is almost certainly not a phone photo. */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;

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
  dressSizeOrdered: "",
  currentStreetSize: "",
  shoesUndergarments: "",
  // Honeypot: real people never fill this in.
  company: "",
};

type FormData = typeof INITIAL_FORM;
type FormErrors = Partial<Record<keyof FormData | "files", string>>;
type AttachmentState = { filename: string; content: string; bytes: number };

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Please add your name.";
  if (!data.email.trim()) errors.email = "Please add an email address so I can reply.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "That email address does not look right.";
  return errors;
}

// ── Field components ───────────────────────────────────────────────────────
// Defined at module scope: a component declared inside the render function is
// a new type on every render, so React remounts the input on each keystroke
// and focus is lost after the first character.

const labelClass =
  "block font-jost text-xs tracking-[0.12em] uppercase text-charcoal/75 mb-2 group-focus-within:text-gold_ink transition-colors duration-300";

const fieldClass = (hasError: boolean) =>
  `w-full bg-transparent border-b py-3 min-h-[44px] font-jost text-sm text-charcoal placeholder:text-charcoal/60 outline-none transition-all duration-300 ${
    hasError ? "border-red-700 focus:border-red-700" : "border-blush focus:border-gold"
  }`;

function OptionalTag() {
  return <span className="text-charcoal/75 normal-case tracking-normal">(optional)</span>;
}

function Field({
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  optional,
  autoComplete,
  required,
  maxLength,
}: {
  name: keyof FormData;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
  optional?: boolean;
  autoComplete?: string;
  required?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="group">
      <label htmlFor={name} className={labelClass}>
        {label} {optional && <OptionalTag />}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-required={required || undefined}
        maxLength={maxLength}
        className={`${fieldClass(!!error)} ${type === "date" ? "bg-ivory" : ""}`}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1.5 font-jost text-xs text-red-700" role="alert">
          Error: {error}
        </p>
      )}
    </div>
  );
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
  hasPolicies: boolean;
  text: ContactText;
  /** True when the AI photo check is configured (ANTHROPIC_API_KEY is set). */
  photoCheckEnabled?: boolean;
  /** Wording for the note under the wedding date (Studio: Guides & tools). */
  dateMessages: DateMessages;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ContactPageContent({
  site,
  faq,
  contactImage,
  availability,
  hasPolicies,
  text,
  photoCheckEnabled = false,
  dateMessages,
}: Props) {
  const { limitedMode, waitlistServices, reopensLabel, limitedNote } = availability;

  const [branch, setBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [attachments, setAttachments] = useState<AttachmentState[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [alterationsNeeded, setAlterationsNeeded] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [photoCheck, setPhotoCheck] = useState<PhotoCheckResult | null>(null);
  const [photoCheckIncluded, setPhotoCheckIncluded] = useState(false);
  const startedRef = useRef(false);
  const formRef = useRef<HTMLDivElement>(null);

  // /contact?service=bridal preselects a card. Read on mount so the page stays
  // statically rendered.
  // Arriving from "Send a bridal party request" and the like, go straight to
  // the form rather than leaving them at the top of the page.
  useEffect(() => {
    const requested = branchFromParam(new URLSearchParams(window.location.search).get("service"));
    if (!requested) return;
    setBranch(requested);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(
      () => formRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }),
      150
    );
  }, []);

  const siteWideWaitlist = !site.isAcceptingClients;
  const branchWaitlisted = branch === "bridal" && limitedMode && waitlistServices.includes("bridal");
  const isWaitlist = siteWideWaitlist || branchWaitlisted;

  // An honest read on the wedding date as soon as it's entered, the same one
  // the timing guide gives. A date before bridal reopens, or under eight
  // weeks away, is still welcome: the button just asks rather than joins.
  const weddingDate = branch === "bridal" ? parseDateInput(formData.eventDate) : null;
  const fit = weddingDate
    ? dateFit(weddingDate, { limitedMode, bridalWaitlisted: branchWaitlisted, reopensLabel })
    : null;
  const askAboutDate = fit?.kind === "rush" || fit?.kind === "beforeReopen";

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files || []).slice(0, MAX_PHOTOS - attachments.length);
    input.value = "";
    if (files.length === 0) return;

    setPreparing(true);
    setErrors((prev) => ({ ...prev, files: undefined }));
    let total = attachments.reduce((sum, a) => sum + a.bytes, 0);
    const added: AttachmentState[] = [];
    let problem = "";
    try {
      for (const file of files) {
        if (file.size > MAX_SOURCE_BYTES) {
          problem = `"${file.name}" is too large to attach.`;
          continue;
        }
        const photo = await preparePhoto(file);
        if (total + photo.bytes > MAX_PHOTO_TOTAL_BYTES) {
          problem = `"${file.name}" would make the photos too large to send together. Try fewer photos, or email the rest to ${site.email}.`;
          continue;
        }
        total += photo.bytes;
        added.push({ filename: photo.filename, content: photo.dataUrl, bytes: photo.bytes });
      }
    } catch {
      problem = "One of those photos could not be read. Please try another.";
    } finally {
      setAttachments((prev) => [...prev, ...added]);
      if (added.length) setPhotoCheck(null);
      if (problem) setErrors((prev) => ({ ...prev, files: problem }));
      setPreparing(false);
    }
  };

  const toggleAlteration = (id: string) => {
    setAlterationsNeeded((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const removeAttachment = (i: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
    setPhotoCheck(null);
    setErrors((prev) => ({ ...prev, files: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // On a phone the fields are far above the button: take them there.
      const first = (["name", "email"] as const).find((k) => newErrors[k]);
      const field = first ? document.getElementById(first) : null;
      if (field) {
        field.focus({ preventScroll: true });
        field.scrollIntoView({
          block: "center",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }
      return;
    }
    setStatus("submitting");
    setSubmitError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          alterationsNeeded: branch === "bridal" ? alterationsNeeded : [],
          serviceType: branch ?? "unsure",
          isWaitlist,
          attachments: attachments.map(({ filename, content }) => ({ filename, content })),
          photoCheck: photoCheck && photoCheckIncluded ? photoCheck : null,
        }),
      });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) {
        analytics.formSubmit(branch ?? "unspecified");
        if (isWaitlist) analytics.waitlistJoin(branch ?? "bridal");
        setFormData(INITIAL_FORM);
        setAttachments([]);
        setAlterationsNeeded([]);
        setPhotoCheck(null);
      } else if (res.status === 413) {
        setSubmitError("The photos were too large to send.");
      } else if (res.status === 429) {
        setSubmitError("Too many requests from this connection.");
      }
    } catch {
      setStatus("error");
    }
  };

  // ── Field helpers ────────────────────────────────────────────────────────

  const fieldProps = (name: keyof FormData) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    error: errors[name],
  });

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
          <div
            >
            <p className="section-label text-gold mb-4">{text.heroLabel}</p>
            <h1 className="font-cormorant font-light italic text-[clamp(2.75rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.01em] text-ivory mb-5">
              {text.heroHeading}
            </h1>
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </div>
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

            {/* ── Left: info. Email only, by design. Below the form
                on phones, so the form is the first thing they reach. ── */}
            <div data-reveal className="order-2 lg:order-none"
            >
              <h2 className="font-cormorant italic text-charcoal text-3xl mb-8">Contact information</h2>
              <ul className="space-y-7 mb-10" role="list">
                <li className="flex items-start gap-4">
                  <span className="text-gold_ink mt-0.5 flex-shrink-0"><PinIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-xs tracking-widest uppercase mb-1">Location</p>
                    <p className="font-jost text-charcoal/75 text-sm">{site.location} · By appointment</p>
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
                  sizes="(min-width:1024px) 30vw, 100vw"
                />
              </div>
            </div>

            {/* ── Right: branching form ────────────────────────── */}
            <div data-reveal className="order-1 lg:order-none"
              ref={formRef}
            >
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
                            <Field {...fieldProps("name")} label="Full name" placeholder="Your full name" autoComplete="name" required maxLength={200} />
                            <Field {...fieldProps("email")} label="Email address" type="email" placeholder="your@email.com" autoComplete="email" required maxLength={320} />

                            {branch === "bridal" && (
                              <>
                                <div>
                                  <Field {...fieldProps("eventDate")} label="Wedding date" type="date" />
                                  <p
                                    className={`font-jost text-xs leading-[1.6] text-charcoal/75 ${fit ? "mt-2 border-l-2 border-gold pl-3" : "sr-only"}`}
                                    aria-live="polite"
                                    data-testid="date-note"
                                  >
                                    {fit ? statusText(fit, branchWaitlisted, reopensLabel, dateMessages) : ""}
                                  </p>
                                </div>
                                <Field
                                  {...fieldProps("dressDesigner")}
                                  label="Dress designer, or where you bought it"
                                  placeholder="e.g. Allure, or David's Bridal"
                                />
                                <Field
                                  {...fieldProps("dressArrival")}
                                  label="When the dress arrives"
                                  type="date"
                                  optional
                                />
                                <Field {...fieldProps("venue")} label="Venue" placeholder="Where you're getting married" optional />

                                <fieldset className="space-y-8 border-t border-blush pt-8">
                                  <legend className="font-cormorant italic text-charcoal text-xl -mb-2 pr-3">
                                    About the dress <span className="font-jost not-italic text-xs text-charcoal/75">(all optional)</span>
                                  </legend>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <Field
                                      {...fieldProps("dressSizeOrdered")}
                                      label="Dress size ordered"
                                      placeholder="e.g. 10"
                                    />
                                    <Field
                                      {...fieldProps("currentStreetSize")}
                                      label="Your usual street size"
                                      placeholder="e.g. 6"
                                    />
                                  </div>

                                  <div>
                                    <p id="alterations-label" className="font-jost text-xs tracking-[0.12em] uppercase text-charcoal/75 mb-3">
                                      What you think it needs
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6" role="group" aria-labelledby="alterations-label">
                                      {BRIDAL_ALTERATIONS.map((option) => (
                                        <label
                                          key={option.id}
                                          className="flex items-center gap-3 min-h-[44px] font-jost text-sm text-charcoal cursor-pointer"
                                        >
                                          <input
                                            type="checkbox"
                                            name="alterationsNeeded"
                                            value={option.id}
                                            checked={alterationsNeeded.includes(option.id)}
                                            onChange={() => toggleAlteration(option.id)}
                                            className="w-4 h-4 accent-gold_ink"
                                          />
                                          {option.label}
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="group">
                                    <label htmlFor="shoesUndergarments" className={labelClass}>
                                      Do you have your shoes and undergarments yet?
                                    </label>
                                    <select
                                      id="shoesUndergarments"
                                      name="shoesUndergarments"
                                      value={formData.shoesUndergarments}
                                      onChange={handleChange}
                                      className={`${fieldClass(false)} bg-ivory cursor-pointer`}
                                    >
                                      <option value="">Select one</option>
                                      {SHOES_UNDERGARMENTS.map((option) => (
                                        <option key={option.id} value={option.id}>
                                          {option.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </fieldset>
                              </>
                            )}

                            {branch === "party" && (
                              <>
                                <Field {...fieldProps("eventDate")} label="Event date" type="date" />
                                <Field
                                  {...fieldProps("garmentCount")}
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
                                className={`${fieldClass(false)} resize-none`}
                                placeholder={
                                  branch === "tailoring"
                                    ? "e.g. navy trousers, hem to flat shoes"
                                    : branch === "bridal"
                                    ? "e.g. fabric, lace or beading, anything you are worried about"
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
                                Up to {MAX_PHOTOS} photos. Front, back, and a close-up of anything you
                                are worried about. Large photos are resized before sending.
                              </p>

                              {attachments.length < MAX_PHOTOS && (
                                <label
                                  htmlFor="photos"
                                  className="flex flex-col items-center justify-center gap-2 border border-dashed border-blush hover:border-gold/50 p-7 cursor-pointer transition-colors duration-300 group has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-gold_ink has-[:focus-visible]:outline-offset-2"
                                >
                                  <span className="text-charcoal/75 group-hover:text-gold_ink transition-colors duration-300">
                                    <UploadIcon />
                                  </span>
                                  <span className="font-jost text-charcoal/75 text-xs">
                                    {preparing ? "Preparing photos" : "Add photos"}
                                  </span>
                                  <span className="font-jost text-charcoal/75 text-xs">JPG, PNG, HEIC, WEBP</span>
                                  <input
                                    id="photos"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="sr-only"
                                    onChange={handleFileChange}
                                    disabled={preparing}
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
                                      <img src={file.content} alt="" className="w-20 h-20 object-cover border border-blush" />
                                      <button
                                        type="button"
                                        onClick={() => removeAttachment(i)}
                                        className="absolute -top-3 -right-3 w-11 h-11 flex items-center justify-center opacity-100 lg:opacity-0 touch:opacity-100 focus-visible:opacity-100 group-hover/thumb:opacity-100 transition-opacity duration-200"
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
                              {photoCheckEnabled && (
                                <PhotoCheck
                                  photos={attachments.map((a) => a.content)}
                                  serviceType={branch ?? "unsure"}
                                  alterationsNeeded={alterationsNeeded}
                                  onToggleAlteration={toggleAlteration}
                                  included={photoCheckIncluded}
                                  onResult={setPhotoCheck}
                                  onIncludedChange={setPhotoCheckIncluded}
                                />
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
                                className={`${fieldClass(false)} bg-ivory cursor-pointer`}
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
                                disabled={status === "submitting" || preparing}
                                className="btn-gold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {status === "submitting"
                                  ? "Sending"
                                  : askAboutDate
                                  ? "Ask about my date"
                                  : isWaitlist
                                  ? "Join the waitlist"
                                  : "Send my request"}
                              </button>
                              {status === "error" && (
                                <p className="mt-4 font-jost text-xs text-red-700" role="alert">
                                  Error: {submitError || "something went wrong."} Please email me at{" "}
                                  <a href={`mailto:${site.email}`} className="underline">
                                    {site.email}
                                  </a>
                                  .
                                </p>
                              )}
                              <p className="mt-6 font-jost text-charcoal/75 text-xs leading-[1.65]">
                                {site.responseTime}
                                {hasPolicies && (
                                  <>
                                    {" "}By sending this you agree to my{" "}
                                    <Link href="/policies" className="text-gold_ink underline">
                                      policies
                                    </Link>
                                    .
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
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
