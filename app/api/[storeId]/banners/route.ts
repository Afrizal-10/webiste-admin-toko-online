import db from "@/lib/db";
import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

// POST handler
export async function POST(
  req: Request,
  {params}: {params: {storeId: string}}
) {
  try {
    const {userId} = await auth();
    const body = await req.json();
    const {label, imageUrl} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!imageUrl) {
      return new NextResponse("Image perlu di input!", {status: 400});
    }

    if (!params.storeId) {
      return new NextResponse("Store id URL dibutuhkan!", {status: 400});
    }

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", {status: 403});
    }

    const banner = await db.banner.create({
      data: {
        label: label || "", // biarkan kosong jika tidak diisi
        imageUrl,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_POST]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// GET handler
export async function GET(req: Request, {params}: {params: {storeId: string}}) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id URL dibutuhkan!", {status: 400});
    }

    const banners = await db.banner.findMany({
      where: {
        storeId: params.storeId,
      },
    });
    return NextResponse.json(banners);
  } catch (error) {
    console.log("[BANNER_GET]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// DELETE handler
export async function DELETE(
  req: Request,
  {params}: {params: {storeId: string}}
) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!params.storeId) {
      return new NextResponse("Store ID diperlukan", {status: 400});
    }

    const banner = await db.banner.deleteMany({
      where: {
        storeId: params.storeId,
        store: {
          userId,
        },
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_DELETE]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}
