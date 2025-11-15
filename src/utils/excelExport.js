import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import { CATEGORIES } from '../constants/customerTypes'

/**
 * Export customers to Excel with separate sheets per category
 * Enhanced with better formatting and visual appeal
 * @param {Array} customers - Array of customer objects
 */
export const exportToExcel = (customers) => {
  // Always allow export - will create all three sheets even if empty
  const customerList = customers || []

  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Group customers by category
  const customersByCategory = {
    [CATEGORIES.B2C]: [],
    [CATEGORIES.B2B]: [],
    [CATEGORIES.BULK]: []
  }

  customerList.forEach(customer => {
    const category = customer.customer_category
    if (customersByCategory[category]) {
      customersByCategory[category].push(customer)
    }
  })

  // Category colors mapping
  const categoryColors = {
    [CATEGORIES.B2C]: { bg: 'E3F2FD', text: '1976D2' },
    [CATEGORIES.B2B]: { bg: 'F3E5F5', text: '7B1FA2' },
    [CATEGORIES.BULK]: { bg: 'FFF3E0', text: 'E65100' }
  }

  // Process each category - Always create all three sheets
  Object.keys(customersByCategory).forEach(category => {
    const categoryCustomers = customersByCategory[category]
    
    // Prepare data for Excel with better formatting
    const excelData = categoryCustomers.length > 0
      ? categoryCustomers.map((customer, index) => ({
          'S.No': index + 1,
          'Name': customer.name || '',
          'Phone': customer.phone || '',
          'Email': customer.email || '',
          'Category': customer.customer_category || '',
          'Type': customer.sub_type || '',
          'Area': customer.area || '',
          'Order Source': customer.order_source || '',
          'Last Order Date': customer.last_order_date 
            ? format(new Date(customer.last_order_date), 'MMM dd, yyyy')
            : 'N/A',
          'Order Count': customer.order_count || 0,
          'Assigned To': customer.assigned_to || '',
          'Status': customer.status || '',
          'Created At': customer.created_at
            ? format(new Date(customer.created_at), 'MMM dd, yyyy HH:mm')
            : ''
        }))
      : []

    // Create worksheet - always start with header row
    const headerRow = [['S.No', 'Name', 'Phone', 'Email', 'Category', 'Type', 'Area', 'Order Source', 'Last Order Date', 'Order Count', 'Assigned To', 'Status', 'Created At']]
    const worksheet = XLSX.utils.aoa_to_sheet(headerRow)

    // Add data rows if there are any customers
    if (excelData.length > 0) {
      XLSX.utils.sheet_add_json(worksheet, excelData, { origin: 'A2', skipHeader: true })
    }

    // Set optimal column widths for better readability
    const columnWidths = [
      { wch: 8 },  // S.No
      { wch: 28 }, // Name
      { wch: 16 }, // Phone
      { wch: 32 }, // Email
      { wch: 12 }, // Category
      { wch: 20 }, // Type
      { wch: 16 }, // Area
      { wch: 18 }, // Order Source
      { wch: 18 }, // Last Order Date
      { wch: 12 }, // Order Count
      { wch: 18 }, // Assigned To
      { wch: 12 }, // Status
      { wch: 22 }  // Created At
    ]
    worksheet['!cols'] = columnWidths

    // Freeze header row
    if (excelData.length > 0) {
      worksheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' }

      // Add auto-filter to header row
      const range = XLSX.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 12, r: 0 } })
      worksheet['!autofilter'] = { ref: range }
    }

    // Always add worksheet to workbook with category name as sheet name
    XLSX.utils.book_append_sheet(workbook, worksheet, category)
  })

  // Add summary sheet
  const summaryData = [
    {
      'Category': 'B2C',
      'Total Customers': customersByCategory[CATEGORIES.B2C].length,
      'Total Orders': customersByCategory[CATEGORIES.B2C].reduce((sum, c) => sum + (c.order_count || 0), 0)
    },
    {
      'Category': 'B2B',
      'Total Customers': customersByCategory[CATEGORIES.B2B].length,
      'Total Orders': customersByCategory[CATEGORIES.B2B].reduce((sum, c) => sum + (c.order_count || 0), 0)
    },
    {
      'Category': 'BULK',
      'Total Customers': customersByCategory[CATEGORIES.BULK].length,
      'Total Orders': customersByCategory[CATEGORIES.BULK].reduce((sum, c) => sum + (c.order_count || 0), 0)
    },
    {
      'Category': 'TOTAL',
      'Total Customers': customerList.length,
      'Total Orders': customerList.reduce((sum, c) => sum + (c.order_count || 0), 0)
    }
  ]

  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  summarySheet['!cols'] = [
    { wch: 15 },
    { wch: 18 },
    { wch: 15 }
  ]
  
  // Insert summary sheet at the beginning
  // Create a new workbook with summary first, then add all category sheets
  const newWorkbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(newWorkbook, summarySheet, 'Summary')
  
  // Add all category sheets in order (B2C, B2B, BULK)
  Object.values(CATEGORIES).forEach(category => {
    // Get the worksheet that was already created
    const sheetNames = workbook.SheetNames
    const sheetIndex = sheetNames.indexOf(category)
    if (sheetIndex !== -1) {
      const worksheet = workbook.Sheets[workbook.SheetNames[sheetIndex]]
      XLSX.utils.book_append_sheet(newWorkbook, worksheet, category)
    }
  })
  
  // Use the new workbook
  const finalWorkbook = newWorkbook

  // Generate filename with timestamp
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  const filename = `customers_export_${timestamp}.xlsx`

  // Write file and trigger download
  XLSX.writeFile(finalWorkbook, filename)
}

