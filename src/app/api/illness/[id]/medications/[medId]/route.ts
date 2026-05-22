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
    params: Promise<{ id: string; medId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params
    const medication = await prisma.medication.findFirst({
      where: {
        id: resolvedParams.medId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Failed to fetch medication:', error)
    return NextResponse.json(
      { error: "Failed to fetch medication" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; medId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const data = await request.json()
    const resolvedParams = await params

    // Verify medication exists and belongs to this episode/baby
    const existing = await prisma.medication.findFirst({
      where: {
        id: resolvedParams.medId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    const medication = await prisma.medication.update({
      where: { id: resolvedParams.medId },
      data,
    })

    return NextResponse.json(medication)
  } catch (error) {
    console.error('Failed to update medication:', error)
    return NextResponse.json(
      { error: "Failed to update medication" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; medId: string }>
  }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const baby = await getUserBaby(user.id)
    if (!baby) return unauthorizedResponse()

    const resolvedParams = await params

    // Verify medication exists and belongs to this episode/baby
    const existing = await prisma.medication.findFirst({
      where: {
        id: resolvedParams.medId,
        episodeId: resolvedParams.id,
        episode: {
          babyId: baby.id,
        },
      },
    })

    if (!existing) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 })
    }

    await prisma.medication.delete({
      where: { id: resolvedParams.medId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete medication:', error)
    return NextResponse.json(
      { error: "Failed to delete medication" },
      { status: 500 }
    )
  }
}