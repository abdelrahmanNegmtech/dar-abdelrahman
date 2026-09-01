"use client";

import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublicPropertyCard } from "@/features/properties/data/public-property-queries";
import { ExpandIcon, MapPinIcon, RefreshCwIcon, SearchIcon } from "../icons";

type MapPanelProps = {
  focused?: boolean;
  properties: PublicPropertyCard[];
};

type LatLngLiteral = {
  lat: number;
  lng: number;
};

type GoogleMapsApi = {
  ControlPosition: { RIGHT_BOTTOM: number };
  Geocoder: new () => {
    geocode: (
      request: { address: string },
      callback: (
        results: Array<{ formatted_address?: string; geometry: { location: GoogleLatLng } }> | null,
        status: string,
      ) => void,
    ) => void;
  };
  LatLngBounds: new () => { extend: (position: LatLngLiteral) => void };
  Map: new (
    element: HTMLElement,
    options: {
      center: LatLngLiteral;
      clickableIcons?: boolean;
      fullscreenControl?: boolean;
      gestureHandling?: string;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      zoom: number;
      zoomControl?: boolean;
      zoomControlOptions?: { position: number };
    },
  ) => GoogleMap;
  Marker: new (options: { map: GoogleMap; position: LatLngLiteral; title: string }) => unknown;
  places?: {
    Autocomplete: new (
      input: HTMLInputElement,
      options: {
        componentRestrictions?: { country: string };
        fields?: string[];
      },
    ) => {
      addListener: (event: string, callback: () => void) => { remove?: () => void };
      getPlace: () => { formatted_address?: string; geometry?: { location?: GoogleLatLng }; name?: string };
    };
  };
};

type GoogleLatLng = {
  lat: () => number;
  lng: () => number;
};

type GoogleMap = {
  fitBounds: (bounds: unknown, padding?: number) => void;
  panTo: (location: LatLngLiteral | GoogleLatLng) => void;
  setCenter: (center: LatLngLiteral) => void;
  setZoom: (zoom: number) => void;
};

type GoogleMapsWindow = Window &
  typeof globalThis & {
    __darGoogleMapsReady?: () => void;
    google?: { maps?: GoogleMapsApi };
  };

const MAP_CENTER = { lat: 30.0894, lng: 31.6386 };
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_SCRIPT_ID = "dar-google-maps-js";

let googleMapsPromise: Promise<GoogleMapsApi> | null = null;

