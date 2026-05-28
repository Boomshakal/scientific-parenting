import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  getOrCreateUserBaby,
  getBabyById,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const babyId = searchParams.get("babyId")
    let baby
    if (babyId) {
      baby = await getBabyById(user.id, babyId)
      if (!baby) return NextResponse.json({ error: "Baby not found" }, { status: 404 })
    } else {
      baby = await getOrCreateUserBaby(user.id)
    }
    // Convert DateTime to ISO string for JSON response
    const babyResponse = {
      ...baby,
      birthday: baby.birthday instanceof Date
        ? baby.birthday.toISOString().split('T')[0] // YYYY-MM-DD
        : String(baby.birthday),
    };
    return NextResponse.json(babyResponse)
  } catch (error) {
    console.error('GET /api/baby error:', error);
    return NextResponse.json(
      { error: "Failed to fetch baby info" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const babyId = searchParams.get("babyId")
    let targetBaby
    if (babyId) {
      targetBaby = await getBabyById(user.id, babyId)
      if (!targetBaby) return NextResponse.json({ error: "Baby not found" }, { status: 404 })
    } else {
      targetBaby = await getOrCreateUserBaby(user.id)
    }

    const data = await request.json()
    // Validate fields if provided
    if (data.name !== undefined && typeof data.name !== 'string') {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    if (data.birthday !== undefined) {
      // Accept Date or ISO string
      if (typeof data.birthday !== 'string' && !(data.birthday instanceof Date)) {
        return NextResponse.json({ error: "Invalid birthday" }, { status: 400 })
      }
    }
    if (data.gender !== undefined && !['male', 'female', 'unknown'].includes(data.gender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 })
    }

    // Convert birthday string to Date if provided
    const updateData: any = { ...data };
    if (data.birthday && typeof data.birthday === 'string') {
      updateData.birthday = new Date(data.birthday);
    }

    console.log('POST /api/baby - Updating baby:', targetBaby.id, updateData);
    const updated = await prisma.baby.update({
      where: { id: targetBaby.id },
      data: updateData,
    })
    // Convert DateTime to ISO string for JSON response
    const response = {
      ...updated,
      birthday: updated.birthday instanceof Date
        ? updated.birthday.toISOString().split('T')[0]
        : String(updated.birthday),
    };
    return NextResponse.json(response)
  } catch (error) {
    console.error('POST /api/baby error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: "Failed to save baby info", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const babyId = searchParams.get("babyId")
    if (!babyId) {
      return NextResponse.json({ error: "Baby ID required" }, { status: 400 })
    }

    const baby = await getBabyById(user.id, babyId)
    if (!baby) return NextResponse.json({ error: "Baby not found" }, { status: 404 })

    const data = await request.json()
    // Validation same as POST
    if (data.name !== undefined && typeof data.name !== 'string') {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 })
    }
    if (data.birthday !== undefined) {
      if (typeof data.birthday !== 'string' && !(data.birthday instanceof Date)) {
        return NextResponse.json({ error: "Invalid birthday" }, { status: 400 })
      }
    }
    if (data.gender !== undefined && !['male', 'female', 'unknown'].includes(data.gender)) {
      return NextResponse.json({ error: "Invalid gender" }, { status: 400 })
    }

    // Convert birthday string to Date if provided
    const updateData: any = { ...data };
    if (data.birthday && typeof data.birthday === 'string') {
      updateData.birthday = new Date(data.birthday);
    }

    console.log('PATCH /api/baby - Updating baby:', baby.id, updateData);
    const updated = await prisma.baby.update({
      where: { id: baby.id },
      data: updateData,
    })
    // Convert DateTime to ISO string for JSON response
    const response = {
      ...updated,
      birthday: updated.birthday instanceof Date
        ? updated.birthday.toISOString().split('T')[0]
        : String(updated.birthday),
    };
    return NextResponse.json(response)
  } catch (error) {
    console.error('PATCH /api/baby error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: "Failed to update baby" },
      { status: 500 }
    )
  }
}
