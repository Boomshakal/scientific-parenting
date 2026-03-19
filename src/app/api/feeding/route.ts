import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.feedingRecord.findMany({
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feeding records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const baby = await prisma.baby.findFirst();
    if (!baby) {
      return NextResponse.json({ error: 'No baby found' }, { status: 400 });
    }
    const record = await prisma.feedingRecord.create({
      data: { ...data, babyId: baby.id },
    });
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create feeding record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    await prisma.feedingRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete feeding record' }, { status: 500 });
  }
}
