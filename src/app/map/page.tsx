import { PropertyMapClient } from "@/components/map/PropertyMapClient";

export default function MapPage() {
  return (
    <div className="fixed inset-0 top-[57px] z-30">
      <PropertyMapClient />
    </div>
  );
}
