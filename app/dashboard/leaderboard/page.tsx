"use client"

import { useState, useEffect, useCallback } from "react"
import { Trophy, ChevronDown, ChevronUp, TrendingUp, ArrowUp, ArrowDown, Minus } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────
interface LeaderboardEntry {
  rank: number
  userId: string
  name: string
  username: string
  avatar: string | null
  currentStreak: number
  flameLevel: string
  flameScore: number
  points: number
  pointsToday: number
  uploads: number
  badge: { emoji: string; label: string; color: string } | null
  rankChange: number
}

interface MyRank {
  rank: number
  userId: string
  name: string
  username: string
  avatar: string | null
  currentStreak: number
  flameLevel: string
  flameScore: number
  points: number
  uploads: number
  gapToTop15: number
}

type Period = "week" | "month" | "all"

// ─── Mock Data ───────────────────────────────────────────────────
const MOCK_STUDENTS: LeaderboardEntry[] = [
  { rank: 1, userId: "1", name: "Mayank Thakur", username: "mayank_thakur", avatar: null, currentStreak: 14, flameLevel: "Inferno", flameScore: 287, points: 287, pointsToday: 24, uploads: 23, badge: { emoji: "⭐", label: "Top Uploader", color: "#F59E0B" }, rankChange: 2 },
  { rank: 2, userId: "2", name: "Vedant Pare", username: "vedant_pare", avatar: null, currentStreak: 12, flameLevel: "Raging Flame", flameScore: 241, points: 241, pointsToday: 18, uploads: 19, badge: { emoji: "🔥", label: "On Fire", color: "#F97316" }, rankChange: -1 },
  { rank: 3, userId: "3", name: "Kartik Chaudhary", username: "kartik_chaudhary", avatar: null, currentStreak: 9, flameLevel: "Raging Flame", flameScore: 198, points: 198, pointsToday: 12, uploads: 15, badge: { emoji: "📚", label: "Study King", color: "#4F8EF7" }, rankChange: 1 },
  { rank: 4, userId: "4", name: "Ananya Gupta", username: "ananya_g", avatar: null, currentStreak: 11, flameLevel: "Raging Flame", flameScore: 187, points: 187, pointsToday: 8, uploads: 14, badge: { emoji: "🔥", label: "On Fire", color: "#F97316" }, rankChange: 0 },
  { rank: 5, userId: "5", name: "Rohan Mehta", username: "rohan_m", avatar: null, currentStreak: 8, flameLevel: "Growing Flame", flameScore: 165, points: 165, pointsToday: 15, uploads: 12, badge: null, rankChange: 3 },
  { rank: 6, userId: "6", name: "Priya Patel", username: "priya_patel", avatar: null, currentStreak: 7, flameLevel: "Growing Flame", flameScore: 152, points: 152, pointsToday: 0, uploads: 11, badge: { emoji: "🚀", label: "Pioneer", color: "#A78BFA" }, rankChange: -2 },
  { rank: 7, userId: "7", name: "Arjun Reddy", username: "arjun_r", avatar: null, currentStreak: 10, flameLevel: "Raging Flame", flameScore: 143, points: 143, pointsToday: 6, uploads: 10, badge: null, rankChange: 1 },
  { rank: 8, userId: "8", name: "Sneha Joshi", username: "sneha_j", avatar: null, currentStreak: 5, flameLevel: "Growing Flame", flameScore: 132, points: 132, pointsToday: 4, uploads: 9, badge: null, rankChange: -1 },
  { rank: 9, userId: "9", name: "Vikram Chauhan", username: "vikram_c", avatar: null, currentStreak: 6, flameLevel: "Growing Flame", flameScore: 121, points: 121, pointsToday: 10, uploads: 8, badge: null, rankChange: 0 },
  { rank: 10, userId: "10", name: "Ishita Verma", username: "ishita_v", avatar: null, currentStreak: 4, flameLevel: "Growing Flame", flameScore: 115, points: 115, pointsToday: 0, uploads: 7, badge: null, rankChange: 2 },
  { rank: 11, userId: "11", name: "Aditya Kumar", username: "aditya_k", avatar: null, currentStreak: 3, flameLevel: "Starter Flame", flameScore: 98, points: 98, pointsToday: 5, uploads: 6, badge: null, rankChange: -1 },
  { rank: 12, userId: "12", name: "Neha Sharma", username: "neha_s", avatar: null, currentStreak: 5, flameLevel: "Growing Flame", flameScore: 89, points: 89, pointsToday: 3, uploads: 5, badge: null, rankChange: 0 },
  { rank: 13, userId: "13", name: "Rahul Verma", username: "rahul_v", avatar: null, currentStreak: 2, flameLevel: "Starter Flame", flameScore: 76, points: 76, pointsToday: 0, uploads: 4, badge: null, rankChange: -3 },
  { rank: 14, userId: "14", name: "Diya Nair", username: "diya_n", avatar: null, currentStreak: 4, flameLevel: "Growing Flame", flameScore: 68, points: 68, pointsToday: 7, uploads: 3, badge: null, rankChange: 1 },
  { rank: 15, userId: "15", name: "Karan Singh", username: "karan_s", avatar: null, currentStreak: 1, flameLevel: "Starter Flame", flameScore: 54, points: 54, pointsToday: 2, uploads: 2, badge: null, rankChange: 0 },
]

