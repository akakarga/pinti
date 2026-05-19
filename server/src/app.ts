import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { analysisRoutes } from './routes/analysis.routes.ts'
import { datasetsRoutes } from './routes/datasets.routes.ts'
import { geminiRoutes } from './routes/gemini.routes.ts'
import { healthRoutes } from './routes/health.routes.ts'
import { ApiError } from './services/apiError.ts'

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors({ origin: true }))
  app.use(express.json({ limit: '15mb' }))

  app.use('/api/health', healthRoutes)
  app.use('/api/datasets', datasetsRoutes)
  app.use('/api/analysis', analysisRoutes)
  app.use('/api/gemini', geminiRoutes)

  app.use('/api', (_request, response) => {
    response.status(404).json({
      ok: false,
      message: 'API endpoint bulunamadı.',
    })
  })

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    void _next

    if (error instanceof ApiError) {
      response.status(error.statusCode).json({
        ok: false,
        message: error.message,
        details: error.details,
      })
      return
    }

    if (error instanceof SyntaxError) {
      response.status(400).json({
        ok: false,
        message: 'JSON gövdesi okunamadı.',
      })
      return
    }

    console.error(error)
    response.status(500).json({
      ok: false,
      message: 'Beklenmeyen API hatası.',
    })
  }

  app.use(errorHandler)

  return app
}
