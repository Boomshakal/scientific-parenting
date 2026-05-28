import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  getUserBaby,
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
      baby = await getUserBaby(user.id)
    }
    if (!baby) return NextResponse.json([])

    const records = await prisma.growthRecord.findMany({
      where: { babyId: baby.id },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch growth records" },
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
    let baby
    if (babyId) {
      baby = await getBabyById(user.id, babyId)
      if (!baby) return NextResponse.json({ error: "Baby not found" }, { status: 404 })
    } else {
      baby = await getUserBaby(user.id)
    }
    if (!baby) return NextResponse.json({ error: "No baby found" }, { status: 400 })

    const data = await request.json()
    // Validate required fields
    if (!data.date || typeof data.date !== 'string') {
      return NextResponse.json({ error: "Date is required" }, { status: 400 })
    }
    if (data.height === undefined || typeof data.height !== 'number' || data.height <= 0) {
      return NextResponse.json({ error: "Valid height is required (cm)" }, { status: 400 })
    }
    if (data.weight === undefined || typeof data.weight !== 'number' || data.weight <= 0) {
      return NextResponse.json({ error: "Valid weight is required (kg)" }, { status: 400 })
    }
    if (data.headCirc === undefined || typeof data.headCirc !== 'number' || data.headCirc <= 0) {
      return NextResponse.json({ error: "Valid head circumference is required (cm)" }, { status: 400 })
    }

    const record = await prisma.growthRecord.create({
      data: { ...data, babyId: baby.id },
    })
    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create growth record" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const babyId = searchParams.get("babyId")
    let baby
    if (babyId) {
      baby = await getBabyById(user.id, babyId)
      if (!baby) return NextResponse.json({ error: "Baby not found" }, { status: 404 })
    } else {
      baby = await getUserBaby(user.id)
    }
    if (!baby) return unauthorizedResponse()

    const record = await prisma.growthRecord.findFirst({
      where: { id, babyId: baby.id },
    })
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    await prisma.growthRecord.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete growth record" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 })
    }

    const babyId = searchParams.get("babyId")
    let baby
    if (babyId) {
      baby = await getBabyById(user.id, babyId)
      if (!baby) return NextResponse.json({ error: "Baby not found" }, { status: 404 })
    } else {
      baby = await getUserBaby(user.id)
    }
    if (!baby) return NextResponse.json({ error: "No baby found" }, { status: 404 })

    const existing = await prisma.growthRecord.findFirst({
      where: { id, babyId: baby.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Record not found or access denied" }, { status: 404 })
    }

    const data = await request.json()
    // Basic validation
    if (data.date !== undefined && typeof data.date !== 'string') {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }
    if (data.height !== undefined && (typeof data.height !== 'number' || data.height <= 0)) {
      return NextResponse.json({ error: "Invalid height" }, { status: 400 })
    }
    if (data.weight !== undefined && (typeof data.weight !== 'number' || data.weight <= 0)) {
      return NextResponse.json({ error: "Invalid weight" }, { status: 400 })
    }
    if (data.headCirc !== undefined && (typeof data.headCirc !== 'number' || data.headCirc <= 0)) {
      return NextResponse.json({ error: "Invalid head circumference" }, { status: 400 })
    }

    const { babyId: _, ...updateData } = data as any
    const updated = await prisma.growthRecord.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json(
      { error: "Failed to update growth record" },
      { status: 500 }
    )
  }
}
