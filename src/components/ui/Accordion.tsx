"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AccordionItem {
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

function AccordionSingle({
  question,
  answer,
  isOpen,
  onToggle,
  id,
}: AccordionItem & { isOpen: boolean; onToggle: () => void; id: string }) {
  const panelId = `${id}-panel`;
  const triggerId = `${id}-trigger`;

  return (
    <div className="border-b border-blush">
      <h3>
        <button
          type="button"
          id={triggerId}
          className="w-full flex items-center justify-between py-5 min-h-[44px] text-left group"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
        >
          <span className="font-cormorant text-xl text-charcoal pr-4 group-hover:text-gold_ink transition-colors duration-300">
            {question}
          </span>
          <span
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-gold_ink transition-transform duration-300"
            style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="8" y1="0" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
              <line x1="0" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div id={panelId} role="region" aria-labelledby={triggerId}>
              <p className="font-jost text-charcoal/75 text-sm leading-[1.65] pb-5 pr-8 max-w-[65ch]">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className="w-full">
      {items.map((item, i) => (
        <AccordionSingle
          key={i}
          id={`${baseId}-${i}`}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
}