export function MapPanel({ focused = false, properties }: MapPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const [destination, setDestination] = useState(searchParams.get("destination") ?? "All destinations");
  const [selectedPlace, setSelectedPlace] = useState(searchParams.get("destination") ?? "All destinations");
  const [status, setStatus] = useState<"loading" | "missing-key" | "error" | "ready">(
    GOOGLE_MAPS_KEY ? "loading" : "missing-key",
  );
  const [isSearching, setIsSearching] = useState(false);
  const [message, setMessage] = useState("");

  const updateUrl = useCallback(
    (label: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("destination", label);
      if (focused) params.set("view", "map");
      router.replace(`/search?${params.toString()}`, { scroll: false });
    },
    [focused, router, searchParams],
  );

  useEffect(() => {
    const element = mapContainerRef.current;
    if (!element || !GOOGLE_MAPS_KEY) return;

    let cancelled = false;

    loadGoogleMaps(GOOGLE_MAPS_KEY)
      .then((googleMaps) => {
        if (cancelled) return;

        const map = new googleMaps.Map(element, {
          center: MAP_CENTER,
          clickableIcons: true,
          fullscreenControl: true,
          gestureHandling: "cooperative",
          mapTypeControl: false,
          streetViewControl: false,
          zoom: focused ? 14 : 13,
          zoomControl: true,
          zoomControlOptions: { position: googleMaps.ControlPosition.RIGHT_BOTTOM },
        });
        const bounds = new googleMaps.LatLngBounds();

        properties.forEach((property) => {
          if (property.lat === null || property.lng === null) return;
          const position = { lat: property.lat, lng: property.lng };
          bounds.extend(position);
          new googleMaps.Marker({ map, position, title: property.title });
        });

        map.fitBounds(bounds, 64);
        mapRef.current = map;
        setStatus("ready");

        if (inputRef.current && googleMaps.places) {
          const autocomplete = new googleMaps.places.Autocomplete(inputRef.current, {
            componentRestrictions: { country: "eg" },
            fields: ["formatted_address", "geometry", "name"],
          });
          const listener = autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            const location = place.geometry?.location;

            if (!location) {
              setMessage("Select a place from the suggestions so the map can locate it.");
              return;
            }

            const label = place.name ?? place.formatted_address ?? destination;
            map.panTo(location);
            map.setZoom(14);
            setDestination(label);
            setSelectedPlace(label);
            setMessage("");
            updateUrl(label);
          });

          return () => listener.remove?.();
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [destination, focused, properties, updateUrl]);

  function recenter() {
    mapRef.current?.setCenter(MAP_CENTER);
    mapRef.current?.setZoom(focused ? 14 : 13);
    setDestination("All destinations");
    setSelectedPlace("All destinations");
    setMessage("");
    updateUrl("All destinations");
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = destination.trim();

    if (!value) {
      setMessage("Enter a city, district, hotel, landmark, or address.");
      return;
    }

    const googleMaps = (window as GoogleMapsWindow).google?.maps;
    if (!googleMaps || !mapRef.current) {
      setMessage("Google Maps is still loading.");
      return;
    }

    setIsSearching(true);
    new googleMaps.Geocoder().geocode({ address: `${value}, Egypt` }, (results, geocodeStatus) => {
      setIsSearching(false);
      const result = results?.[0];
      const location = result?.geometry.location;

      if (geocodeStatus !== "OK" || !location) {
        setMessage("No matching place was found. Try a city, district, hotel, or landmark.");
        return;
      }

      mapRef.current?.panTo(location);
      mapRef.current?.setZoom(14);
      const label = result.formatted_address ?? value;
      setDestination(label);
      setSelectedPlace(label);
      setMessage("");
      updateUrl(label);
    });
  }

  return (
    <section
      aria-labelledby="map-title"
      className={`relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] shadow-[0_14px_32px_rgba(15,23,42,0.06)] ${
        focused ? "h-[calc(100dvh-210px)] min-h-[620px]" : "h-[clamp(440px,calc(100dvh-240px),680px)]"
      }`}
    >
      <div className="relative h-full min-h-0 overflow-hidden">
        <div className="absolute left-4 right-4 top-4 z-10 rounded-xl bg-white p-2 shadow-[0_14px_35px_rgba(15,23,42,0.14)] sm:right-auto sm:w-[min(420px,calc(100%-32px))]">
          <form className="flex h-11 items-center gap-2 rounded-lg border border-[#E5E7EB] px-3" onSubmit={search}>
            <SearchIcon className="size-4 text-[#64748B]" />
            <label className="sr-only" htmlFor="map-search">Search map destination</label>
            <input
              className="min-w-0 flex-1 bg-transparent text-[14px] font-semibold text-[#0F172A] outline-none placeholder:text-[#64748B]"
              disabled={status === "missing-key"}
              id="map-search"
              onChange={(event) => setDestination(event.target.value)}
              placeholder="Search city, hotel, landmark..."
              ref={inputRef}
              type="search"
              value={destination}
            />
            <button className="rounded-md px-3 py-1.5 text-[13px] font-bold text-[#5E2FE5] disabled:opacity-50" disabled={status !== "ready" || isSearching} type="submit">
              {isSearching ? "Go..." : "Go"}
            </button>
          </form>
          {message ? <p className="mt-2 rounded-lg bg-[#FEF2F2] px-3 py-2 text-[12px] font-semibold text-[#B91C1C]">{message}</p> : null}
          {status === "ready" && !message ? (
            <p className="mt-2 text-[12px] font-semibold text-[#64748B]">Showing map around {selectedPlace}.</p>
          ) : null}
        </div>

        <div className="h-full w-full" ref={mapContainerRef} />

        {status !== "ready" ? (
          <div className="absolute inset-0 grid place-items-center bg-[#F8FAFC] p-6 text-center">
            <div className="max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
              <MapPinIcon className="mx-auto size-8 text-[#5E2FE5]" />
              <h2 className="mt-4 text-lg font-black" id="map-title">
                {status === "missing-key" ? "Map unavailable" : status === "error" ? "Map could not load" : "Loading map"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                {status === "missing-key"
                  ? "Google Maps is not configured for this environment yet."
                  : status === "error"
                    ? "Google Maps could not be loaded. Check the API key, billing, and allowed origins."
                    : "Preparing the map and Places search."}
              </p>
            </div>
          </div>
        ) : null}

        <div className="absolute bottom-5 right-5 z-10 flex overflow-hidden rounded-lg bg-white shadow-[0_14px_35px_rgba(15,23,42,0.14)]">
          <button aria-label="Recenter map" className="flex size-11 items-center justify-center border-r border-[#E5E7EB]" onClick={recenter} type="button">
            <RefreshCwIcon className="size-5" />
          </button>
          <button
            aria-label={focused ? "Exit full map view" : "Open full map view"}
            className="flex size-11 items-center justify-center"
            onClick={() => router.push(focused ? "/search" : "/search?view=map")}
            type="button"
          >
            <ExpandIcon className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

function loadGoogleMaps(apiKey: string) {
  const browserWindow = window as GoogleMapsWindow;

  if (browserWindow.google?.maps) return Promise.resolve(browserWindow.google.maps);
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise((resolve, reject) => {
    browserWindow.__darGoogleMapsReady = () => {
      if (browserWindow.google?.maps) resolve(browserWindow.google.maps);
      else reject(new Error("Google Maps did not initialize."));
    };

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);
    if (existingScript) return;

    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.onerror = () => reject(new Error("Google Maps script failed to load."));
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly&callback=__darGoogleMapsReady`;
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}
