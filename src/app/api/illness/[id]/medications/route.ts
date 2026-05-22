import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  getUserBaby,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params
    const medications = await prisma.medication.findMany({
      where: {
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
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

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const data = await _request.json()
    const resolvedParams = await params

    // Verify episode exists and belongs to this baby
    const episode = await prisma.illnessEpisode.findFirst({
      where: {
        id: resolvedParams.id,
        babyId: baby.id,
      },
    })

    if (!episode) {
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