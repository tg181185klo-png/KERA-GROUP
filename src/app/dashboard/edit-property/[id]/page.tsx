import { redirect, notFound } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import {
  AddPropertyWizard,
  rowToFormData,
} from "@/components/dashboard/AddPropertyWizard";
import { isPubliclyVisibleListing } from "@/lib/listing-status";
import { type PropertyRow } from "@/lib/property-normalize";

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

  const service = createServiceClient();
  const { data: listing } = await service
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!listing) notFound();

  const row = listing as PropertyRow;
  const isOwner =
    row.user_id === user.id ||
    row.owner_email === user.email;

  if (!isOwner) notFound();

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
        initialForm={rowToFormData(row)}
        wasActive={wasActive}
      />
    </div>
  );
}
