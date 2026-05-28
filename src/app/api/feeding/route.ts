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

    const records = await prisma.feedingRecord.findMany({
      where: { babyId: baby.id },
      orderBy: [{ date: "desc" }, { time: "desc" }],
    })
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch feeding records" },
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
    if (!data.time || typeof data.time !== 'string') {
      return NextResponse.json({ error: "Time is required" }, { status: 400 })
    }
    if (!data.type || !['breast', 'formula', 'solid'].includes(data.type)) {
      return NextResponse.json({ error: "Valid type is required" }, { status: 400 })
    }

    const record = await prisma.feedingRecord.create({
      data: { ...data, babyId: baby.id },
    })
    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create feeding record" },
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

    const record = await prisma.feedingRecord.findFirst({
      where: { id, babyId: baby.id },
    })
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    await prisma.feedingRecord.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete feeding record" },
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

    // Verify record exists and belongs to this baby
    const existing = await prisma.feedingRecord.findFirst({
      where: { id, babyId: baby.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Record not found or does not belong to this baby" }, { status: 404 })
    }

    const data = await request.json()
    // Basic validation
    if (data.date !== undefined && typeof data.date !== 'string') {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 })
    }
    if (data.time !== undefined && typeof data.time !== 'string') {
      return NextResponse.json({ error: "Invalid time" }, { status: 400 })
    }
    if (data.type !== undefined && !['breast', 'formula', 'solid'].includes(data.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }
    if (data.amount !== undefined && (typeof data.amount !== 'number' || data.amount < 0)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }
    if (data.duration !== undefined && (typeof data.duration !== 'number' || data.duration < 0)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
    }

    const { babyId: _, ...updateData } = data as any; // omit babyId
    const updated = await prisma.feedingRecord.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json(
      { error: "Failed to update feeding record" },
      { status: 500 }
    )
  }
}
