import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let baby = await prisma.baby.findFirst();
    if (!baby) {
      baby = await prisma.baby.create({
        data: {
          name: '宝宝',
          birthday: new Date().toISOString().split('T')[0],
          gender: 'unknown',
        },
      });
    }
    return NextResponse.json(baby);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch baby info' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    let baby = await prisma.baby.findFirst();
    if (baby) {
      baby = await prisma.baby.update({
        where: { id: baby.id },
        data,
      });
    } else {
      baby = await prisma.baby.create({ data });
    }
    return NextResponse.json(baby);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save baby info' }, { status: 500 });
  }
}
