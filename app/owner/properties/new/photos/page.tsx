"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/host-landing/icons";
import { DarLogo } from "@/components/brand/dar-logo";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ownerRoutes } from "@/lib/owner-routes";

type Photo = {
  src: string;
  name: string;
  size: string;
  position?: string;
};

const storageKey = "dar-owner-property-photos";

const defaultPhotos: Photo[] = [
  { src: "/add-property-thumb-living.png", name: "living-room.jpg", size: "2.4 MB", position: "object-[50%_58%]" },
  { src: "/add-property-thumb-kitchen.png", name: "kitchen.jpg", size: "1.8 MB", position: "object-[50%_52%]" },
  { src: "/add-property-thumb-bedroom.png", name: "bedroom.jpg", size: "2.1 MB", position: "object-[50%_50%]" },
  { src: "/add-property-thumb-bathroom.png", name: "bathroom.jpg", size: "1.6 MB", position: "object-[50%_50%]" },
  { src: "/add-property-thumb-balcony.png", name: "balcony.jpg", size: "2.3 MB", position: "object-[50%_48%]" },
  { src: "/add-property-thumb-building.png", name: "exterior.jpg", size: "2.7 MB", position: "object-[50%_52%]" },
  { src: "/photo-card-dining-reference.png", name: "dining-area.jpg", size: "1.9 MB", position: "object-center" },
];

const defaultPhotoNames = new Set(defaultPhotos.map((photo) => photo.name));

const navItems = [
  ["Dashboard", "home"],
  ["Properties", "property"],
  ["Bookings", "calendar"],
  ["Calendar", "calendar"],
  ["Messages", "message"],
  ["Reviews", "message"],
  ["Analytics", "analytics"],
  ["Payouts", "wallet"],
  ["Settings", "settings"],
] as const;

const tips = [
  ["photo", "Use high-quality images", "Clear, bright photos get more bookings."],
  ["gallery", "Show all important areas", "Include living room, bedroom, kitchen, bathroom and exterior."],
  ["bulb", "Good lighting is key", "Natural light makes your photos look their best."],
] as const;

