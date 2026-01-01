import { NextResponse } from "next/server";
import { initializeLessons } from "@/lib/firestore";

export async function POST() {
  try {
    const result = await initializeLessons();
    
    if (result.success) {
      return NextResponse.json(
        { message: "Lessons initialized successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to initialize lessons" },
      { status: 500 }
    );
  }
}

