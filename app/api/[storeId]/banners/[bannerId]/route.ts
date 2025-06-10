import db from "@/lib/db";
import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

// GET Handler
export async function GET(
  req: Request,
  {params}: {params: {bannerId: string}}
) {
  try {
    if (!params.bannerId) {
      return new NextResponse("Banner ID diperlukan", {status: 400});
    }

    const banner = await db.banner.findUnique({
      where: {
        id: params.bannerId,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_GET]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// PATCH handler
export async function PATCH(
  req: Request,
  {params}: {params: {storeId: string; bannerId: string}}
) {
  try {
    const {userId} = await auth();
    const body = await req.json();
    const {label, imageUrl} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!imageUrl) {
      return new NextResponse("Harus menginput image!", {status: 400});
    }

    if (!params.bannerId) {
      return new NextResponse("Banner ID diperlukan", {status: 400});
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

    const banner = await db.banner.updateMany({
      where: {
        id: params.bannerId,
      },
      data: {
        label: label || "", // biarkan kosong jika tidak ada
        imageUrl,
      },
    });

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_PATCH]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// DELETE handler
export async function DELETE(
  req: Request,
  {params}: {params: {storeId: string; bannerId: string}}
) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!params.bannerId) {
      return new NextResponse("Banner ID diperlukan", {status: 400});
    }

    const banner = await db.banner.deleteMany({
      where: {
        id: params.bannerId,
      },
    });

    const storeByUserId = await db.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", {status: 403});
    }

    return NextResponse.json(banner);
  } catch (error) {
    console.log("[BANNER_DELETE]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}
