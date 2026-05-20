import { NextResponse, type NextRequest } from "next/server";
import {
  runUserLifecycleAutomation,
  type EmailAutomationEvent,
  type UserLifecyclePayload,
} from "@/lib/email/automations";
import { isEmailAutomationAuthorized } from "@/lib/email/automation-auth";
import { createServerSupabase } from "@/lib/supabase/server-ssr";
import { createServiceSupabase } from "@/lib/supabase/service";

const ALLOWED_EVENTS = new Set<EmailAutomationEvent>([
  "user.registered",
  "user.profile_incomplete",
  "cart.abandoned",
  "cart.abandoned.reminder",
  "product.restock",
  "user.newsletter_opt_in",
]);

/** Server-triggered lifecycle emails only (cron, internal jobs, or dev). */
const SERVER_ONLY_EVENTS = new Set<EmailAutomationEvent>([
  "cart.abandoned",
  "cart.abandoned.reminder",
  "product.restock",
]);

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest) {
  const service = createServiceSupabase();
  if (!service) return json({ ok: false, error: "Email service not configured" }, 503);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  if (!body || typeof body !== "object") return json({ ok: false, error: "Invalid body" }, 400);
  const o = body as Record<string, unknown>;
  const event = o.event as EmailAutomationEvent;
  if (!event || !ALLOWED_EVENTS.has(event)) {
    return json({ ok: false, error: "Invalid or unsupported event" }, 400);
  }

  if (SERVER_ONLY_EVENTS.has(event) && !isEmailAutomationAuthorized(request)) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const email = typeof o.email === "string" ? o.email.trim().toLowerCase() : "";
  if (!email.includes("@")) return json({ ok: false, error: "Valid email required" }, 400);

  if (event === "user.registered" || event === "user.newsletter_opt_in") {
    const res = NextResponse.json({ ok: true });
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email || user.email.toLowerCase() !== email) {
      return json({ ok: false, error: "Unauthorized for this email" }, 401);
    }
  }

  if (event === "user.profile_incomplete" && !isEmailAutomationAuthorized(request)) {
    const res = NextResponse.json({ ok: true });
    const supabase = createServerSupabase(request, res);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email || user.email.toLowerCase() !== email) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }
  }

  const payload: UserLifecyclePayload = {
    email,
    customerName: typeof o.customerName === "string" ? o.customerName : undefined,
    cartUrl: typeof o.cartUrl === "string" ? o.cartUrl : undefined,
    productTitle: typeof o.productTitle === "string" ? o.productTitle : undefined,
    discountCode: typeof o.discountCode === "string" ? o.discountCode : undefined,
    artistName: typeof o.artistName === "string" ? o.artistName : undefined,
    collectionName: typeof o.collectionName === "string" ? o.collectionName : undefined,
  };

  await runUserLifecycleAutomation(service, event, payload);
  return json({ ok: true, event });
}
