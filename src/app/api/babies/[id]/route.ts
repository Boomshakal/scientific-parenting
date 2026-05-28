import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser, unauthorizedResponse } from "@/lib/auth-helpers"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) return unauthorizedResponse()

    const { id: babyId } = await params;
    if (!babyId) {
      return NextResponse.json({ error: "Baby ID required" }, { status: 400 })
    }

    // Verify the baby belongs to the user
    const baby = await prisma.baby.findFirst({
      where: { id: babyId, userId: user.id },
    })
    if (!baby) {
      return NextResponse.json({ error: "Baby not found" }, { status: 404 })
    }

    // Delete the baby
    await prisma.baby.delete({
      where: { id: babyId },
    })

    return NextResponse.json({ success: true, message: "Baby deleted" })
  } catch (error) {
    console.error('Failed to delete baby:', error)
    return NextResponse.json({
      error: "Failed to delete baby",
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
