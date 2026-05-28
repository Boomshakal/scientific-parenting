import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const resolvedParams = await params

    // Find episode with its baby to verify ownership
    const episode = await prisma.illnessEpisode.findFirst({
      where: { id: resolvedParams.id },
      include: { baby: true },
    })

    if (!episode || episode.baby.userId !== user.id) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 })
    }

    const records = await prisma.illnessRecord.findMany({
      where: {
        episodeId: resolvedParams.id,
      },
      orderBy: { recorded_at: "desc" },
    })

    // Parse symptoms JSON
    const transformedRecords = records.map(record => ({
      ...record,
      symptoms: typeof record.symptoms === 'string' ? JSON.parse(record.symptoms) : record.symptoms,
    }))

    return NextResponse.json(transformedRecords)
  } catch (error) {
    console.error('Failed to fetch illness records:', error)
    return NextResponse.json(
      { error: "Failed to fetch illness records" },
      { status: 500 }
    )
  }
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const data = await _request.json()
    const resolvedParams = await params

    // Find episode with its baby to verify ownership
    const episode = await prisma.illnessEpisode.findFirst({
      where: { id: resolvedParams.id },
      include: { baby: true },
    })

    if (!episode || episode.baby.userId !== user.id) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 })
    }

    // Serialize symptoms array to JSON string
    const recordData = {
      ...data,
      episodeId: resolvedParams.id,
      symptoms: typeof data.symptoms === 'string' ? data.symptoms : JSON.stringify(data.symptoms || []),
    }

    const record = await prisma.illnessRecord.create({
      data: recordData,
    })

    // Return with parsed symptoms
    return NextResponse.json({
      ...record,
      symptoms: typeof record.symptoms === 'string' ? JSON.parse(record.symptoms) : record.symptoms,
    })
  } catch (error) {
    console.error('Failed to create illness record:', error)
    return NextResponse.json(
      { error: "Failed to create illness record" },
      { status: 500 }
    )
  }
}