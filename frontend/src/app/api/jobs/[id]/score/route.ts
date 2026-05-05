import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import axios from "axios";

export const dynamic = "force-dynamic";

const API_URL = process.env.API_URL || "http://localhost:8000/api/v1";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "SEEKER") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { id: jobId } = await params;

    // Fetch the user's profile to get the resume text
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { message: "Profile not found. Please upload a resume first." },
        { status: 400 }
      );
    }

    const resumeText = user.profile.resumeText;
    if (!resumeText) {
      return NextResponse.json(
        { message: "No resume text found. Please upload a PDF resume in your profile." },
        { status: 400 }
      );
    }

    // Fetch the job description and requirements
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const fullJobDescription = `${job.description}\n\nRequirements:\n${job.requirements || "None specified"}`;

    // Call FastAPI to score the profile
    const response = await axios.post(`${API_URL}/score-profile`, {
      resume_text: resumeText,
      job_description: fullJobDescription,
    });

    const parsedData = response.data;

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error: any) {
    console.error("POST /api/jobs/[id]/score error:", error.response?.data || error.message);
    return NextResponse.json({ message: "Internal server error during AI scoring" }, { status: 500 });
  }
}
