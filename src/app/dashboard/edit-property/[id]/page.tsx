import { redirect, notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { AddPropertyWizard } from "@/components/dashboard/AddPropertyWizard";
import { rowToFormData } from "@/lib/listing-form";
import { isPubliclyVisibleListing } from "@/lib/listing-status";
import {
  sanitizePropertyRowForClient,
  type PropertyRow,
} from "@/lib/property-normalize";
import { isListingOwnedByUser } from "@/lib/user-listings";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let profile = null;
  let listing: PropertyRow | null = null;

  try {
    profile = await getProfile(user.id);
    const service = createServiceClient();
    const { data, error } = await service
      .from("properties")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("Edit property fetch failed:", error.message);
      notFound();
    }

    listing = data as PropertyRow | null;
  } catch (error) {
    console.error("Edit property fetch failed:", error);
    notFound();
  }

  if (!listing) notFound();

  const row = sanitizePropertyRowForClient(listing);
  if (!isListingOwnedByUser(row, user, profile)) notFound();

  let initialForm;
  try {
    initialForm = rowToFormData(row);
  } catch (error) {
    console.error("Edit property form mapping failed:", error);
    redirect("/dashboard");
  }

  const wasActive = isPubliclyVisibleListing(row.status);

  return (
    <div className="kera-container max-w-3xl py-10 sm:py-12 lg:py-14">
      <h1 className="kera-page-header mb-2">განცხადების რედაქტირება</h1>
      <p className="mb-8 text-sm leading-relaxed text-slate-500 sm:text-base">
        შეცვალეთ ველები და შეინახეთ — განახლებული განცხადება მოდერაციაში გადავა
      </p>
      <AddPropertyWizard
        mode="edit"
        listingId={id}
        initialForm={initialForm}
        wasActive={wasActive}
      />
    </div>
  );
}
