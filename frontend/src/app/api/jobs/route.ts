import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/jobs — list all open jobs (public) or employer's own jobs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let employerId = searchParams.get("employerId");

    // Resolve "me" to the actual session user ID
    if (employerId === "me") {
      const session = await getServerSession(authOptions);
      employerId = session?.user?.id ?? null;
    }

    const where = employerId
      ? { employerId }
      : { status: "OPEN" };

    const jobs = await prisma.job.findMany({
      where,
      include: {
        employer: { select: { id: true, name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error("GET /api/jobs error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/jobs — employer creates a new job
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "EMPLOYER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Enforce employer verification
    const employer = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { employerProfile: true },
    });

    if (employer?.employerProfile?.verificationStatus !== "APPROVED") {
      return NextResponse.json(
        { message: "Your account must be verified by an admin before posting jobs." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, company, location, type, salary, description, requirements } = body;

    if (!title || !company || !location || !type || !description) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const job = await prisma.job.create({
      data: {
        title,
        company,
        location,
        type,
        salary: salary || null,
        description,
        requirements: requirements || null,
        employerId: session.user.id,
        status: "OPEN",
      },
    });

    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    console.error("POST /api/jobs error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
