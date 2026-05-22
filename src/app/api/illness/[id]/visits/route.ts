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
    const visits = await prisma.doctorVisit.findMany({
      where: {
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
      orderBy: { visit_date: "desc" },
    })

    return NextResponse.json(visits)
  } catch (error) {
    console.error('Failed to fetch doctor visits:', error)
    return NextResponse.json(
      { error: "Failed to fetch doctor visits" },
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

    // Serialize attachments array to JSON string if present
    const visitData = {
      ...data,
      episodeId: resolvedParams.id,
      ...(data.attachments !== undefined && data.attachments !== null
        ? { attachments: typeof data.attachments === 'string' ? data.attachments : JSON.stringify(data.attachments) }
        : {}),
    }

    const visit = await prisma.doctorVisit.create({
      data: visitData,
    })

    // Return with parsed attachments (empty array if null/undefined)
    return NextResponse.json({
      ...visit,
      attachments: visit.attachments
        ? (typeof visit.attachments === 'string' ? JSON.parse(visit.attachments) : visit.attachments)
        : [],
    })
  } catch (error) {
    console.error('Failed to create doctor visit:', error)
    return NextResponse.json(
      { error: "Failed to create doctor visit" },
      { status: 500 }
    )
  }
}