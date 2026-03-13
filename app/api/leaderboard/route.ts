import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

// GET /api/leaderboard?period=week|month|all
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const period = request.nextUrl.searchParams.get("period") || "week"

    // Determine the sort field based on period
    const pointsField = period === "week"
      ? "pointsThisWeek"
      : period === "month"
        ? "pointsThisMonth"
        : "pointsAllTime"

    // Get top 15 users by points for the period
    const topUsers = await prisma.userStreak.findMany({
      orderBy: { [pointsField]: "desc" },
      take: 15,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            supabaseId: true,
          },
        },
      },
    })

    // Get upload counts for these users
    const userIds = topUsers.map((s) => s.userId)
    const uploadCounts = await prisma.resource.groupBy({
      by: ["uploaderId"],
      where: { uploaderId: { in: userIds }, deletedAt: null },
      _count: { id: true },
    })
    const uploadMap = new Map(uploadCounts.map((u) => [u.uploaderId, u._count.id]))

    // Get today's points for each user
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dailyActivities = await prisma.dailyActivity.findMany({
      where: {
        userId: { in: userIds },
        activityDate: today,
      },
      select: { userId: true, totalPointsToday: true },
    })
    const todayPointsMap = new Map(dailyActivities.map((d) => [d.userId, d.totalPointsToday]))

    // Build leaderboard entries
    const leaderboard = topUsers.map((streak, index) => {
      const uploads = uploadMap.get(streak.userId) || 0
      const todayPts = todayPointsMap.get(streak.userId) || 0

      // Assign badges
      let badge = null
      if (uploads >= 20) badge = { emoji: "⭐", label: "Top Uploader", color: "#F59E0B" }
      else if (streak.currentStreak >= 7) badge = { emoji: "🔥", label: "On Fire", color: "#F97316" }
      else if ((streak as any)[pointsField] >= 200) badge = { emoji: "📚", label: "Study King", color: "#4F8EF7" }

      return {
        rank: index + 1,
        userId: streak.userId,
        name: streak.user.name || streak.user.email.split("@")[0],
        username: streak.user.email.split("@")[0],
        avatar: streak.user.image,
        supabaseId: streak.user.supabaseId,
        currentStreak: streak.currentStreak,
        flameLevel: streak.flameLevel,
        flameScore: streak.flameScore,
        points: (streak as any)[pointsField] as number,
        pointsToday: todayPts,
        uploads,
        badge,
        rankChange: 0, // TODO: compute vs last week
      }
    })

    // Find current user's rank
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    let myRank = null
    if (dbUser) {
      const myStreak = await prisma.userStreak.findUnique({ where: { userId: dbUser.id } })
      if (myStreak) {
        const myPoints = (myStreak as any)[pointsField] as number
        const higherCount = await prisma.userStreak.count({
          where: { [pointsField]: { gt: myPoints } },
        })
        const rank = higherCount + 1
        const myUploads = await prisma.resource.count({
          where: { uploaderId: dbUser.id, deletedAt: null },
        })

        // Gap to rank 15
        const rank15Points = leaderboard.length >= 15 ? leaderboard[14].points : 0
        const gapToTop15 = rank > 15 ? rank15Points - myPoints + 1 : 0

        myRank = {
          rank,
          userId: dbUser.id,
          name: dbUser.name || dbUser.email.split("@")[0],
          username: dbUser.email.split("@")[0],
          avatar: dbUser.image,
          currentStreak: myStreak.currentStreak,
          flameLevel: myStreak.flameLevel,
          flameScore: myStreak.flameScore,
          points: myPoints,
          uploads: myUploads,
          gapToTop15,
        }
      }
    }

    // Total students with streaks
    const totalStudents = await prisma.userStreak.count()

    return NextResponse.json({ leaderboard, myRank, totalStudents })
  } catch (error: any) {
    console.error("Leaderboard error:", error)
    return NextResponse.json(
      { error: "Failed to fetch leaderboard", details: error.message },
      { status: 500 }
    )
  }
}
