import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface AuthenticatedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }
  return session.user as AuthenticatedUser
}

export async function getUserBaby(userId: string) {
  return prisma.baby.findFirst({
    where: { userId },
  })
}

export async function getOrCreateUserBaby(userId: string) {
  let baby = await getUserBaby(userId)
  if (!baby) {
    baby = await prisma.baby.create({
      data: {
        name: "宝宝",
        birthday: new Date().toISOString().split("T")[0],
        gender: "unknown",
        userId,
      },
    })
  }
  return baby
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "未授权，请先登录" }, { status: 401 })
}
