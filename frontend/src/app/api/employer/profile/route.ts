import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/employer/profile — return current employer's verification profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.employerProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(profile ?? null);
  } catch (error) {
    console.error("GET /api/employer/profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/employer/profile — employer updates company details (resets status to PENDING)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { companyName, companyWebsite, companyPhone, companyDescription, registrationNumber } =
      await req.json();

    if (!companyName) {
      return NextResponse.json({ message: "Company name is required" }, { status: 400 });
    }

    const updated = await prisma.employerProfile.update({
      where: { userId: session.user.id },
      data: {
        companyName,
        companyWebsite: companyWebsite || null,
        companyPhone: companyPhone || null,
        companyDescription: companyDescription || null,
        registrationNumber: registrationNumber || null,
        verificationStatus: "PENDING",
        adminNote: null,
        reviewedAt: null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/employer/profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
