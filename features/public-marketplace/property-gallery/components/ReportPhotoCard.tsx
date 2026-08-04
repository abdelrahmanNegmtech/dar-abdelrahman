import { Button, CameraIcon, FlagIcon } from "@/components/ui";

export function ReportPhotoCard({ onReport }: { onReport: () => void }) {
  return (
    <section className="pt-7">
      <h3 className="text-[16px] font-bold text-[#0B1020]">Report photo issue</h3>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button className="h-10 rounded-lg px-3 text-[12px] font-bold text-[#5E2FE5]" onClick={onReport} variant="outline">
          <FlagIcon className="size-4" />
          Report mismatch
        </Button>
        <Button className="h-10 rounded-lg px-3 text-[12px] font-bold text-[#5E2FE5]" onClick={onReport} variant="outline">
          <CameraIcon className="size-4" />
          Report low quality
        </Button>
      </div>
    </section>
  );
}
