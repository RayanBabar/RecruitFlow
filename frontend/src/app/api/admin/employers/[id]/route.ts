import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// PATCH /api/admin/employers/[id] — approve or reject an employer
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { verificationStatus, adminNote } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(verificationStatus)) {
      return NextResponse.json(
        { message: "Invalid status. Must be APPROVED or REJECTED." },
        { status: 400 }
      );
    }

    const updated = await prisma.employerProfile.update({
      where: { userId: id },
      data: {
        verificationStatus,
        adminNote: adminNote || null,
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/admin/employers/[id] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
