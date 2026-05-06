import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/admin/employers — list all employers with their verification profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const employers = await prisma.user.findMany({
      where: { role: "EMPLOYER" },
      include: { employerProfile: true },
      orderBy: { createdAt: "desc" },
    });

    // Sort: PENDING first, then REJECTED, then APPROVED
    const statusOrder: Record<string, number> = { PENDING: 0, REJECTED: 1, APPROVED: 2 };
    employers.sort(
      (a, b) =>
        (statusOrder[a.employerProfile?.verificationStatus ?? "PENDING"] ?? 0) -
        (statusOrder[b.employerProfile?.verificationStatus ?? "PENDING"] ?? 0)
    );

    return NextResponse.json(employers);
  } catch (error) {
    console.error("GET /api/admin/employers error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
