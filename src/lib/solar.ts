// Solar Pro API 유틸리티

interface SolarMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface SolarChatRequest {
  model: string
  messages: SolarMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
}

interface SolarChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class SolarAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message)
    this.name = 'SolarAPIError'
  }
}

export async function callSolarAPI(
  messages: SolarMessage[],
  options: {
    temperature?: number
    max_tokens?: number
    top_p?: number
    timeout?: number
  } = {}
): Promise<string> {
  const apiKey = process.env.UPSTAGE_API_KEY

  if (!apiKey) {
    throw new SolarAPIError('UPSTAGE_API_KEY is not configured')
  }

  const requestBody: SolarChatRequest = {
    model: 'solar-pro',
    messages,
    temperature: options.temperature ?? 0.3,
    max_tokens: options.max_tokens ?? 4096,
    top_p: options.top_p ?? 0.9,
  }

  const timeoutMs = options.timeout ?? 30000 // 기본 30초

  try {
    // 타임아웃이 있는 fetch
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const response = await fetch('https://api.upstage.ai/v1/solar/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new SolarAPIError(
        `Solar API request failed: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    const data: SolarChatResponse = await response.json()

    if (!data.choices || data.choices.length === 0) {
      throw new SolarAPIError('No response from Solar API')
    }

    const content = data.choices[0].message.content

    // 응답 길이 확인
    if (!content || content.trim().length === 0) {
      throw new SolarAPIError('Empty response from Solar API')
    }

    return content
  } catch (error) {
    if (error instanceof SolarAPIError) {
      throw error
    }

    // AbortError (타임아웃)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new SolarAPIError(`API 요청 시간 초과 (${timeoutMs / 1000}초)`)
    }

    if (error instanceof Error) {
      throw new SolarAPIError(`Solar API call failed: ${error.message}`)
    }

    throw new SolarAPIError('Unknown error occurred while calling Solar API')
  }
}
