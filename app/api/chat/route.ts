import { google } from '@ai-sdk/google'
import { convertToModelMessages, streamText } from 'ai'

export async function POST(request: Request) {
  const { messages } = await request.json()

  const result = streamText({
    model: google('gemini-3.6-flash'),
    system: 'Eres el asistente de Agua Elite. Responde en español, de forma breve, amable y útil. Ayuda a elegir agua mineral y orienta sobre el catálogo. No inventes precios, stock ni políticas.',
    messages: await convertToModelMessages(messages ?? []),
  })

  return result.toUIMessageStreamResponse()
}