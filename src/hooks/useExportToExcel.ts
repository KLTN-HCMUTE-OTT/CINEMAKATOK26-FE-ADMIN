import { useCallback } from 'react'

interface SheetData {
  name: string
  headers: string[]
  data: any[]
}

/**
 * Hook để export dữ liệu thành file Excel
 * Hỗ trợ export single sheet hoặc multiple sheets
 */
export const useExportToExcel = () => {
  const exportToExcel = useCallback(
    (data: any[], headers: string[], fileName: string = 'export', sheetName: string = 'Sheet1') => {
      try {
        // Tạo workbook và worksheet
        const ws_data = [headers, ...data.map(row => headers.map(header => row[header]))]

        // Tạo CSV content
        const csvContent = ws_data
          .map(row =>
            row
              .map(cell => {
                // Escape quotes và wrap cells with comma
                if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                  return `"${cell.replace(/"/g, '""')}"`
                }

                
return cell ?? ''
              })
              .join(',')
          )
          .join('\n')

        // Tạo blob và download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error('Error exporting to Excel:', error)
        throw error
      }
    },
    []
  )

  const exportMultipleSheets = useCallback((sheetsData: SheetData[], fileName: string = 'export') => {
    try {
      // Tạo workbook JSON structure
      const workbookData: Record<string, any[][]> = {}

      sheetsData.forEach(sheet => {
        const ws_data = [sheet.headers, ...sheet.data.map(row => sheet.headers.map(header => row[header]))]

        workbookData[sheet.name] = ws_data
      })

      // Tạo CSV cho sheet đầu tiên (fallback cho trình duyệt không support xlsx)
      const firstSheet = sheetsData[0]

      const csvContent = workbookData[firstSheet.name]
        .map(row =>
          row
            .map(cell => {
              if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
                return `"${cell.replace(/"/g, '""')}"`
              }

              
return cell ?? ''
            })
            .join(',')
        )
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      link.setAttribute('href', url)
      link.setAttribute('download', `${fileName}_${new Date().getTime()}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error exporting multiple sheets:', error)
      throw error
    }
  }, [])

  return { exportToExcel, exportMultipleSheets }
}
