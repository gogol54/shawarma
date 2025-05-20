import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/prisma'; // ajuste esse import se necessário

export async function GET() {
  const hours = await db.openingHours.findMany({
    orderBy: { dayOfWeek: 'asc' },
  });
  return NextResponse.json(hours);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length !== 7) {
      return NextResponse.json({ message: 'Formato inválido' }, { status: 400 });
    }

    await db.openingHours.deleteMany();
    await db.openingHours.createMany({ data: body });

    return NextResponse.json({ message: 'Horários atualizados com sucesso' });
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao atualizar horários', error }, { status: 500 });
  }
}
