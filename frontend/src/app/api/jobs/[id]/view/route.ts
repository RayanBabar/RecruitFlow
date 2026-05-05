import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Increment the view count using Prisma's atomic increment
    await prisma.job.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/jobs/[id]/view error:", error);
    // Return 200 even on failure to avoid breaking the client UI just for analytics
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
