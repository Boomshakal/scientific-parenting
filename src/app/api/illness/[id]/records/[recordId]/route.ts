import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  getUserBaby,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; recordId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params
    const record = await prisma.illnessRecord.findFirst({
      where: {
        id: resolvedParams.recordId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Parse symptoms JSON
    return NextResponse.json({
      ...record,
      symptoms: typeof record.symptoms === 'string' ? JSON.parse(record.symptoms) : record.symptoms,
    })
  } catch (error) {
    console.error('Failed to fetch illness record:', error)
    return NextResponse.json(
      { error: "Failed to fetch illness record" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; recordId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const data = await request.json()
    const resolvedParams = await params

    // Verify record exists and belongs to this episode/baby
    const existing = await prisma.illnessRecord.findFirst({
      where: {
        id: resolvedParams.recordId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    // Serialize symptoms if it's an array
    const updateData = {
      ...data,
      symptoms: data.symptoms !== undefined
        ? (typeof data.symptoms === 'string' ? data.symptoms : JSON.stringify(data.symptoms))
        : undefined,
    }

    const record = await prisma.illnessRecord.update({
      where: { id: resolvedParams.recordId },
      data: updateData,
    })

    // Return with parsed symptoms
    return NextResponse.json({
      ...record,
      symptoms: typeof record.symptoms === 'string' ? JSON.parse(record.symptoms) : record.symptoms,
    })
  } catch (error) {
    console.error('Failed to update illness record:', error)
    return NextResponse.json(
      { error: "Failed to update illness record" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; recordId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params

    // Verify record exists and belongs to this episode/baby
    const existing = await prisma.illnessRecord.findFirst({
      where: {
        id: resolvedParams.recordId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 })
    }

    await prisma.illnessRecord.delete({
      where: { id: resolvedParams.recordId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete illness record:', error)
    return NextResponse.json(
      { error: "Failed to delete illness record" },
      { status: 500 }
    )
  }
}