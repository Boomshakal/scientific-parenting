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
    params: Promise<{ id: string; visitId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params
    const visit = await prisma.doctorVisit.findFirst({
      where: {
        id: resolvedParams.visitId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!visit) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 })
    }

    // Parse attachments JSON (empty array if null)
    return NextResponse.json({
      ...visit,
      attachments: visit.attachments
        ? (typeof visit.attachments === 'string' ? JSON.parse(visit.attachments) : visit.attachments)
        : [],
    })
  } catch (error) {
    console.error('Failed to fetch doctor visit:', error)
    return NextResponse.json(
      { error: "Failed to fetch doctor visit" },
      { status: 500 }
    )
  }
}

export async function PUT(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; visitId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const data = await _request.json()
    const resolvedParams = await params

    // Verify visit exists and belongs to this episode/baby
    const existing = await prisma.doctorVisit.findFirst({
      where: {
        id: resolvedParams.visitId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 })
    }

    // Serialize attachments array to JSON string if present
    const updateData = {
      ...data,
      ...(data.attachments !== undefined && data.attachments !== null
        ? { attachments: typeof data.attachments === 'string' ? data.attachments : JSON.stringify(data.attachments) }
        : {}),
    }

    const visit = await prisma.doctorVisit.update({
      where: { id: resolvedParams.visitId },
      data: updateData,
    })

    // Return with parsed attachments
    return NextResponse.json({
      ...visit,
      attachments: typeof visit.attachments === 'string' ? JSON.parse(visit.attachments) : visit.attachments,
    })
  } catch (error) {
    console.error('Failed to update doctor visit:', error)
    return NextResponse.json(
      { error: "Failed to update doctor visit" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; visitId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params

    // Verify visit exists and belongs to this episode/baby
    const existing = await prisma.doctorVisit.findFirst({
      where: {
        id: resolvedParams.visitId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Visit not found" }, { status: 404 })
    }

    await prisma.doctorVisit.delete({
      where: { id: resolvedParams.visitId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete doctor visit:', error)
    return NextResponse.json(
      { error: "Failed to delete doctor visit" },
      { status: 500 }
    )
  }
}