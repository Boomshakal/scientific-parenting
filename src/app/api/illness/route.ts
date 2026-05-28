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
    if (!data.title || typeof data.title !== 'string') {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!data.start_date || typeof data.start_date !== 'string') {
      return NextResponse.json({ error: "Start date is required" }, { status: 400 })
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

    // Verify episode belongs to baby
    const episode = await prisma.illnessEpisode.findFirst({
      where: { id, babyId: baby.id },
    })
    if (!episode) {
      return NextResponse.json({ error: "Episode not found" }, { status: 404 })
    }

    await prisma.illnessEpisode.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete illness episode:', error)
    return NextResponse.json(
      { error: "Failed to delete illness episode" },
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

    // Verify episode belongs to baby
    const existing = await prisma.illnessEpisode.findFirst({
      where: { id, babyId: baby.id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Episode not found or access denied" }, { status: 404 })
    }

    const data = await request.json()
    // Basic validation
    if (data.title !== undefined && typeof data.title !== 'string') {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 })
    }
    if (data.start_date !== undefined && typeof data.start_date !== 'string') {
      return NextResponse.json({ error: "Invalid start date" }, { status: 400 })
    }
    if (data.end_date !== undefined && typeof data.end_date !== 'string') {
      return NextResponse.json({ error: "Invalid end date" }, { status: 400 })
    }

    const { babyId: _, ...updateData } = data as any
    const updated = await prisma.illnessEpisode.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json(updated)
  } catch (error) {
    console.error('PATCH error:', error)
    return NextResponse.json(
      { error: "Failed to update illness episode" },
      { status: 500 }
    )
  }
}
