import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  getUserBaby,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params
    const episode = await prisma.illnessEpisode.findFirst({
      where: {
        id: resolvedParams.id,
        babyId: baby.id,
      },
      include: {
        records: {
          orderBy: { recorded_at: "desc" },
        },
        medications: {
          orderBy: { start_date: "desc" },
        },
        doctorVisits: {
          orderBy: { visit_date: "desc" },
        },
      },
    })

    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 })
    }

    // Transform records to parse JSON fields
    const transformedEpisode = {
      ...episode,
      records: episode.records.map(record => ({
        ...record,
        symptoms: typeof record.symptoms === 'string' ? JSON.parse(record.symptoms) : record.symptoms,
      })),
      doctor_visits: episode.doctorVisits.map(visit => ({
        ...visit,
        attachments: typeof visit.attachments === 'string' ? JSON.parse(visit.attachments) : visit.attachments,
      })),
    }

    return NextResponse.json(transformedEpisode)
  } catch (error) {
    console.error('Failed to fetch illness episode:', error)
    return NextResponse.json(
      { error: "Failed to fetch illness episode" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const data = await request.json()
    const resolvedParams = await params

    // Check if episode exists and belongs to this baby
    const existing = await prisma.illnessEpisode.findFirst({
      where: {
        id: resolvedParams.id,
        babyId: baby.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 })
    }

    const episode = await prisma.illnessEpisode.update({
      where: { id: resolvedParams.id },
      data: {
        ...data,
        updated_at: new Date().toISOString(),
      },
    })

    return NextResponse.json(episode)
  } catch (error) {
    console.error('Failed to update illness episode:', error)
    return NextResponse.json(
      { error: "Failed to update illness episode" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params

    // Check if episode exists and belongs to this baby
    const existing = await prisma.illnessEpisode.findFirst({
      where: {
        id: resolvedParams.id,
        babyId: baby.id,
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 })
    }

    // Delete will cascade to related records
    await prisma.illnessEpisode.delete({
      where: { id: resolvedParams.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete illness episode:', error)
    return NextResponse.json(
      { error: "Failed to delete illness episode" },
      { status: 500 }
    )
  }
}