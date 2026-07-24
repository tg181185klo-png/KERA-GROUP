import { PropertyMapClient } from "@/components/map/PropertyMapClient";

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-57px)] min-h-[480px]">
      <PropertyMapClient
        emptyMessage="დამტკიცებული განცხადებები ჯერ არ არის. შედით ადმინ პანელში და დააჭირეთ «რუკაზე გამოჩენა»."
      />
    </div>
  );
}