export default function PhotoUploaderPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>(() => {
    if (typeof window === "undefined") return defaultPhotos;
    try {
      const saved = window.localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : defaultPhotos;
    } catch {
      return defaultPhotos;
    }
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!window.localStorage.getItem(storageKey)) {
      window.localStorage.setItem(storageKey, JSON.stringify(defaultPhotos));
    }
  }, []);

  const progress = useMemo(() => Math.min(photos.length / 20, 1) * 100, [photos.length]);

  function persist(nextPhotos = photos) {
    window.localStorage.setItem(storageKey, JSON.stringify(nextPhotos));
  }

  function saveAndContinue(draft = false) {
    persist();
    window.localStorage.setItem("dar-owner-property-status:1", draft ? "draft" : "editing");
    router.push(ownerRoutes.propertyEdit("1", "photos"));
  }

  function removePhoto(index: number) {
    if (!window.confirm("Delete this photo?")) return;
    const next = photos.filter((_, photoIndex) => photoIndex !== index);
    setPhotos(next);
    persist(next);
  }

  function reorderPhoto(toIndex: number) {
    if (dragIndex === null || dragIndex === toIndex) return;
    const next = [...photos];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(toIndex, 0, moved);
    setPhotos(next);
    persist(next);
    setDragIndex(null);
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 20 - photos.length);
    if (!files.length) return;

    Promise.all(
      files.map(
        (file) =>
          new Promise<Photo>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ src: String(reader.result), name: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` });
            reader.readAsDataURL(file);
          }),
      ),
    ).then((incoming) => {
      const next = [...photos, ...incoming].slice(0, 20);
      setPhotos(next);
      persist(next);
    });

    event.target.value = "";
  }

  return (
    <main className="min-h-screen bg-[#fbfcff] text-[#111936]">
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="owner-input-text hidden" onChange={handleFiles} />
      <div className="owner-dashboard-frame overflow-hidden">
        <DesktopSidebar />
        <section className="owner-dashboard-main">
          <DesktopTopBar />
          <MobileTopBar />
          <div className="owner-dashboard-content min-h-[calc(100vh-86px)]">
            <div className="min-w-0">
              <Header progress={progress} count={photos.length} />
              <div className="mt-7 grid grid-cols-[minmax(0,1fr)_348px] gap-6 max-[1120px]:grid-cols-1">
                <UploadBox onChoose={() => inputRef.current?.click()} />
                <TipsCard variant="desktop" />
              </div>
              <TipsCard variant="mobile" />
              <PhotoGrid photos={photos} onRemove={removePhoto} onAdd={() => inputRef.current?.click()} onDragStart={setDragIndex} onDrop={reorderPhoto} />
              <DesktopActions onSave={() => saveAndContinue(false)} onDraft={() => saveAndContinue(true)} />
            </div>
            <MobileActions onSave={() => saveAndContinue(false)} onDraft={() => saveAndContinue(true)} />
          </div>
        </section>
      </div>
    </main>
  );
}

function DesktopSidebar() {
  return (
    <aside className="flex w-[250px] shrink-0 flex-col border-r border-[#eef1f8] bg-white px-5 py-6 max-[760px]:hidden">
      <Link href="/dashboard" className="owner-button-text flex h-[50px] items-start">
        <DarLogo surface="light" alt="DAR" width={126} height={45} className="h-auto w-[126px] object-contain" priority />
      </Link>
      <nav className="mt-[48px] space-y-[9px]">
        {navItems.map(([item, icon]) => (
          <Link
            href={item === "Dashboard" ? ownerRoutes.dashboard : item === "Bookings" ? ownerRoutes.bookings : item === "Properties" ? ownerRoutes.properties : item === "Calendar" ? ownerRoutes.calendar("1") : item === "Messages" ? ownerRoutes.messages : item === "Reviews" ? ownerRoutes.reviews : item === "Payouts" ? ownerRoutes.payouts : item === "Settings" ? ownerRoutes.settings : ownerRoutes.dashboard}
            key={item}
            className={`owner-button-text flex h-12 items-center gap-[13px] rounded-lg px-4 ${item === "Properties" ? "bg-[#f4efff] text-[#6c3bff]" : "text-[#6f7896] hover:bg-[#f8f7ff]"}`}
          >
            <SidebarIcon name={icon} className="size-5 shrink-0" />
            {item}
          </Link>
        ))}
      </nav>
      <div className="mt-auto space-y-4">
        <button className="owner-button-text flex h-[58px] w-full items-center gap-3 rounded-lg border border-[#e5e9f2] px-4 text-left">
          <ProfileAvatar src="/owner-selfie-ahmed-reference.png" name="Ahmed Hassan" size={34}/>
          <span className="owner-body min-w-0 flex-1">
            <span className="owner-body block">Ahmed Hassan</span>
            <span className="owner-body block">Host</span>
          </span>
          <Icon name="chevron" className="size-4" />
        </button>
        <Link href={ownerRoutes.help} className="owner-button-text flex h-[48px] items-center gap-3 rounded-lg border border-[#e5e9f2] px-4">
          <span className="owner-body grid size-5 place-items-center rounded-full border border-[#8790aa]">?</span>
          Help Center
        </Link>
      </div>
    </aside>
  );
}

function SidebarIcon({ name, className = "" }: { name: (typeof navItems)[number][1]; className?: string }) {
  const common = "currentColor";

  return (
    <svg aria-hidden="true" className={className} fill="none" stroke={common} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      {name === "home" ? (
        <>
          <path d="M4 11.2 12 4l8 7.2" />
          <path d="M6.5 10.5V20h11v-9.5" />
          <path d="M10 20v-5h4v5" />
        </>
      ) : null}
      {name === "property" ? (
        <>
          <path d="M4.5 11.2 12 4.5l7.5 6.7" />
          <path d="M6.5 10.7V20h11v-9.3" />
          <path d="M9.5 20v-5.5h5V20" />
          <path d="M9 9.5h2.2" />
        </>
      ) : null}
      {name === "calendar" ? (
        <>
          <rect width="15" height="15" x="4.5" y="5.5" rx="2" />
          <path d="M8 3.8v4" />
          <path d="M16 3.8v4" />
          <path d="M4.5 10h15" />
        </>
      ) : null}
      {name === "message" ? (
        <>
          <path d="M5 6.5h14v9.2a2 2 0 0 1-2 2H9l-4 3v-12a2 2 0 0 1 2-2Z" />
        </>
      ) : null}
      {name === "analytics" ? (
        <>
          <path d="M5 19V13" />
          <path d="M10 19V8" />
          <path d="M15 19v-4" />
          <path d="M20 19V5" />
          <path d="M4 19h17" />
          <path d="m6 12 4-4 5 5 4-8" />
        </>
      ) : null}
      {name === "wallet" ? (
        <>
          <path d="M4.5 7.5h14.2a1.8 1.8 0 0 1 1.8 1.8v8.4a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 17.7V8.2c0-1.5 1-2.5 2.5-2.5H17" />
          <path d="M16.5 12h4v4h-4a2 2 0 0 1 0-4Z" />
          <path d="M8 9h3" />
        </>
      ) : null}
      {name === "settings" ? (
        <>
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.05.05a2.15 2.15 0 0 1-3.04 3.04l-.05-.05a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.65V21.5a2.15 2.15 0 0 1-4.3 0v-.07a1.8 1.8 0 0 0-1.1-1.65 1.8 1.8 0 0 0-2 .36l-.05.05a2.15 2.15 0 0 1-3.04-3.04l.05-.05a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.1H2.5a2.15 2.15 0 0 1 0-4.3h.07a1.8 1.8 0 0 0 1.65-1.1 1.8 1.8 0 0 0-.36-2l-.05-.05a2.15 2.15 0 0 1 3.04-3.04l.05.05a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.1-1.65V2.5a2.15 2.15 0 0 1 4.3 0v.07a1.8 1.8 0 0 0 1.1 1.65 1.8 1.8 0 0 0 2-.36l.05-.05a2.15 2.15 0 0 1 3.04 3.04l-.05.05a1.8 1.8 0 0 0-.36 2 1.8 1.8 0 0 0 1.65 1.1h.07a2.15 2.15 0 0 1 0 4.3h-.07A1.8 1.8 0 0 0 19.4 15Z" />
        </>
      ) : null}
    </svg>
  );
}

function DesktopTopBar() {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-[#eef1f8] px-7 max-[760px]:hidden">
      <div className="owner-body flex items-center gap-4 text-[#697391]">
        <span>Properties</span><Icon name="chevron" className="size-4 -rotate-90" />
        <span>Edit Property</span><Icon name="chevron" className="size-4 -rotate-90" />
        <span className="owner-body">Photos</span>
      </div>
      <div className="flex items-center gap-4">
        <Link href={ownerRoutes.propertyPublish("1")} className="owner-button-text flex h-10 items-center gap-2 rounded-lg border border-[#e3e8f2] px-4"><Icon name="message" className="size-4" />Preview listing <Icon name="arrow-right" className="size-4 -rotate-45" /></Link>
        <button className="owner-button-text grid size-10 place-items-center rounded-lg border border-[#e3e8f2]"><span className="owner-body">...</span></button>
        <button className="owner-button-text flex h-10 items-center gap-3">
          <ProfileAvatar src="/owner-selfie-ahmed-reference.png" name="Ahmed Hassan" size={34}/>
          Ahmed Hassan <Icon name="chevron" className="size-4" />
        </button>
      </div>
    </header>
  );
}

function MobileTopBar() {
  return (
    <header className="hidden h-[70px] items-center justify-between px-5 max-[760px]:flex">
      <Icon name="menu" className="size-6 text-[#26314d]" />
      <DarLogo surface="light" alt="DAR" width={82} height={30} className="h-auto w-[82px] object-contain" priority />
      <Icon name="bell" className="size-5 text-[#26314d]" />
    </header>
  );
}

function Header({ progress, count }: { progress: number; count: number }) {
  return (
    <section>
      <div className="owner-body hidden text-[#697391] max-[760px]:flex">
        <span>Edit Property</span><Icon name="chevron" className="mx-3 size-4 -rotate-90" /><span className="owner-body">Photos</span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-4 max-[760px]:mt-3">
        <div>
          <h1 className="owner-page-title tracking-[-0.02em]">Photo Uploader</h1>
          <p className="owner-page-description mt-2 max-[760px]:hidden">Add high-quality photos to showcase your property and attract more guests.</p>
        </div>
        <p className="owner-body shrink-0">{count}/20 photos</p>
      </div>
      <div className="mt-3 h-1.5 rounded-full bg-[#edf0f6]">
        <div className="h-full rounded-full bg-[#5b2be0]" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}

function UploadBox({ onChoose }: { onChoose: () => void }) {
  return (
    <button onClick={onChoose} className="owner-button-text flex h-[306px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#cbb8ff] bg-[#fbf9ff] text-center max-[760px]:h-[208px]">
      <span className="owner-badge grid size-[66px] place-items-center rounded-full bg-[#eee8ff] max-[760px]:size-[52px]"><Icon name="cloud-upload" className="size-9 max-[760px]:size-7" /></span>
      <span className="owner-body mt-7 block max-[760px]:mt-5">Drag and drop photos here</span>
      <span className="owner-body mt-2 block">or</span>
      <span className="owner-badge mt-4 grid h-[48px] min-w-[166px] place-items-center rounded-lg bg-[#5b2be0] px-8 text-white shadow-[0_12px_24px_rgba(91,43,224,0.22)] max-[760px]:h-10 max-[760px]:min-w-[136px]">Choose photos</span>
      <span className="owner-body mt-6 block max-[760px]:mt-4">JPG, PNG or WEBP. Max size 10MB per photo.</span>
    </button>
  );
}

function TipsCard({ variant }: { variant: "desktop" | "mobile" }) {
  return (
    <section className={`${variant === "desktop" ? "flex h-[306px] flex-col max-[1120px]:hidden" : "mt-4 hidden max-[1120px]:block"} rounded-lg border border-[#edf0f6] bg-white p-6 shadow-[0_12px_30px_rgba(22,31,61,0.045)] max-[760px]:p-4`}>
      <div className="flex items-center justify-between">
        <h2 className="owner-section-title">Photo tips</h2>
        {variant === "mobile" ? <Link href="#" className="owner-body">View all tips</Link> : null}
      </div>
      <div className="mt-5 space-y-5 max-[760px]:space-y-5">
        {tips.map(([icon, title, text]) => (
          <div className="flex gap-4" key={title}>
            <span className="owner-badge grid size-8 shrink-0 place-items-center rounded-full bg-[#f2edff] max-[760px]:size-8"><TipIcon name={icon} /></span>
            <div>
              <p className="owner-body">{title}</p>
              <p className="owner-body mt-1">{text}</p>
            </div>
          </div>
        ))}
      </div>
      {variant === "desktop" ? <Link href="#" className="owner-body mt-auto flex items-center gap-2">Learn more about photography tips <Icon name="chevron" className="size-4 -rotate-90" /></Link> : <div className="mt-5 flex justify-center gap-1.5"><span className="owner-badge size-1.5 rounded-full bg-[#5b2be0]" /><span className="owner-badge size-1.5 rounded-full bg-[#d7dce8]" /><span className="owner-badge size-1.5 rounded-full bg-[#d7dce8]" /></div>}
    </section>
  );
}

function TipIcon({ name }: { name: (typeof tips)[number][0] }) {
  if (name === "bulb") {
    return (
      <svg aria-hidden="true" className="size-[17px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 2Z" />
        <path d="M12 6v3" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="size-[17px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <rect width="14" height="14" x="5" y="5" rx="2" />
      <path d="m8 16 3-3 2 2 2-3 2 4" />
      {name === "photo" ? <circle cx="9" cy="9" r="1" /> : <path d="M8 9h3" />}
    </svg>
  );
}

function PhotoGrid({ photos, onRemove, onAdd, onDragStart, onDrop }: { photos: Photo[]; onRemove: (index: number) => void; onAdd: () => void; onDragStart: (index: number) => void; onDrop: (index: number) => void }) {
  const displayPhotos = photos.length === defaultPhotos.length && photos.every((photo) => defaultPhotoNames.has(photo.name)) ? defaultPhotos : photos;

  return (
    <section className="mt-6 rounded-lg border border-[#edf0f6] bg-white p-5 shadow-[0_12px_30px_rgba(22,31,61,0.045)] max-[760px]:border-0 max-[760px]:p-0 max-[760px]:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="owner-section-title">Your photos ({displayPhotos.length})</h2>
          <p className="owner-body mt-1 max-[760px]:hidden">Drag photos to reorder them. The first photo will be your cover photo.</p>
        </div>
        <label className="owner-label flex items-center gap-3">
          Sort by:
          <span className="owner-badge flex h-9 items-center gap-2 rounded-lg border border-[#e5e9f2] px-4 max-[760px]:h-8 max-[760px]:px-3">Custom order <Icon name="chevron" className="size-4" /></span>
        </label>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-5 max-[900px]:grid-cols-3 max-[760px]:grid-cols-4 max-[760px]:gap-2">
        {displayPhotos.map((photo, index) => (
          <article draggable onDragStart={() => onDragStart(index)} onDragOver={(event) => event.preventDefault()} onDrop={() => onDrop(index)} className="cursor-grab overflow-hidden rounded-lg border border-[#e7ebf3] bg-white shadow-[0_8px_18px_rgba(22,31,61,0.035)] max-[760px]:rounded-md max-[760px]:border-0 max-[760px]:shadow-none" key={`${photo.name}-${index}`}>
            <div className="relative aspect-[1.56/1] overflow-hidden rounded-t-lg max-[760px]:aspect-square max-[760px]:rounded-md">
              <Image src={photo.src} alt="" fill sizes="(max-width: 760px) 80px, 260px" className={`object-cover ${photo.position ?? "object-center"}`}  quality={90}/>
              <span className="owner-badge absolute left-2 top-2 grid size-6 place-items-center rounded bg-white shadow-sm max-[760px]:left-1 max-[760px]:top-1 max-[760px]:size-5">{index + 1}</span>
              {index === 0 ? <span className="owner-badge absolute left-10 top-2 rounded-md bg-[#5b2be0] px-3 py-1 text-white max-[760px]:left-7 max-[760px]:top-1 max-[760px]:px-2 max-[760px]:py-0.5">Cover</span> : null}
              <span className="owner-body absolute left-3 top-9 text-white/85 max-[760px]:hidden"><Icon name="grip" className="size-5" /></span>
              <button onClick={() => onRemove(index)} className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white text-[#52607a] shadow-sm max-[760px]:right-1 max-[760px]:top-1 max-[760px]:size-5"><Icon name="x" className="size-4 max-[760px]:size-3" /></button>
            </div>
            <div className="flex items-center justify-between p-3 max-[760px]:hidden">
              <div className="min-w-0">
                <p className="owner-body truncate">{photo.name}</p>
                <p className="owner-body mt-1">{photo.size}</p>
              </div>
              <button className="owner-button-text grid size-8 place-items-center rounded-md border border-[#e5e9f2]"><span className="owner-body">...</span></button>
            </div>
          </article>
        ))}
        <button onClick={onAdd} className="owner-button-text grid min-h-[190px] place-items-center rounded-lg border-2 border-dashed border-[#cbb8ff] bg-[#fbf9ff] text-center max-[760px]:min-h-0 max-[760px]:aspect-square max-[760px]:rounded-md">
          <span><Icon name="plus" className="mx-auto size-8 max-[760px]:size-6" /><span className="owner-body mt-4 block max-[760px]:hidden">Add more photos</span><span className="owner-body mt-1 block max-[760px]:hidden">Up to 20 photos</span></span>
        </button>
      </div>
    </section>
  );
}

function DesktopActions({ onSave, onDraft }: { onSave: () => void; onDraft: () => void }) {
  return (
    <div className="mt-6 flex items-center justify-between max-[760px]:hidden">
      <Link href={ownerRoutes.propertyEdit("1", "photos")} className="owner-button-text flex h-11 items-center gap-3 rounded-lg border border-[#cbb8ff] px-6"><Icon name="arrow-right" className="size-4 rotate-180" />Back</Link>
      <div className="flex items-center gap-4">
        <button onClick={onDraft} className="owner-button-text h-11 rounded-lg border border-[#cbb8ff] px-9">Save as Draft</button>
        <button onClick={onSave} className="owner-button-text h-11 rounded-lg bg-[#5b2be0] px-12 text-white shadow-[0_12px_24px_rgba(91,43,224,0.24)]">Save Changes</button>
      </div>
    </div>
  );
}

function MobileActions({ onSave, onDraft }: { onSave: () => void; onDraft: () => void }) {
  return (
    <div className="hidden max-[760px]:block">
      <div className="mt-4 space-y-3">
        <button onClick={onDraft} className="owner-button-text h-11 w-full rounded-lg border border-[#cbb8ff]">Save as Draft</button>
        <button onClick={onSave} className="owner-button-text h-11 w-full rounded-lg bg-[#5b2be0] text-white shadow-[0_12px_24px_rgba(91,43,224,0.24)]">Save Changes</button>
      </div>
    </div>
  );
}
