import { PropertyMapClient } from "@/components/map/PropertyMapClient";

export default function MapPage() {
  return (
    <div className="kera-map-viewport">
      <PropertyMapClient
        emptyMessage="დამტკიცებული განცხადებები ჯერ არ არის. შედით ადმინ პანელში და დააჭირეთ «რუკაზე გამოჩენა»."
        alwaysShowMap
      />
    </div>
  );
}