const MOCK_MY_RANK: MyRank = {
  rank: 23, userId: "current", name: "Mayank Thakur", username: "mayank_thakur",
  avatar: null, currentStreak: 14, flameLevel: "Raging Flame", flameScore: 287,
  points: 287, uploads: 8, gapToTop15: 36,
}

// ─── Helpers ─────────────────────────────────────────────────────
function getFlameEmojis(level: string): string {
  switch (level) {
    case "Legend": return "🔥🔥🔥🔥🔥🔥"
    case "Inferno": return "🔥🔥🔥🔥🔥"
    case "Raging Flame": return "🔥🔥🔥🔥"
    case "Growing Flame": return "🔥🔥🔥"
    case "Starter Flame": return "🔥🔥"
    default: return "🔥"
  }
}

function getAvatarColor(level: string): string {
  switch (level) {
    case "Legend": return "linear-gradient(135deg, #F59E0B, #FDE68A)"
    case "Inferno": return "#EF4444"
    case "Raging Flame": return "#F97316"
    case "Growing Flame": return "#60A5FA"
    default: return "#94A3B8"
  }
}

function getInitials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

function getNextMonday(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 1 : 8 - day
  const nextMon = new Date(now)
  nextMon.setDate(now.getDate() + diff)
  nextMon.setHours(0, 0, 0, 0)
  return nextMon
}

