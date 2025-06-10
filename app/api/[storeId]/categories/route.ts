import db from "@/lib/db";
import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

// PATCH handler
export async function POST(
  req: Request,
  {params}: {params: {storeId: string}}
) {
  try {
    const {userId} = await auth();
    const body = await req.json();
    const {name, bannerId} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!name) {
      return new NextResponse("Nama Category perlu di input!", {status: 400});
    }

    if (!bannerId) {
      return new NextResponse("BannerId perlu di input!", {status: 400});
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

    const category = await db.category.create({
      data: {
        name,
        bannerId,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORIES_POST]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

export async function GET(req: Request, {params}: {params: {storeId: string}}) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id URL dibutuhkan!", {status: 400});
    }

    const categories = await db.category.findMany({
      where: {
        storeId: params.storeId,
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
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
