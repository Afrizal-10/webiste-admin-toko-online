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
    const {name, price, categoryId, images, isFeatured, isArchived} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!name) {
      return new NextResponse("Harus menginput nama!", {status: 400});
    }

    if (!images || images.length === 0) {
      return new NextResponse("Image perlu di input!", {status: 400});
    }

    if (!price) {
      return new NextResponse("Harus menginput price!", {status: 400});
    }

    if (!categoryId) {
      return new NextResponse("Harus menginput category!", {status: 400});
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

    const product = await db.product.create({
      data: {
        name,
        price,
        categoryId,
        isFeatured,
        isArchived,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [...images.map((image: {url: string}) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

export async function GET(req: Request, {params}: {params: {storeId: string}}) {
  try {
    const {searchParams} = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse("Store id URL dibutuhkan!", {status: 400});
    }

    const product = await db.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
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

    const product = await db.product.deleteMany({
      where: {
        storeId: params.storeId,
        store: {
          userId,
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_DELETE]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}
