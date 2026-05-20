import { redirectLocalized } from "@/lib/i18n/server-redirect";

/** Legacy hub URL — profile is the main signed-in destination. */
export default async function AccountPage() {
  await redirectLocalized("/account/profile");
}
