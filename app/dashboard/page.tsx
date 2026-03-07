import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const displayName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Student"

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">CC</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground font-mono">
              Campus Connect
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary ring-2 ring-border">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm font-medium text-foreground sm:inline">
                {displayName}
              </span>
            </div>
            <SignOutButton />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl text-center">
          <div className="rounded-2xl border border-border bg-card p-12 shadow-lg shadow-primary/5">
            <div className="flex flex-col items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary ring-4 ring-primary/20">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Welcome, {displayName}! 🎓
                </h1>
                <p className="mt-2 text-muted-foreground">
                  You&apos;re signed in to Campus Connect
                </p>
              </div>

              <div className="mt-6 w-full rounded-xl border border-border bg-muted/50 p-6 text-left">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Account Details
                </h2>
                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="text-sm font-medium text-foreground">{user.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Provider</dt>
                    <dd className="text-sm font-medium text-foreground capitalize">
                      {user.app_metadata?.provider || "email"}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Member since</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
