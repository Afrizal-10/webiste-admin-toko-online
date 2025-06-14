import db from "@/lib/db";
import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

// GET Handler
export async function GET(
  req: Request,
  {params}: {params: {categoryId: string}}
) {
  try {
    if (!params.categoryId) {
      return new NextResponse("Category ID diperlukan", {status: 400});
    }

    const category = await db.category.findUnique({
      where: {
        id: params.categoryId,
      },
      include: {
        banner: true,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// PATCH handler
export async function PATCH(
  req: Request,
  {params}: {params: {storeId: string; categoryId: string}}
) {
  try {
    const {userId} = await auth();
    const body = await req.json();
    const {name, bannerId} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!name) {
      return new NextResponse("Harus menginput Nama!", {status: 400});
    }

    if (!bannerId) {
      return new NextResponse("Harus menginput Banner!", {status: 400});
    }

    if (!params.categoryId) {
      return new NextResponse("Category ID diperlukan", {status: 400});
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

    const category = await db.category.updateMany({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        bannerId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_PATCH]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// DELETE handler
export async function DELETE(
  req: Request,
  {params}: {params: {storeId: string; categoryId: string}}
) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!params.categoryId) {
      return new NextResponse("Category ID diperlukan", {status: 400});
    }

    const category = await db.category.deleteMany({
      where: {
        id: params.categoryId,
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
    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}
