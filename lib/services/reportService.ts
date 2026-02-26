/**
 * Report Service
 * Service for fetching full reports from the external search service
 */

const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:3002/backend/v2'

/**
 * Get full report from external service by responseId
 * @param responseId - The response ID from the search service
 * @returns Full report data
 */
export async function getFullReport(responseId: string): Promise<any> {
  const url = `${SEARCH_SERVICE_URL}/reports/${responseId}`

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(
        `Get report error: ${response.status} ${response.statusText} - ${errorBody}`
      )
    }

    const responseText = await response.text()

    if (
      !responseText.trim().startsWith('{') &&
      !responseText.trim().startsWith('[')
    ) {
      console.error(
        'Response does not appear to be JSON:',
        responseText.substring(0, 200)
      )
      throw new Error('Response is not valid JSON format')
    }

    try {
      const data = JSON.parse(responseText)
      return data
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      console.error(
        'Response text (first 500 chars):',
        responseText.substring(0, 500)
      )

      // Try to clean the response and parse again
      try {
        const cleanedText = responseText
          .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
          .replace(/\uFEFF/g, '')
          .trim()

        const cleanedData = JSON.parse(cleanedText)
        return cleanedData
      } catch (cleanError) {
        console.error('Failed to parse even after cleaning:', cleanError)
      }

      throw new Error(
        `Failed to parse JSON response: ${jsonError instanceof Error ? jsonError.message : 'Unknown error'}`
      )
    }
  } catch (error) {
    console.error('Error getting full report:', error)
    throw error
  }
}
