import { mailtoHref } from "@/lib/contact/salvya-contact";

export type ContactQuickLink = {
  id: string;
  label: string;
  hint: string;
  href: string;
};

export type ContactFaq = {
  id: string;
  question: string;
  answer: string;
  links?: { href: string; label: string }[];
};

export type ContactIntent = {
  id: string;
  label: string;
  subject: string;
  body: string;
};

export const CONTACT_QUICK_LINKS: ContactQuickLink[] = [
  { id: "track", label: "Track order", hint: "Status & delivery", href: "/track-order" },
  { id: "orders", label: "My orders", hint: "Invoice & cancel", href: "/orders" },
  { id: "returns", label: "Returns", hint: "Morocco policy", href: "/returns" },
  { id: "shipping", label: "Shipping", hint: "Rates & regions", href: "/shipping" },
];

export const CONTACT_INTENTS: ContactIntent[] = [
  {
    id: "order",
    label: "Order help",
    subject: "Order question",
    body: "Hello Salvya,\n\nMy order number is: \n\nI need help with: \n\nThank you.",
  },
  {
    id: "refund",
    label: "Refund / cancel",
    subject: "Refund or cancellation",
    body: "Hello Salvya,\n\nMy order number is: \n\nI'd like to request: \n\nThank you.",
  },
  {
    id: "product",
    label: "Product & sizing",
    subject: "Product or size question",
    body: "Hello Salvya,\n\nProduct / artist: \n\nMy question: \n\nThank you.",
  },
  {
    id: "partnership",
    label: "Creator / brand",
    subject: "Creator or partnership inquiry",
    body: "Hello Salvya,\n\nI'm reaching out about: \n\nThank you.",
  },
];

export const CONTACT_FAQS: ContactFaq[] = [
  {
    id: "walk-in",
    question: "Do you have a store I can visit?",
    answer:
      "No. Salvya is online-only. Our CIEG entity operates from Morocco and Italy, but we do not offer a public walk-in address.",
  },
  {
    id: "fastest",
    question: "What is the fastest way to reach you?",
    answer:
      "WhatsApp is usually the quickest for urgent order questions. For detailed issues (refunds, attachments), email works best.",
  },
  {
    id: "order-email",
    question: "Which email should I use for my order?",
    answer: "Use orders@salvyastore.com with your order number in the subject line. You can also check confirmation email from checkout.",
    links: [{ href: "/orders", label: "My orders" }],
  },
  {
    id: "whatsapp-lang",
    question: "Italian or Moroccan WhatsApp?",
    answer:
      "Use the Italian line for Italian/English support (+39). Use the Moroccan line for Morocco COD and local delivery questions (+212).",
  },
  {
    id: "phone",
    question: "When should I call the Morocco line?",
    answer:
      "Phone is best for quick clarifications during support hours. For order changes, WhatsApp or email creates a written record we can follow up on.",
  },
  {
    id: "bot",
    question: "What is the help center / bot chat?",
    answer:
      "It's our self-service guide: searchable topics for shipping, payments, returns, and account help — no wait for an agent.",
    links: [{ href: "/help-center", label: "Open help center" }],
  },
];

export function intentMailtoHref(intent: ContactIntent): string {
  return mailtoHref({
    subject: intent.subject,
    body: intent.body,
  });
}

export type ContactChannelFilter = "all" | "chat" | "email" | "phone" | "self";

export const CONTACT_CHANNEL_TABS: { id: ContactChannelFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "chat", label: "Chat" },
  { id: "email", label: "Email" },
  { id: "phone", label: "Call" },
  { id: "self", label: "Help" },
];

export type WhatsappTemplate = {
  id: string;
  label: string;
  message: string;
  region?: "morocco" | "italy";
};

export const WHATSAPP_TEMPLATES: WhatsappTemplate[] = [
  {
    id: "order-status",
    label: "Order status",
    message: "Hello Salvya, I'd like an update on my order.\n\nOrder number: ",
    region: "morocco",
  },
  {
    id: "cancel",
    label: "Cancel order",
    message: "Hello Salvya, I need to cancel my order.\n\nOrder number: \nReason: ",
  },
  {
    id: "wrong-size",
    label: "Wrong size / item",
    message: "Hello Salvya, I have an issue with the size/item I received.\n\nOrder number: ",
  },
  {
    id: "payment",
    label: "Payment issue",
    message: "Hello Salvya, I'm having a payment problem at checkout.\n\nDetails: ",
  },
  {
    id: "italy-shipping",
    label: "EU shipping",
    message: "Hello Salvya, I have a question about shipping to Italy/EU.\n\n",
    region: "italy",
  },
];

export function filterContactFaqs(query: string): ContactFaq[] {
  const q = query.trim().toLowerCase();
  if (!q) return CONTACT_FAQS;
  return CONTACT_FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(q) ||
      f.answer.toLowerCase().includes(q) ||
      f.links?.some((l) => l.label.toLowerCase().includes(q)),
  );
}

export function buildOrderHelpLinks(orderNumber: string): { track: string; orders: string; email: string } {
  const ref = orderNumber.trim();
  const encoded = encodeURIComponent(ref);
  return {
    track: `/track-order?order=${encoded}`,
    orders: "/orders",
    email: mailtoHref({
      subject: `Order ${ref}`,
      body: `Hello Salvya,\n\nMy order number is: ${ref}\n\nI need help with:\n\n`,
    }),
  };
}
