import { NextRequest, NextResponse } from "next/server";
import { createToken, loginAdmin, setAdminSessionCookie } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = schema.parse(await req.json());
    const user = await loginAdmin(identifier, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid admin credentials. Use the admin portal only." },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    });

    await setAdminSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        username: user.username,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
