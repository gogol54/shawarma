import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token não fornecido" }, { status: 400 });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ valid: true, payload });
  } catch (err) {
    console.log(err)
    return NextResponse.json({ valid: false, error: "Token inválido: Expirou o tempo de validação!"}, { status: 401 });
  }
}
