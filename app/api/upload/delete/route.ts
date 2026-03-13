import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { deleteS3Object, S3_BUCKET } from "@/lib/s3"

// DELETE /api/upload/delete — delete one or more uploaded files
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { noteIds } = body as { noteIds: string[] }

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required field: noteIds (array of note IDs)" },
        { status: 400 }
      )
    }

    // Find the current user in DB
    const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Fetch the notes that belong to this user
    const notes = await prisma.note.findMany({
      where: {
        id: { in: noteIds },
        uploadedById: dbUser.id,
      },
    })

    if (notes.length === 0) {
      return NextResponse.json(
        { error: "No matching files found or you don't own these files" },
        { status: 404 }
      )
    }

    // Delete from S3 and DB
    const deletedIds: string[] = []
    const errors: string[] = []

    for (const note of notes) {
      try {
        // Try to delete from S3 (don't block DB deletion if S3 fails)
        if (note.fileUrl) {
          try {
            // Extract the S3 key from the URL — handles multiple formats:
            // https://bucket.s3.amazonaws.com/key
            // https://bucket.s3.region.amazonaws.com/key
            const url = new URL(note.fileUrl)
            const s3Key = url.pathname.startsWith("/")
              ? url.pathname.slice(1)
              : url.pathname
            if (s3Key) {
              await deleteS3Object(s3Key)
            }
          } catch (s3Err) {
            console.warn(`S3 delete failed for note ${note.id}, continuing with DB delete:`, s3Err)
          }
        }

        // Delete associated bookmarks first (foreign key constraint)
        await prisma.bookmark.deleteMany({ where: { noteId: note.id } })

        // Delete the note record
        await prisma.note.delete({ where: { id: note.id } })

        deletedIds.push(note.id)
      } catch (err: any) {
        console.error(`Failed to delete note ${note.id}:`, err)
        errors.push(note.id)
      }
    }

    return NextResponse.json({
      deleted: deletedIds,
      errors,
      message: `${deletedIds.length} file(s) deleted successfully${errors.length > 0 ? `, ${errors.length} failed` : ""}`,
    })
  } catch (error: any) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete files", details: error.message },
      { status: 500 }
    )
  }
}
