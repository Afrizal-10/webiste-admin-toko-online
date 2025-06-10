import db from "@/lib/db";
import {BannerForm} from "./components/banner-form";

interface PageParams {
  storeId: string;
  bannerId: string;
}

// Optional: agar halaman tidak di-pre-render saat build
export const dynamic = "force-dynamic";

export default async function BannerPage({params}: {params: PageParams}) {
  const banner = await db.banner.findUnique({
    where: {
      id: params.bannerId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BannerForm initialData={banner} />
      </div>
    </div>
  );
}