// ─── Confetti Particle ──────────────────────────────────────────
function ConfettiParticles() {
  const particles = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    left: 15 + Math.random() * 70,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 4 + Math.random() * 4,
    color: ["#F59E0B", "#FDE68A", "#FB923C", "#FBBF24", "#F97316", "#FCD34D"][i],
  }))

  return (
    <div style={{ position: "absolute", top: -10, left: 0, right: 0, height: 60, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            bottom: 0,
            width: p.size,
            height: p.size,
            borderRadius: p.size > 6 ? "1px" : "50%",
            backgroundColor: p.color,
            animation: `confettiDrift ${p.duration}s ease-out ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Avatar Component ───────────────────────────────────────────
function Avatar({ name, flameLevel, size = 40 }: { name: string; flameLevel: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: getAvatarColor(flameLevel),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 700,
        fontSize: size * 0.35,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Podium Card ────────────────────────────────────────────────
function PodiumCard({ entry, rank }: { entry: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const isGold = rank === 1
  const isSilver = rank === 2

  const configs = {
    1: {
      width: 200, avatarSize: 72,
      bg: "linear-gradient(135deg, #FEF3C7, #FDE68A, #F59E0B)",
      border: "#F59E0B", shadow: "0 8px 32px rgba(245,158,11,0.4)",
      ringColor: "#F59E0B", ringWidth: 3,
      medal: "👑", podiumH: 80,
      podiumBg: "linear-gradient(180deg, #FDE68A, #F59E0B)",
      pointColor: "#92400E",
      anim: "podiumDropBounce 500ms ease-out 200ms both",
    },
    2: {
      width: 176, avatarSize: 60,
      bg: "linear-gradient(135deg, #F8FAFC, #F1F5F9)",
      border: "#CBD5E1", shadow: "0 4px 16px rgba(0,0,0,0.08)",
      ringColor: "#94A3B8", ringWidth: 2,
      medal: "🥈", podiumH: 56,
      podiumBg: "linear-gradient(180deg, #E2E8F0, #94A3B8)",
      pointColor: "#475569",
      anim: "podiumSlideLeft 300ms ease-out 100ms both",
    },
    3: {
      width: 176, avatarSize: 60,
      bg: "linear-gradient(135deg, #FFF7ED, #FED7AA)",
      border: "#FB923C", shadow: "0 4px 16px rgba(251,146,60,0.2)",
      ringColor: "#FB923C", ringWidth: 2,
      medal: "🥉", podiumH: 40,
      podiumBg: "linear-gradient(180deg, #FED7AA, #FB923C)",
      pointColor: "#9A3412",
      anim: "podiumSlideRight 300ms ease-out both",
    },
  }

  const c = configs[rank]

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: c.anim,
        cursor: "pointer",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: c.width,
          background: c.bg,
          border: `2px solid ${c.border}`,
          borderRadius: 16,
          padding: "20px 16px",
          textAlign: "center" as const,
          boxShadow: c.shadow,
          position: "relative",
          transition: "transform 200ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {/* Confetti for rank 1 */}
        {isGold && <ConfettiParticles />}

        {/* Medal / Crown */}
        <div style={{
          fontSize: isGold ? 32 : 24,
          marginBottom: 8,
          ...(isGold ? { animation: "crownFloat 2s ease-in-out infinite" } : {}),
        }}>
          {c.medal}
        </div>

        {/* Avatar */}
        <div style={{
          margin: "0 auto 8px",
          width: c.avatarSize + c.ringWidth * 2 + 4,
          height: c.avatarSize + c.ringWidth * 2 + 4,
          borderRadius: "50%",
          border: `${c.ringWidth}px solid ${c.ringColor}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <Avatar name={entry.name} flameLevel={entry.flameLevel} size={c.avatarSize} />
        </div>

        {/* Name */}
        <div style={{ fontSize: isGold ? 16 : 14, fontWeight: 600, color: "#1E293B", marginBottom: 4 }}>
          {entry.name}
        </div>

        {/* Flame level */}
        <div style={{ fontSize: 12, marginBottom: 6 }}>
          {getFlameEmojis(entry.flameLevel)}
        </div>

        {/* Points */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: isGold ? 24 : 20,
          fontWeight: 700,
          color: c.pointColor,
          marginBottom: 4,
        }}>
          {entry.points} pts
        </div>

        {/* Streak */}
        <div style={{ fontSize: 13, color: "#64748B" }}>
          🔥 {entry.currentStreak} days
        </div>
      </div>

      {/* Podium Bar */}
      <div style={{
        width: c.width - 32,
        height: c.podiumH,
        background: c.podiumBg,
        borderRadius: "0 0 8px 8px",
        marginTop: -2,
      }} />
    </div>
  )
}

