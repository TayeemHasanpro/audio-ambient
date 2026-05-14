import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { z } from 'zod'

const soundscapeSchema = z.object({
  title: z.string().min(1).max(100),
  tag: z.string().max(50).default('Custom'),
  image: z.string().url().max(1000),
  volumes: z.record(z.string(), z.number().min(0).max(100)),
  active_sounds: z.array(z.string()).max(50),
})

export async function GET() {
  try {
    const snapshot = await db
      .collection('soundscapes')
      .orderBy('created_at', 'desc')
      .get()

    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Database fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = soundscapeSchema.parse(body)
    const { title, tag, image, volumes, active_sounds } = validatedData

    const docRef = await db.collection('soundscapes').add({
      title,
      tag,
      image,
      volumes,
      active_sounds,
      created_at: new Date().toISOString(),
    })

    const newDoc = await docRef.get()

    return NextResponse.json({ id: docRef.id, ...newDoc.data() })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: err.errors }, { status: 400 })
    }
    console.error('API Error:', err.message)
    return NextResponse.json({ error: 'Failed to save soundscape' }, { status: 500 })
  }
}
