import { roomCoverage } from "../data";

export function RoomCoverageCard() {
  return (
    <section className="border-b border-[#E5E7EB] py-7">
      <h3 className="text-[16px] font-bold text-[#0B1020]">Room coverage</h3>
      <div className="mt-5 space-y-4">
        {roomCoverage.map((room) => (
          <div key={room.label}>
            <div className="mb-2 flex items-center justify-between gap-4 text-[12px]">
              <span className="font-bold text-[#0B1020]">{room.label}</span>
              <span className="text-[#64748B]">{room.count}</span>
            </div>
            <div className="h-[3px] overflow-hidden rounded-full bg-[#E5E7EB]">
              <span className={`block h-full rounded-full bg-[#5E2FE5] ${room.width}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
