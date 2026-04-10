"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import Accordion from "@/components/ui/Accordion";
import { SITE, FAQ } from "@/data/content";

type FormData = {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  eventDate: string;
  garmentDetails: string;
  referralSource: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  phone: "",
  serviceType: "",
  eventDate: "",
  garmentDetails: "",
  referralSource: "",
};

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = "Full name is required.";
  if (!data.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!data.garmentDetails.trim())
    errors.garmentDetails = "Please tell me a bit about your garment.";
  return errors;
}

// Instagram icon
const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const PinIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setStatus("success");
        setFormData(INITIAL_FORM);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full bg-transparent border-b ${
      errors[field] ? "border-red-400" : "border-blush focus:border-gold"
    } py-3 font-jost text-sm text-charcoal placeholder:text-charcoal/30 outline-none transition-colors duration-300`;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="pt-32 pb-16 px-6 bg-ivory"
        style={{ minHeight: "30vh", display: "flex", alignItems: "center" }}
        aria-label="Contact page hero"
      >
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="section-label mb-4">Get in Touch</p>
            <h1 className="font-cormorant italic text-charcoal text-5xl lg:text-6xl mb-4">
              Let&apos;s Talk About Your Garment
            </h1>
            <div className="w-12 h-px bg-gold" aria-hidden="true" />
          </motion.div>
        </div>
      </section>

      {/* ── MAIN CONTACT LAYOUT ──────────────────────────────── */}
      <section className="bg-ivory py-12 lg:py-20 px-6" aria-label="Contact information and form">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

            {/* Left column: info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h2 className="font-cormorant italic text-charcoal text-3xl mb-8">
                Contact Information
              </h2>

              <ul className="space-y-6 mb-10" role="list">
                <li className="flex items-start gap-4">
                  <span className="text-gold mt-0.5"><PinIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-sm font-medium">Location</p>
                    <p className="font-jost text-charcoal/60 text-sm">{SITE.location}</p>
                    <p className="font-jost text-charcoal/60 text-sm">{SITE.availability}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-gold mt-0.5"><MailIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-sm font-medium">Email</p>
                    <a
                      href={`mailto:${SITE.email}`}
                      className="font-jost text-charcoal/60 text-sm hover:text-gold transition-colors duration-300"
                    >
                      {SITE.email}
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="text-gold mt-0.5"><InstagramIcon /></span>
                  <div>
                    <p className="font-jost text-charcoal text-sm font-medium">Instagram</p>
                    <a
                      href={SITE.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-jost text-charcoal/60 text-sm hover:text-gold transition-colors duration-300"
                    >
                      {SITE.instagram}
                    </a>
                  </div>
                </li>
              </ul>

              <div className="border border-gold/20 bg-gold/5 p-5 mb-10">
                <p className="font-cormorant italic text-charcoal text-lg mb-1">
                  &ldquo;{SITE.responseTime}&rdquo;
                </p>
              </div>

              {/*
                CONTACT_IMAGE
                A photo of the workspace, sewing table, fabric close-up,
                or a warm candid shot. Square ratio. File: /public/images/contact.jpg
              */}
              <ImagePlaceholder label="CONTACT_IMAGE" aspectRatio="square" />
            </motion.div>

            {/* Right column: form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 }}
            >
              <h2 className="font-cormorant italic text-charcoal text-3xl mb-8">
                Send a Request
              </h2>

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16"
                >
                  <div className="w-12 h-px bg-gold mx-auto mb-6" aria-hidden="true" />
                  <h3 className="font-cormorant italic text-charcoal text-3xl mb-4">
                    Thank you.
                  </h3>
                  <p className="font-jost text-charcoal/65 text-sm leading-relaxed max-w-sm mx-auto">
                    Your message has been received. I&apos;ll be in touch within 24 hours to
                    discuss your garment and schedule a consultation.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  aria-label="Contact request form"
                >
                  <div className="space-y-8">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="name"
                        className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-2"
                      >
                        Full Name <span className="text-gold" aria-label="required">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClass("name")}
                        placeholder="Your full name"
                        aria-describedby={errors.name ? "name-error" : undefined}
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1.5 font-jost text-xs text-red-400" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-2"
                      >
                        Email Address <span className="text-gold" aria-label="required">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass("email")}
                        placeholder="your@email.com"
                        aria-describedby={errors.email ? "email-error" : undefined}
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1.5 font-jost text-xs text-red-400" role="alert">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone (optional) */}
                    <div>
                      <label
                        htmlFor="phone"
                        className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-2"
                      >
                        Phone <span className="text-charcoal/30">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputClass("phone")}
                        placeholder="(412) 000-0000"
                      />
                    </div>

                    {/* Service Type */}
                    <div>
                      <label
                        htmlFor="serviceType"
                        className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-2"
                      >
                        Service Type
                      </label>
                      <select
                        id="serviceType"
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        className={`${inputClass("serviceType")} bg-ivory`}
                        aria-label="Select a service type"
                      >
                        <option value="">Select a service...</option>
                        <option value="bridal">Bridal Alteration</option>
                        <option value="tailoring">Everyday Tailoring</option>
                        <option value="custom">Custom Work</option>
                        <option value="unsure">Not Sure Yet</option>
                      </select>
                    </div>

                    {/* Event Date */}
                    <div>
                      <label
                        htmlFor="eventDate"
                        className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-2"
                      >
                        Event Date <span className="text-charcoal/30">(if applicable)</span>
                      </label>
                      <input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        value={formData.eventDate}
                        onChange={handleChange}
                        className={`${inputClass("eventDate")} bg-ivory`}
                        aria-label="Event date if applicable"
                      />
                    </div>

                    {/* Garment Details */}
                    <div>
                      <label
                        htmlFor="garmentDetails"
                        className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-2"
                      >
                        Tell Me About Your Garment{" "}
                        <span className="text-gold" aria-label="required">*</span>
                      </label>
                      <textarea
                        id="garmentDetails"
                        name="garmentDetails"
                        required
                        rows={5}
                        value={formData.garmentDetails}
                        onChange={handleChange}
                        className={`${inputClass("garmentDetails")} resize-none`}
                        placeholder="Describe the garment, what alterations you need, and anything else I should know..."
                        aria-describedby={errors.garmentDetails ? "garment-error" : undefined}
                        aria-invalid={!!errors.garmentDetails}
                      />
                      {errors.garmentDetails && (
                        <p id="garment-error" className="mt-1.5 font-jost text-xs text-red-400" role="alert">
                          {errors.garmentDetails}
                        </p>
                      )}
                    </div>

                    {/* Referral Source */}
                    <div>
                      <label
                        htmlFor="referralSource"
                        className="block font-jost text-xs tracking-[0.15em] uppercase text-charcoal/50 mb-2"
                      >
                        How Did You Hear About Me?
                      </label>
                      <select
                        id="referralSource"
                        name="referralSource"
                        value={formData.referralSource}
                        onChange={handleChange}
                        className={`${inputClass("referralSource")} bg-ivory`}
                        aria-label="How did you hear about us"
                      >
                        <option value="">Select one...</option>
                        <option value="google">Google Search</option>
                        <option value="instagram">Instagram</option>
                        <option value="wordofmouth">Word of Mouth</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Submit */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={status === "submitting"}
                        className="btn-gold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send your contact request"
                      >
                        {status === "submitting" ? "Sending..." : "Send My Request"}
                      </button>

                      {status === "error" && (
                        <p className="mt-4 font-jost text-xs text-red-400" role="alert">
                          Something went wrong. Please try again or email me directly at{" "}
                          <a href={`mailto:${SITE.email}`} className="underline">
                            {SITE.email}
                          </a>
                          .
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

      {/* ── FAQ SECTION ──────────────────────────────────────── */}
      <section
        className="bg-blush py-16 lg:py-24 px-6"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <p className="section-label mb-4">Common Questions</p>
            <h2
              id="faq-heading"
              className="font-cormorant italic text-charcoal text-4xl lg:text-5xl"
            >
              Frequently Asked
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Accordion items={FAQ} />
          </motion.div>
        </div>
      </section>
    </>
  );
}
