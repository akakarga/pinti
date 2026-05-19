export type CsvRow = Record<string, string | number | boolean>

function normalizeCell(value: string) {
  return value.trim().replace(/^\uFEFF/, '')
}

function parseValue(value: string): string | number | boolean {
  const normalized = normalizeCell(value)
  const lowerValue = normalized.toLowerCase()

  if (lowerValue === 'true') {
    return true
  }

  if (lowerValue === 'false') {
    return false
  }

  const looksNumeric = /^-?(0|[1-9]\d*)([.,]\d+)?$/.test(normalized)
  const numberValue = looksNumeric ? Number(normalized.replace(',', '.')) : Number.NaN

  if (Number.isFinite(numberValue)) {
    return numberValue
  }

  return normalized
}

function parseCsvRecords(text: string): {
  records: string[][]
  warnings: string[]
} {
  const records: string[][] = []
  const warnings: string[] = []
  let record: string[] = []
  let cell = ''
  let insideQuotes = false
  let rowNumber = 1

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const nextCharacter = text[index + 1]

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        cell += '"'
        index += 1
        continue
      }

      insideQuotes = !insideQuotes
      continue
    }

    if (character === ',' && !insideQuotes) {
      record.push(cell)
      cell = ''
      continue
    }

    if ((character === '\n' || character === '\r') && !insideQuotes) {
      record.push(cell)
      cell = ''

      const hasValue = record.some((value) => normalizeCell(value) !== '')
      if (hasValue) {
        records.push(record)
      }

      record = []

      if (character === '\r' && nextCharacter === '\n') {
        index += 1
      }

      rowNumber += 1
      continue
    }

    cell += character
  }

  if (insideQuotes) {
    warnings.push(`${rowNumber}. satırda kapanmamış tırnak işareti olabilir.`)
  }

  if (cell !== '' || record.length > 0) {
    record.push(cell)

    const hasValue = record.some((value) => normalizeCell(value) !== '')
    if (hasValue) {
      records.push(record)
    }
  }

  return { records, warnings }
}

export function parseCsv(text: string): {
  rows: CsvRow[]
  warnings: string[]
} {
  const { records, warnings } = parseCsvRecords(text)

  if (records.length === 0) {
    return {
      rows: [],
      warnings: ['CSV dosyası boş görünüyor.'],
    }
  }

  const headers = records[0].map((header) => normalizeCell(header))

  if (headers.length === 0 || headers.some((header) => header === '')) {
    return {
      rows: [],
      warnings: ['CSV header satırı okunamadı.'],
    }
  }

  const duplicateHeaders = headers.filter(
    (header, index) => headers.indexOf(header) !== index,
  )

  if (duplicateHeaders.length > 0) {
    warnings.push(
      `Tekrar eden header bulundu: ${Array.from(new Set(duplicateHeaders)).join(', ')}.`,
    )
  }

  const rows = records.slice(1).map((cells, index) => {
    const rowNumber = index + 2

    if (cells.length !== headers.length) {
      warnings.push(
        `${rowNumber}. satır header sayısıyla eşleşmiyor; eksik alanlar boş kabul edildi, fazla alanlar yok sayıldı.`,
      )
    }

    const row: CsvRow = {}
    headers.forEach((header, cellIndex) => {
      row[header] = parseValue(cells[cellIndex] ?? '')
    })

    return row
  })

  return { rows, warnings }
}
