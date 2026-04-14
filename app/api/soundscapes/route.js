import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase
    .from('soundscapes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { title, tag, image, volumes, active_sounds } = body

    const { data, error } = await supabase
      .from('soundscapes')
      .insert([
        { title, tag, image, volumes, active_sounds }
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
