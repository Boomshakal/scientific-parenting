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

    const medications = await prisma.medication.findMany({
      where: {
        episodeId: resolvedParams.id,
      },
      orderBy: { start_date: "desc" },
    })

    return NextResponse.json(medications)
  } catch (error) {
    console.error('Failed to fetch medications:', error)
    return NextResponse.json(
      { error: "Failed to fetch medications" },
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

    const medication = await prisma.medication.create({
      data: {
        ...data,
        episodeId: resolvedParams.id,
      },
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Failed to create medication:', error)
    return NextResponse.json(
      { error: "Failed to create medication" },
      { status: 500 }
    )
  }
}