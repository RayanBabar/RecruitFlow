import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/profile — fetch logged-in seeker's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
    });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/profile — create or update seeker profile (including AI parsed data + resume URL)
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = (session.user as any).id;
    const body = await req.json();
    const { skills, experience, resumeUrl, resumeText, parsedData } = body;

    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        skills: skills ?? null,
        experience: experience ?? null,
        resumeUrl: resumeUrl ?? null,
        resumeText: resumeText ?? null,
      },
      update: {
        skills: skills ?? undefined,
        experience: experience ?? undefined,
        resumeUrl: resumeUrl ?? undefined,
        resumeText: resumeText ?? undefined,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("PUT /api/profile error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
