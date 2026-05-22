import { NextRequest, NextResponse } from "next/server";
import { createToken, loginCustomer, setCustomerSessionCookie } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  identifier: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = schema.parse(await req.json());
    const user = await loginCustomer(identifier, password);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid customer credentials. Admins must use /admin/login." },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    });

    await setCustomerSessionCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        username: user.username,
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
