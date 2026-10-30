import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-build-key',
})

export const AI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'
