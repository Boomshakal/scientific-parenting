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

    const records = await prisma.sleepRecord.findMany({
      where: { babyId: baby.id },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sleep records" },
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
    if (!data.startTime || typeof data.startTime !== 'string') {
      return NextResponse.json({ error: "Start time is required" }, { status: 400 })
    }
    if (!data.endTime || typeof data.endTime !== 'string') {
      return NextResponse.json({ error: "End time is required" }, { status: 400 })
    }
    if (data.duration === undefined || typeof data.duration !== 'number' || data.duration < 0) {
      return NextResponse.json({ error: "Valid duration is required" }, { status: 400 })
    }
    if (!data.quality || !['good', 'normal', 'bad'].includes(data.quality)) {
      return NextResponse.json({ error: "Valid quality is required" }, { status: 400 })
    }

    const record = await prisma.sleepRecord.create({
      data: { ...data, babyId: baby.id },
    })
    return NextResponse.json(record)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create sleep record" },
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

    const record = await prisma.sleepRecord.findFirst({
      where: { id, babyId: baby.id },
    })
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    await prisma.sleepRecord.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete sleep record" },
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

    const existing = await prisma.sleepRecord.findFirst({
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
    if (data.startTime !== undefined && typeof data.startTime !== 'string') {
      return NextResponse.json({ error: "Invalid startTime" }, { status: 400 })
    }
    if (data.endTime !== undefined && typeof data.endTime !== 'string') {
      return NextResponse.json({ error: "Invalid endTime" }, { status: 400 })
    }
    if (data.duration !== undefined && (typeof data.duration !== 'number' || data.duration < 0)) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 })
    }
    if (data.quality !== undefined && !['good', 'normal', 'bad'].includes(data.quality)) {
      return NextResponse.json({ error: "Invalid quality" }, { status: 400 })
    }

    const { babyId: _, ...updateData } = data as any
    const updated = await prisma.sleepRecord.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json(
      { error: "Failed to update sleep record" },
      { status: 500 }
    )
  }
}
