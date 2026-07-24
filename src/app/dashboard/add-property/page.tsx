import { AddPropertyWizard } from "@/components/dashboard/AddPropertyWizard";

export default function AddPropertyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        ქონების დამატება
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        შეავსეთ ყველა ველი და მიუთითეთ მდებარეობა რუკაზე
      </p>
      <AddPropertyWizard />
    </div>
  );
}
