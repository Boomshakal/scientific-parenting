import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  getAuthenticatedUser,
  getOrCreateUserBaby,
  unauthorizedResponse,
} from "@/lib/auth-helpers"

export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    let baby = await prisma.baby.findFirst({
      where: { userId: user.id },
    })
    if (!baby) {
      baby = await prisma.baby.create({
        data: {
          name: "宝宝",
          birthday: new Date().toISOString().split("T")[0],
          gender: "unknown",
          userId: user.id,
        },
      })
    }
    return NextResponse.json(baby)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch baby info" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const data = await request.json()
    let baby = await prisma.baby.findFirst({
      where: { userId: user.id },
    })
    if (baby) {
      baby = await prisma.baby.update({
        where: { id: baby.id },
        data,
      })
    } else {
      baby = await prisma.baby.create({
        data: { ...data, userId: user.id },
      })
    }
    return NextResponse.json(baby)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save baby info" },
      { status: 500 }
    )
  }
}