// ─── Rankings Table Row ─────────────────────────────────────────
function RankingRow({ entry, isCurrentUser }: { entry: LeaderboardEntry; isCurrentUser: boolean }) {
  const isTop3 = entry.rank <= 3
  const medals = ["", "🥇", "🥈", "🥉"]

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr 80px 120px 100px 90px 130px",
        alignItems: "center",
        height: 64,
        padding: "0 20px",
        borderBottom: "1px solid #F1F5F9",
        background: isCurrentUser ? "#EFF6FF" : "transparent",
        borderLeft: isCurrentUser ? "3px solid #4F8EF7" : "3px solid transparent",
        transition: "background 150ms ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => { if (!isCurrentUser) e.currentTarget.style.background = "#F8FAFC" }}
      onMouseLeave={(e) => { if (!isCurrentUser) e.currentTarget.style.background = "transparent" }}
    >
      {/* Rank */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <span style={{
          fontSize: isTop3 ? 18 : entry.rank <= 10 ? 16 : 14,
          fontWeight: isTop3 ? 400 : entry.rank <= 10 ? 700 : 400,
          color: entry.rank > 10 ? "#64748B" : "#1E293B",
        }}>
          {isTop3 ? medals[entry.rank] : entry.rank}
        </span>
        {entry.rankChange !== 0 && (
          <span style={{
            fontSize: 11,
            color: entry.rankChange > 0 ? "#34D399" : "#EF4444",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}>
            {entry.rankChange > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {Math.abs(entry.rankChange)}
          </span>
        )}
        {entry.rankChange === 0 && (
          <Minus size={10} style={{ color: "#CBD5E1" }} />
        )}
      </div>

      {/* Student */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Avatar name={entry.name} flameLevel={entry.flameLevel} size={40} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>
            {entry.name}
            {isCurrentUser && <span style={{ color: "#4F8EF7", fontWeight: 600, marginLeft: 6 }}>(You)</span>}
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8" }}>@{entry.username}</div>
        </div>
      </div>

      {/* Streak */}
      <div style={{
        fontSize: 13,
        color: entry.currentStreak >= 7 ? "#F97316" : "#64748B",
        fontWeight: entry.currentStreak >= 7 ? 600 : 400,
      }}>
        🔥 {entry.currentStreak}d
      </div>

      {/* Flame Level */}
      <div style={{ fontSize: 12 }}>
        {getFlameEmojis(entry.flameLevel)}
        <span style={{ marginLeft: 4, color: "#64748B" }}>{entry.flameLevel.replace(" Flame", "")}</span>
      </div>

      {/* Points */}
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          fontWeight: 700,
          color: "#1E293B",
        }}>
          {entry.points}
        </div>
        <div style={{
          fontSize: 11,
          color: entry.pointsToday > 0 ? "#34D399" : "#94A3B8",
        }}>
          {entry.pointsToday > 0 ? `↑ +${entry.pointsToday} today` : "→ 0 today"}
        </div>
      </div>

      {/* Uploads */}
      <div style={{ fontSize: 12, color: "#64748B" }}>
        {entry.uploads} uploads
      </div>

      {/* Badge */}
      <div>
        {entry.badge && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            padding: "3px 10px",
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            backgroundColor: `${entry.badge.color}18`,
            color: entry.badge.color,
            border: `1px solid ${entry.badge.color}30`,
          }}>
            {entry.badge.emoji} {entry.badge.label}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────
export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("week")
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(MOCK_STUDENTS)
  const [myRank, setMyRank] = useState<MyRank | null>(MOCK_MY_RANK)
  const [totalStudents, setTotalStudents] = useState(847)
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 })
  const [hofOpen, setHofOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Fetch leaderboard data
  const fetchLeaderboard = useCallback(async (p: Period) => {
    try {
      const res = await fetch(`/api/leaderboard?period=${p}`)
      if (res.ok) {
        const data = await res.json()
        if (data.leaderboard && data.leaderboard.length > 0) {
          setLeaderboard(data.leaderboard)
          setMyRank(data.myRank)
          setTotalStudents(data.totalStudents || 847)
        }
      }
    } catch {
      // Use mock data on error
    }
  }, [])

  useEffect(() => {
    fetchLeaderboard(period)
    setLoaded(true)
  }, [period, fetchLeaderboard])

  // Countdown timer
  useEffect(() => {
    function update() {
      const now = new Date()
      const target = getNextMonday()
      const diff = Math.max(0, target.getTime() - now.getTime())
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown({ d, h, m, s })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  const top3 = leaderboard.slice(0, 3)
  const periodLabels: Record<Period, string> = { week: "This Week", month: "This Month", all: "All Time" }

  if (!loaded) return null

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>

      {/* ── Section A: Page Header ────────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <h1 className="font-display" style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#0F1117",
            margin: 0,
          }}>
            🏆 Campus Leaderboard
          </h1>
          <p style={{ fontSize: 14, color: "#64748B", margin: "6px 0 0" }}>
            Top students ranked by flame score and streak activity
          </p>
        </div>

        <div style={{ textAlign: "right" as const }}>
          {/* Period Toggle */}
          <div style={{
            display: "inline-flex",
            borderRadius: 8,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
          }}>
            {(["week", "month", "all"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "8px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "none",
                  outline: "none",
                  transition: "all 200ms ease",
                  backgroundColor: period === p ? "#4F8EF7" : "#F8FAFC",
                  color: period === p ? "#fff" : "#64748B",
                }}
              >
                {periodLabels[p]}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 8 }}>
            Updates every 5 minutes • {totalStudents} students
          </div>
        </div>
      </div>

      {/* ── Section B: Top 3 Podium ───────────────────────────── */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 24,
        marginBottom: 40,
        padding: "20px 0 0",
        flexWrap: "wrap",
      }}>
        {/* Order: 2nd, 1st, 3rd for visual podium */}
        {top3.length >= 3 && (
          <>
            <PodiumCard entry={top3[1]} rank={2} />
            <PodiumCard entry={top3[0]} rank={1} />
            <PodiumCard entry={top3[2]} rank={3} />
          </>
        )}
      </div>

      {/* ── Section C: Your Rank Card ─────────────────────────── */}
      {myRank && myRank.rank > 15 && (
        <div style={{
          background: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 12,
          padding: "16px 20px",
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B", marginBottom: 12 }}>
            📊 Your Current Rank
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 20,
              fontWeight: 700,
              color: "#4F8EF7",
            }}>
              #{myRank.rank}
            </span>
            <Avatar name={myRank.name} flameLevel={myRank.flameLevel} size={36} />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1E293B" }}>{myRank.name}</span>
            <span style={{ fontSize: 13, color: "#F97316" }}>🔥{myRank.currentStreak}d</span>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              fontWeight: 700,
              color: "#1E293B",
            }}>
              {myRank.points}pts
            </span>
          </div>
          <div style={{ fontSize: 12, marginTop: 2, color: "#64748B" }}>
            {getFlameEmojis(myRank.flameLevel)} {myRank.flameLevel}
          </div>
          {myRank.gapToTop15 > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, color: "#4F8EF7", fontWeight: 600 }}>
                <TrendingUp size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />
                ↑ {myRank.gapToTop15} pts to reach rank #15
              </div>
              <div style={{ fontSize: 12, color: "#64748B", fontStyle: "italic", marginTop: 4 }}>
                Upload {Math.ceil(myRank.gapToTop15 / 5)} more files this week to climb up
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section D: Full Rankings Table ────────────────────── */}
      <div style={{
        background: "#fff",
        borderRadius: 16,
        border: "1px solid rgba(0,0,0,0.08)",
        overflow: "hidden",
        marginBottom: 32,
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "60px 1fr 80px 120px 100px 90px 130px",
          alignItems: "center",
          height: 44,
          padding: "0 20px",
          background: "#F8FAFC",
          borderBottom: "1px solid #E2E8F0",
        }}>
          {["Rank", "Student", "Streak", "Flame Level", "Points", "Uploads", "Badge"].map(h => (
            <div key={h} style={{
              fontSize: 11,
              textTransform: "uppercase" as const,
              letterSpacing: "0.05em",
              color: "#94A3B8",
              fontWeight: 600,
            }}>
              {h}
            </div>
          ))}
        </div>

        {/* Rows */}
        {leaderboard.map((entry) => (
          <RankingRow
            key={entry.userId}
            entry={entry}
            isCurrentUser={myRank ? entry.userId === myRank.userId : false}
          />
        ))}

        {/* Current user row if not in top 15 */}
        {myRank && myRank.rank > 15 && (
          <>
            <div style={{
              textAlign: "center" as const,
              padding: "8px 0",
              color: "#94A3B8",
              fontSize: 18,
              letterSpacing: 4,
            }}>
              •••
            </div>
            <RankingRow
              entry={{
                rank: myRank.rank,
                userId: myRank.userId,
                name: myRank.name,
                username: myRank.username,
                avatar: myRank.avatar,
                currentStreak: myRank.currentStreak,
                flameLevel: myRank.flameLevel,
                flameScore: myRank.flameScore,
                points: myRank.points,
                pointsToday: 0,
                uploads: myRank.uploads,
                badge: null,
                rankChange: 0,
              }}
              isCurrentUser={true}
            />
          </>
        )}
      </div>

      {/* ── Section E: Weekly Reset Countdown ─────────────────── */}
      <div style={{
        background: "#1E293B",
        borderRadius: 12,
        padding: "20px 28px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#4F8EF7",
              animation: "countdownPulse 1.5s ease-in-out infinite",
              display: "inline-block",
            }} />
            <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
              ⏱️ Weekly Reset in
            </span>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 24,
            fontWeight: 700,
            color: "#fff",
            display: "flex",
            gap: 4,
          }}>
            <span>{countdown.d}<span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>d</span></span>
            <span style={{ color: "#475569" }}>:</span>
            <span>{String(countdown.h).padStart(2, "0")}<span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>h</span></span>
            <span style={{ color: "#475569" }}>:</span>
            <span>{String(countdown.m).padStart(2, "0")}<span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>m</span></span>
            <span style={{ color: "#475569" }}>:</span>
            <span>{String(countdown.s).padStart(2, "0")}<span style={{ fontSize: 11, color: "#94A3B8", fontWeight: 400 }}>s</span></span>
          </div>
          <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
            Rankings reset every Monday 12:00 AM
          </div>
        </div>
        <button
          onClick={() => setHofOpen(!hofOpen)}
          style={{
            background: "transparent",
            border: "1px solid #334155",
            borderRadius: 8,
            padding: "8px 16px",
            color: "#4F8EF7",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#4F8EF7" }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155" }}
        >
          View Last Week&apos;s Winners →
        </button>
      </div>

      {/* ── Section F: Hall of Fame ───────────────────────────── */}
      <div style={{
        marginBottom: 40,
        borderRadius: 12,
        border: "1px solid #FDE68A",
        overflow: "hidden",
        transition: "all 300ms ease",
      }}>
        <button
          onClick={() => setHofOpen(!hofOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            background: hofOpen ? "#FFFBEB" : "#FFFDF5",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: "#1E293B",
          }}
        >
          <span>🏛️ Last Week&apos;s Hall of Fame</span>
          {hofOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {hofOpen && (
          <div style={{
            padding: "16px 20px 20px",
            background: "#FFFBEB",
            borderTop: "1px solid #FDE68A",
          }}>
            <div style={{
              fontSize: 12,
              color: "#92400E",
              marginBottom: 16,
              fontWeight: 500,
            }}>
              Week of March 7–13, 2026
            </div>

            {[
              { medal: "🥇", name: "Mayank Thakur", pts: 312, streak: 7 },
              { medal: "🥈", name: "Vedant Singh", pts: 278, streak: 7 },
              { medal: "🥉", name: "Kartik Sharma", pts: 241, streak: 5 },
            ].map((w) => (
              <div
                key={w.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 0",
                  borderBottom: "1px solid #FDE68A50",
                }}
              >
                <span style={{ fontSize: 20 }}>{w.medal}</span>
                <span style={{ fontWeight: 600, fontSize: 14, color: "#1E293B", flex: 1 }}>{w.name}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#92400E",
                }}>
                  {w.pts} pts
                </span>
                <span style={{ fontSize: 12, color: "#B45309" }}>
                  🔥 {w.streak}d streak
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
