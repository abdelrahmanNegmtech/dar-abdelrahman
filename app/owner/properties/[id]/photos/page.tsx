import { notFound } from "next/navigation";
import {
  OwnerDeferredNotice,
  OwnerInfoGrid,
  OwnerPropertyPageShell,
  OwnerPropertySummaryCard,
  OwnerPropertyTabs,
} from "@/features/properties/components/owner-property-dashboard";
import {
  createOwnerPhotoMetadata,
  deleteOwnerPhotoMetadata,
  updateOwnerPhotoMetadata,
} from "@/features/properties/data/owner-property-actions";
import { getOwnerPropertyPhotos, getOwnerPropertySummary } from "@/features/properties/data/owner-property-queries";

function readCheckbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readNumber(formData: FormData, key: string) {
  return Number(formData.get(key) ?? 0);
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [summary, photos] = await Promise.all([
    getOwnerPropertySummary(id),
    getOwnerPropertyPhotos(id),
  ]);

  if (!summary) {
    notFound();
  }

  async function createAction(formData: FormData) {
    "use server";

    await createOwnerPhotoMetadata({
      caption: String(formData.get("caption") ?? ""),
      category: String(formData.get("category") ?? "other") as
        | "cover"
        | "living_room"
        | "bedroom"
        | "bathroom"
        | "kitchen"
        | "balcony"
        | "exterior"
        | "amenity"
        | "other",
      isCover: readCheckbox(formData, "isCover"),
      propertyId: id,
      sortOrder: readNumber(formData, "sortOrder"),
      storagePath: String(formData.get("storagePath") ?? ""),
    });
  }

  return (
    <OwnerPropertyPageShell
      description="Manage owner photo metadata for this property. Binary uploads remain deferred, but metadata reads and writes are connected to the real property_photos table."
      title="Photo metadata"
    >
      <OwnerPropertyTabs propertyId={id} />
      <OwnerPropertySummaryCard summary={summary} />
      <OwnerDeferredNotice title="Binary uploads still deferred">
        The approved private-bucket metadata flow is connected here, but actual image uploads are still deferred in this phase. Use the final storage path from a completed upload boundary when creating metadata.
      </OwnerDeferredNotice>
      <section className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
        <h2 className="owner-section-title">Add photo metadata</h2>
        <form action={createAction} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="owner-label">Storage path<input name="storagePath" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" placeholder={`${summary.id ? "owner-id" : ""}/${id}/photo-id.jpg`} /></label>
          <label className="owner-label">Caption<input name="caption" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label">Category
            <select name="category" defaultValue="other" className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
              {["cover", "living_room", "bedroom", "bathroom", "kitchen", "balcony", "exterior", "amenity", "other"].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="owner-label">Sort order<input name="sortOrder" defaultValue={photos.length} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
          <label className="owner-label flex items-center gap-3 pt-8">
            <input type="checkbox" name="isCover" />
            Set as cover
          </label>
          <div className="flex items-end">
            <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Create metadata</button>
          </div>
        </form>
      </section>
      <div className="space-y-4">
        {photos.map((photo) => {
          async function updateAction(formData: FormData) {
            "use server";

            await updateOwnerPhotoMetadata({
              caption: String(formData.get("caption") ?? ""),
              category: String(formData.get("category") ?? "other") as
                | "cover"
                | "living_room"
                | "bedroom"
                | "bathroom"
                | "kitchen"
                | "balcony"
                | "exterior"
                | "amenity"
                | "other",
              isCover: readCheckbox(formData, "isCover"),
              photoId: photo.id,
              propertyId: id,
              sortOrder: readNumber(formData, "sortOrder"),
              storagePath: String(formData.get("storagePath") ?? ""),
            });
          }

          async function deleteAction() {
            "use server";

            await deleteOwnerPhotoMetadata({ photoId: photo.id, propertyId: id });
          }

          return (
            <section key={photo.id} className="rounded-xl border border-[#e6ebf2] bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="owner-section-title">Photo {photo.sortOrder}</h2>
                <span className={`owner-badge rounded-full px-3 py-1 ${photo.isCover ? "bg-[#eaf8ed] text-[#156b37]" : "bg-[#eef2f7] text-[#405166]"}`}>
                  {photo.isCover ? "Cover" : "Gallery"}
                </span>
              </div>
              <OwnerInfoGrid
                items={[
                  { label: "Storage path", value: photo.storagePath },
                  { label: "Category", value: photo.category },
                  { label: "Caption", value: photo.caption ?? "No caption" },
                  { label: "Created at", value: photo.createdAt },
                ]}
              />
              <form action={updateAction} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <label className="owner-label">Storage path<input name="storagePath" defaultValue={photo.storagePath} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Caption<input name="caption" defaultValue={photo.caption ?? ""} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label">Category
                  <select name="category" defaultValue={photo.category} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3">
                    {["cover", "living_room", "bedroom", "bathroom", "kitchen", "balcony", "exterior", "amenity", "other"].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="owner-label">Sort order<input name="sortOrder" defaultValue={photo.sortOrder} className="owner-input-text mt-2 h-10 w-full rounded-lg border border-[#d9e0ea] px-3" /></label>
                <label className="owner-label flex items-center gap-3 pt-8">
                  <input type="checkbox" name="isCover" defaultChecked={photo.isCover} />
                  Set as cover
                </label>
                <div className="flex items-end gap-3">
                  <button className="owner-button-text rounded-lg bg-[#5824e6] px-4 py-2 text-white">Save metadata</button>
                  <button formAction={deleteAction} className="owner-button-text rounded-lg border border-[#dbe2ee] px-4 py-2">Soft delete</button>
                </div>
              </form>
            </section>
          );
        })}
      </div>
    </OwnerPropertyPageShell>
  );
}
