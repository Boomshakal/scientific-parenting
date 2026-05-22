import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  getUserBaby,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return NextResponse.json([])

    const episodes = await prisma.illnessEpisode.findMany({
      where: { babyId: baby.id },
      orderBy: { start_date: "desc" },
    })

    // Get stats for each episode
    const episodesWithStats = await Promise.all(
      episodes.map(async (episode) => {
        const records = await prisma.illnessRecord.findMany({
          where: { episodeId: episode.id },
        })
        const temps = records
          .map(r => r.temperature)
          .filter((t): t is number => t !== undefined)

        return {
          ...episode,
          record_count: records.length,
          max_temperature: temps.length > 0 ? Math.max(...temps) : undefined,
        }
      })
    )

    return NextResponse.json(episodesWithStats)
  } catch (error) {
    console.error('Failed to fetch illness episodes:', error)
    return NextResponse.json(
      { error: "Failed to fetch illness episodes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const data = await request.json()
    const baby = await getUserBaby(user.id)
    if (!baby) {
      return NextResponse.json({ error: "No baby found" }, { status: 400 })
    }

    const episode = await prisma.illnessEpisode.create({
      data: {
        ...data,
        babyId: baby.id,
      },
    })

    return NextResponse.json(episode)
  } catch (error) {
    console.error('Failed to create illness episode:', error)
    return NextResponse.json(
      { error: "Failed to create illness episode" },
      { status: 500 }
    )
  }
}