import { cerebras } from '@ai-sdk/cerebras'
import { google } from '@ai-sdk/google'
import { convertToModelMessages, createUIMessageStreamResponse, streamText } from 'ai'
import type { UIMessageChunk } from 'ai'

export const maxDuration = 60

const SYSTEM_PROMPT = 'Eres el asistente de Agua Elite. Responde en español, de forma breve, amable y útil. Ayuda a elegir agua mineral y orienta sobre el catálogo. No inventes precios, stock ni políticas.'

function buildProviders(messages: NonNullable<Parameters<typeof streamText>[0]['messages']>) {
  const providers: Array<() => ReturnType<typeof streamText>> = []
  if (process.env.CEREBRAS_API_KEY) providers.push(() => streamText({ model: cerebras('gpt-oss-120b'), system: SYSTEM_PROMPT, messages }))
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) providers.push(() => streamText({ model: google('gemini-3.6-flash'), system: SYSTEM_PROMPT, messages }))
  return providers
}

function createFallbackStream(providers: Array<() => ReturnType<typeof streamText>>): ReadableStream<UIMessageChunk> {
  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      for (let i = 0; i < providers.length; i++) {
        const reader = providers[i]().toUIMessageStream().getReader()
        let started = false
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            started = true
            controller.enqueue(value)
          }
          controller.close()
          return
        } catch (error) {
          if (started || i === providers.length - 1) {
            controller.error(error)
            return
          }
        }
      }
    },
  })
}

export async function POST(request: Request) {
  const { messages } = await request.json()

  const providers = buildProviders(await convertToModelMessages(messages ?? []))
  if (providers.length === 0) {
    return new Response('Error: no hay ninguna API de IA configurada. Agrega CEREBRAS_API_KEY o GOOGLE_GENERATIVE_AI_API_KEY en Vercel → Settings → Environment Variables y haz Redeploy.', { status: 500 })
  }

  return createUIMessageStreamResponse({ stream: createFallbackStream(providers) })
}