import { Router } from 'express'
import { storagePaths } from '../services/datasetStorage.service.ts'

export const healthRoutes = Router()

healthRoutes.get('/', (_request, response) => {
  response.json({
    ok: true,
    service: 'pinti-local-api',
    mode: 'zero-budget-local-demo',
    uptimeSeconds: Math.round(process.uptime()),
    storage: {
      uploads: storagePaths.uploadsDir,
      analyses: storagePaths.analysesDir,
    },
  })
})
