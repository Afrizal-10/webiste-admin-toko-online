import db from "@/lib/db";
import {auth} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

// GET Handler
export async function GET(
  req: Request,
  {params}: {params: {productId: string}}
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID diperlukan", {status: 400});
    }

    const product = await db.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// PATCH handler
export async function PATCH(
  req: Request,
  {params}: {params: {storeId: string; productId: string}}
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

    if (!params.productId) {
      return new NextResponse("Product ID diperlukan", {status: 400});
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

    await db.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        images: {
          deleteMany: {},
        },
      },
    });

    const product = await db.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: {url: string}) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_PATCH]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}

// DELETE handler
export async function DELETE(
  req: Request,
  {params}: {params: {storeId: string; productId: string}}
) {
  try {
    const {userId} = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!params.productId) {
      return new NextResponse("Product ID diperlukan", {status: 400});
    }

    const product = await db.product.deleteMany({
      where: {
        id: params.productId,
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
    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_DELETE]", error);
    return new NextResponse("Internal Error", {status: 500});
  }
}
