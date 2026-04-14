import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

const soundscapeSchema = z.object({
  title: z.string().min(1).max(100),
  tag: z.string().max(50).default('Custom'),
  image: z.string().url().max(1000),
  volumes: z.record(z.string(), z.number().min(0).max(100)),
  active_sounds: z.array(z.string()).max(50),
})

export async function GET() {
  const { data, error } = await supabase
    .from('soundscapes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Database fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = soundscapeSchema.parse(body)
    const { title, tag, image, volumes, active_sounds } = validatedData

    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized')
    }

    const { data, error } = await supabaseAdmin
      .from('soundscapes')
      .insert([
        { title, tag, image, volumes, active_sounds }
      ])
      .select()

    if (error) {
      console.error('Database insert error:', error)
      throw new Error('Database insertion failed')
    }

    return NextResponse.json(data[0])
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: err.errors }, { status: 400 })
    }
    console.error('API Error:', err.message)
    return NextResponse.json({ error: 'Failed to save soundscape' }, { status: 500 })
  }
}
