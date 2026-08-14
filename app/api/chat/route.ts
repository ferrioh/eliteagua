import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText } from 'ai'

export const maxDuration = 60

export async function POST(request: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response('Error: falta GOOGLE_GENERATIVE_AI_API_KEY. Agrégala en Vercel → Settings → Environment Variables y haz Redeploy.', { status: 500 })
  }

  const { messages } = await request.json()

  const result = streamText({
    model: google('gemini-3.1-flash-lite'),
    system: 'Eres el asistente de Agua Elite. Responde en español, de forma breve, amable y útil. Ayuda a elegir agua mineral y orienta sobre el catálogo. No inventes precios, stock ni políticas.',
    messages: await convertToModelMessages(messages ?? []),
  })

  return result.toUIMessageStreamResponse()
}