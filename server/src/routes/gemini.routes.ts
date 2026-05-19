import { Router } from 'express'
import {
  generateGeminiActionSummary,
  testGeminiConnection,
} from '../services/geminiProxy.service.ts'

export const geminiRoutes = Router()

geminiRoutes.post('/test', async (request, response, next) => {
  try {
    const result = await testGeminiConnection(request.body?.apiKey)

    response.status(result.ok ? 200 : 400).json(result)
  } catch (error) {
    next(error)
  }
})

geminiRoutes.post('/action-summary', async (request, response, next) => {
  try {
    const result = await generateGeminiActionSummary(
      request.body?.apiKey,
      request.body?.context ?? null,
    )

    response.status(result.ok ? 200 : 400).json(result)
  } catch (error) {
    next(error)
  }
})
