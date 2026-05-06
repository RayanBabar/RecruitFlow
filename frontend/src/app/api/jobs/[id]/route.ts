import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/jobs/[id]
export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });
    return NextResponse.json(job);
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/jobs/[id]
export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });
    if (job.employerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.job.update({ where: { id }, data: body });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/jobs/[id]
export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) return NextResponse.json({ message: "Job not found" }, { status: 404 });
    if (job.employerId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.job.delete({ where: { id } });
    return NextResponse.json({ message: "Job deleted" });
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
