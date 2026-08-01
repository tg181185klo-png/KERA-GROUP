import { AddPropertyWizard } from "@/components/dashboard/AddPropertyWizard";

export default function AddPropertyPage() {
  return (
    <div className="kera-container max-w-3xl py-10 sm:py-12 lg:py-14">
      <h1 className="kera-page-header mb-2">ქონების დამატება</h1>
      <p className="mb-8 text-sm leading-relaxed text-slate-500 sm:text-base">
        შეავსეთ ყველა ველი და მიუთითეთ მდებარეობა რუკაზე
      </p>
      <AddPropertyWizard />
    </div>
  );
}
