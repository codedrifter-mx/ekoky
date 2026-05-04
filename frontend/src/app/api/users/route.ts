import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/siwe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const RegisterSchema = z.object({
  role: z.enum(["BUSINESS", "INSTITUTION"]),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  website: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const data = RegisterSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { address: session.address },
    });
    if (existingUser) {
      return NextResponse.json({ error: "User already registered" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        address: session.address,
        role: data.role,
        name: data.name,
        description: data.description,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        website: data.website || undefined,
        phone: data.phone,
        email: data.email || undefined,
      },
    });

    return NextResponse.json({
      id: user.id,
      address: user.address,
      role: user.role,
      name: user.name,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("User registration failed:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { address: session.address },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user failed:", error);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const UpdateSchema = z.object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().max(500).optional(),
      location: z.string().max(200).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      website: z.string().url().optional().or(z.literal("")),
      phone: z.string().max(20).optional(),
      email: z.string().email().optional().or(z.literal("")),
    });
    const data = UpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { address: session.address },
      data: data,
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("User update failed:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
