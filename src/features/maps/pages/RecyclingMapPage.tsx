import { useMemo, useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Compass, Filter, Navigation, Recycle, Search, Star } from "lucide-react";
import { fetchRecyclingCenters, wasteCategories } from "@/shared/api/mockApi";
import type { RecyclingCenter, WasteType } from "@/shared/api/types";
import { EmptyState, GlassPanel, PageHeader, Skeleton, TextInput } from "@/shared/components/ui";

const userPosition = { lat: 37.7749, lng: -122.4194 };

function CenterList({ centers, selected, onSelect }: { centers: RecyclingCenter[]; selected: RecyclingCenter | null; onSelect: (center: RecyclingCenter) => void }) {
  if (!centers.length) {
    return <EmptyState title="No centers match your filters" description="Try broadening accepted waste types or clearing the search field." />;
  }

  return (
    <div className="grid gap-3">
      {centers.map((center) => (
        <button
          key={center.id}
          onClick={() => onSelect(center)}
          className={`rounded-[1.5rem] border p-4 text-left transition ${selected?.id === center.id ? "border-emerald-300/60 bg-emerald-300/10" : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white">{center.name}</h3>
              <p className="mt-1 text-sm text-slate-400">{center.address}</p>
            </div>
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-emerald-100">{center.distanceKm} km</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {center.accepted.map((type) => (
              <span key={type} className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs capitalize text-slate-200">{type}</span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className={center.openNow ? "text-emerald-200" : "text-amber-200"}>{center.openNow ? "Open now" : "Closed"}</span>
            <span className="inline-flex items-center gap-1 text-slate-300"><Star className="h-4 w-4 fill-amber-300 text-amber-300" /> {center.rating}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

function FallbackMap({ centers, selected, onSelect }: { centers: RecyclingCenter[]; selected: RecyclingCenter | null; onSelect: (center: RecyclingCenter) => void }) {
  return (
    <div className="relative h-[620px] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(52,211,153,0.24),transparent_22rem),radial-gradient(circle_at_70%_70%,rgba(34,211,238,0.16),transparent_18rem)]" />
      <div className="absolute inset-0 opacity-35" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-cyan-300 text-slate-950 shadow-[0_0_42px_rgba(34,211,238,0.45)]">
        <Compass className="h-7 w-7" />
      </div>
      {centers.map((center, index) => {
        const coords = [
          [28, 30],
          [64, 26],
          [42, 68],
          [76, 58],
        ][index % 4];
        return (
          <motion.button
            key={center.id}
            onClick={() => onSelect(center)}
            className={`absolute grid h-14 w-14 place-items-center rounded-full border text-slate-950 ${selected?.id === center.id ? "border-white bg-emerald-200" : "border-emerald-200/70 bg-emerald-300"}`}
            style={{ left: `${coords[0]}%`, top: `${coords[1]}%` }}
            animate={{ y: [0, -12, 0], boxShadow: ["0 0 0 rgba(52,211,153,0.1)", "0 0 36px rgba(52,211,153,0.45)", "0 0 0 rgba(52,211,153,0.1)"] }}
            transition={{ duration: 3 + index, repeat: Infinity }}
            aria-label={`Select ${center.name}`}
          >
            <Recycle className="h-6 w-6" />
          </motion.button>
        );
      })}
      {selected ? (
        <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-5 backdrop-blur-2xl">
          <p className="font-semibold text-white">{selected.name}</p>
          <p className="mt-1 text-sm text-slate-400">{selected.address}</p>
          <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200" href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer">
            Start route navigation <Navigation className="h-4 w-4" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

function LiveGoogleMap({ centers, selected, apiKey, onSelect }: { centers: RecyclingCenter[]; selected: RecyclingCenter | null; apiKey: string; onSelect: (center: RecyclingCenter | null) => void }) {
  const { isLoaded, loadError } = useJsApiLoader({ googleMapsApiKey: apiKey, id: "ecovision-google-map" });

  if (!isLoaded || loadError) {
    return <FallbackMap centers={centers} selected={selected} onSelect={(center) => onSelect(center)} />;
  }

  return (
    <div className="overflow-hidden rounded-[2rem]">
      <GoogleMap mapContainerStyle={{ width: "100%", height: "620px" }} center={userPosition} zoom={13} options={{ disableDefaultUI: true, styles: [{ elementType: "geometry", stylers: [{ color: "#07111f" }] }, { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] }, { featureType: "water", stylers: [{ color: "#0f2f3a" }] }] }}>
        <MarkerF position={userPosition} title="Your location" />
        {centers.map((center) => (
          <MarkerF key={center.id} position={{ lat: center.lat, lng: center.lng }} title={center.name} onClick={() => onSelect(center)} />
        ))}
        {selected ? (
          <InfoWindowF position={{ lat: selected.lat, lng: selected.lng }} onCloseClick={() => onSelect(null)}>
            <div className="max-w-xs text-slate-900">
              <strong>{selected.name}</strong>
              <p>{selected.address}</p>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`} target="_blank" rel="noreferrer">Open route</a>
            </div>
          </InfoWindowF>
        ) : null}
      </GoogleMap>
    </div>
  );
}

export default function RecyclingMapPage() {
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<WasteType[]>([]);
  const [selected, setSelected] = useState<RecyclingCenter | null>(null);
  const centersQuery = useQuery({ queryKey: ["recycling-centers"], queryFn: fetchRecyclingCenters });
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  const centers = centersQuery.data ?? [];
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase();
    return centers.filter((center) => {
      const matchesSearch = center.name.toLowerCase().includes(normalized) || center.address.toLowerCase().includes(normalized);
      const matchesTypes = activeTypes.length === 0 || activeTypes.some((type) => center.accepted.includes(type));
      return matchesSearch && matchesTypes;
    });
  }, [activeTypes, centers, query]);

  const toggleType = (type: WasteType) => {
    setActiveTypes((current) => (current.includes(type) ? current.filter((item) => item !== type) : [...current, type]));
  };

  return (
    <div className="relative min-h-screen">
      <PageHeader
        label="Recycling network"
        title="Route every material to the right recovery partner."
        description="Animated center markers, accepted waste filters, route navigation, nearby recommendations, and Google Maps integration with a no-key fallback."
      />

      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-20 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-6">
          <GlassPanel className="p-5">
            <label className="text-sm font-medium text-slate-200" htmlFor="center-search">Search recycling centers</label>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
              <TextInput id="center-search" className="pl-11" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or address" />
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-white"><Filter className="h-4 w-4 text-emerald-200" /> Accepted waste types</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {wasteCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => toggleType(category.id)}
                  className={`rounded-full border px-4 py-2 text-sm capitalize transition ${activeTypes.includes(category.id) ? "border-emerald-300 bg-emerald-300 text-slate-950" : "border-white/10 bg-white/8 text-slate-300 hover:bg-white/12"}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </GlassPanel>
          <GlassPanel className="p-5">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Nearby recommendations</h2>
              <span className="text-sm text-slate-400">{filtered.length} found</span>
            </div>
            {centersQuery.isLoading ? <Skeleton className="h-72" /> : <CenterList centers={filtered} selected={selected} onSelect={setSelected} />}
          </GlassPanel>
        </div>

        <GlassPanel className="p-3">
          {apiKey ? <LiveGoogleMap centers={filtered} selected={selected} apiKey={apiKey} onSelect={setSelected} /> : <FallbackMap centers={filtered} selected={selected} onSelect={setSelected} />}
          {!apiKey ? <p className="px-3 py-4 text-sm text-slate-400">Set VITE_GOOGLE_MAPS_API_KEY to switch this simulated map to live Google Maps.</p> : null}
        </GlassPanel>
      </section>
    </div>
  );
}