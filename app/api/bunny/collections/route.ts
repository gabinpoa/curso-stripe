import { getUser } from "@/lib/db/queries";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const libraryId = searchParams.get("libraryId");

    if (!libraryId) {
      return NextResponse.json(
        { error: "Library ID is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://video.bunnycdn.com/library/${libraryId}/collections`,
      {
        headers: {
          Accept: "application/json",
          AccessKey: process.env.BUNNY_ACCESS_KEY!,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch collections: ${errorText}` },
        { status: response.status }
      );
    }

    const collections = await response.json();
    return NextResponse.json(collections.items || []);
  } catch (error) {
    console.error("Error fetching BunnyNet collections:", error);
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}
