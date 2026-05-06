import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Role = "SEEKER" | "EMPLOYER";
const VALID_ROLES: Role[] = ["SEEKER", "EMPLOYER"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      companyName,
      companyWebsite,
      companyPhone,
      companyDescription,
      registrationNumber,
    } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate role — default to SEEKER if not provided or invalid
    const userRole: Role = VALID_ROLES.includes(role) ? role : "SEEKER";

    if (userRole === "EMPLOYER" && !companyName) {
      return NextResponse.json(
        { message: "Company name is required for employer accounts" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        ...(userRole === "EMPLOYER" && {
          employerProfile: {
            create: {
              companyName,
              companyWebsite: companyWebsite || null,
              companyPhone: companyPhone || null,
              companyDescription: companyDescription || null,
              registrationNumber: registrationNumber || null,
              verificationStatus: "PENDING",
            },
          },
        }),
      },
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
