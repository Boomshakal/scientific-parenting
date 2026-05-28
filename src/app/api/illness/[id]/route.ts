import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const resolvedParams = await params
    // Find episode with its baby to verify ownership
    const episode = await prisma.illnessEpisode.findFirst({
      where: { id: resolvedParams.id },
      include: {
        baby: true,
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

    if (!episode || episode.baby.userId !== user.id) {
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

    const data = await request.json()
    const resolvedParams = await params

    // Find episode with baby to verify ownership
    const existing = await prisma.illnessEpisode.findFirst({
      where: { id: resolvedParams.id },
      include: { baby: true },
    })

    if (!existing || existing.baby.userId !== user.id) {
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

    const resolvedParams = await params

    // Find episode with baby to verify ownership
    const existing = await prisma.illnessEpisode.findFirst({
      where: { id: resolvedParams.id },
      include: { baby: true },
    })

    if (!existing || existing.baby.userId !== user.id) {
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