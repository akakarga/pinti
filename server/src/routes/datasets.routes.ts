import { Router } from 'express'
import { extractDatasetPayload } from '../schemas/dataset.schema.ts'
import { saveDatasetUpload } from '../services/datasetStorage.service.ts'
import { validatePintiDatasetPayload } from '../services/datasetValidation.service.ts'

export const datasetsRoutes = Router()

datasetsRoutes.post('/validate', (request, response) => {
  const { dataset } = extractDatasetPayload(request.body)
  const { validation } = validatePintiDatasetPayload(dataset)

  response.json({
    ok: validation.isValid,
    validation,
  })
})

datasetsRoutes.post('/upload', async (request, response, next) => {
  try {
    const { dataset: rawDataset, fileName } = extractDatasetPayload(request.body)
    const { dataset, validation } = validatePintiDatasetPayload(rawDataset)

    if (!dataset || !validation.isValid) {
      response.status(422).json({
        ok: false,
        message: 'Dataset doğrulanamadı; upload kaydedilmedi.',
        validation,
      })
      return
    }

    const storedDataset = await saveDatasetUpload(dataset, validation, fileName)

    response.status(201).json({
      ok: true,
      datasetId: storedDataset.datasetId,
      sourceDatasetId: storedDataset.sourceDatasetId,
      uploadedAt: storedDataset.uploadedAt,
      validation: storedDataset.validation,
    })
  } catch (error) {
    next(error)
  }
})
