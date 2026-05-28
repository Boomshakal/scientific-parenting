import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const babies = await prisma.baby.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
    })
    // Convert DateTime to YYYY-MM-DD strings
    const babiesWithDateStrings = babies.map(baby => ({
      ...baby,
      birthday: baby.birthday instanceof Date
        ? baby.birthday.toISOString().split('T')[0]
        : String(baby.birthday),
    }));
    return NextResponse.json(babiesWithDateStrings)
  } catch (error) {
    console.error('Failed to fetch babies:', error)
    return NextResponse.json({
      error: "Failed to fetch babies",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const data = await request.json()
    // Validation: name and birthday required
    if (!data.name || typeof data.name !== 'string') {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!data.birthday) {
      return NextResponse.json({ error: "Birthday is required" }, { status: 400 })
    }
    if (data.gender && !['male', 'female', 'unknown'].includes(data.gender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 })
    }

    // Convert birthday string to Date if provided
    const updateData: any = { ...data };
    if (typeof data.birthday === 'string') {
      updateData.birthday = new Date(data.birthday);
    }

    const baby = await prisma.baby.create({
      data: {
        ...updateData,
        userId: user.id,
      },
    })
    // Convert DateTime to YYYY-MM-DD string
    const response = {
      ...baby,
      birthday: baby.birthday instanceof Date
        ? baby.birthday.toISOString().split('T')[0]
        : String(baby.birthday),
    };
    return NextResponse.json(response)
  } catch (error) {
    console.error('Failed to create baby:', error)
    return NextResponse.json({ 
      error: "Failed to create baby", 
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
