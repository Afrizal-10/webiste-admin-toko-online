import db from "@/lib/db";
import {BannerForm} from "./components/banner-form";
import {type ReadonlyURLSearchParams} from "next/navigation";

interface PageParams {
  params: {
    storeId: string;
    bannerId: string;
  };
  searchParams?: ReadonlyURLSearchParams;
}

const BannerPage = async ({params}: PageParams) => {
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
};

export default BannerPage;
