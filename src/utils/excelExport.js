import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { CATEGORIES } from '../constants/customerTypes'

/**
 * Export customers to Excel with separate sheets per category
 * Enhanced with colors, styling, charts, and statistics
 * @param {Array} customers - Array of customer objects
 */
export const exportToExcel = async (customers) => {
  // Always allow export - will create all three sheets even if empty
  const customerList = customers || []

  // Create a new workbook
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Popcone CRM'
  workbook.created = new Date()
  workbook.modified = new Date()

  // Category colors mapping
  const categoryColors = {
    [CATEGORIES.B2C]: { 
      headerBg: 'E3F2FD', 
      headerText: '1976D2',
      rowBg: 'F5FAFE',
      chartColor: '1976D2'
    },
    [CATEGORIES.B2B]: { 
      headerBg: 'F3E5F5', 
      headerText: '7B1FA2',
      rowBg: 'FAF5FC',
      chartColor: '7B1FA2'
    },
    [CATEGORIES.BULK]: { 
      headerBg: 'FFF3E0', 
      headerText: 'E65100',
      rowBg: 'FFFBF5',
      chartColor: 'E65100'
    }
  }

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

  // Create Summary sheet first with statistics and charts
  const summarySheet = workbook.addWorksheet('Summary', {
    pageSetup: {
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  })

  // Summary title
  summarySheet.mergeCells('A1:D1')
  const titleCell = summarySheet.getCell('A1')
  titleCell.value = 'Customer Export Summary'
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF000000' } }
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' }
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  }
  summarySheet.getRow(1).height = 30

  // Export date
  summarySheet.mergeCells('A2:D2')
  const dateCell = summarySheet.getCell('A2')
  dateCell.value = `Exported on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`
  dateCell.font = { size: 10, italic: true, color: { argb: 'FF666666' } }
  dateCell.alignment = { vertical: 'middle', horizontal: 'center' }
  summarySheet.getRow(2).height = 20

  // Summary table headers
  const summaryHeaders = ['Category', 'Total Customers', 'Total Orders', 'Average Orders per Customer']
  summarySheet.getRow(4).values = summaryHeaders
  const summaryHeaderRow = summarySheet.getRow(4)
  summaryHeaderRow.height = 25
  summaryHeaderRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } }
  summaryHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF333333' }
  }
  summaryHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' }
  summaryHeaderRow.eachCell((cell) => {
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
  })

  // Summary data
  let rowIndex = 5
  const summaryData = []
  Object.values(CATEGORIES).forEach(category => {
    const categoryCustomers = customersByCategory[category]
    const totalCustomers = categoryCustomers.length
    const totalOrders = categoryCustomers.reduce((sum, c) => sum + (c.order_count || 0), 0)
    const avgOrders = totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(2) : 0

    summaryData.push({
      category,
      totalCustomers,
      totalOrders,
      avgOrders: parseFloat(avgOrders)
    })

    const row = summarySheet.getRow(rowIndex)
    const colors = categoryColors[category]
    
    row.values = [category, totalCustomers, totalOrders, avgOrders]
    row.height = 22
    row.font = { size: 11 }
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.rowBg }
    }
    row.alignment = { vertical: 'middle', horizontal: 'center' }
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
      }
      if (colNumber === 1) {
        cell.font = { size: 11, bold: true, color: { argb: colors.headerText } }
      }
      if (colNumber === 3) {
        cell.numFmt = '#,##0'
        cell.font = { size: 11, bold: true }
      }
      if (colNumber === 4) {
        cell.numFmt = '0.00'
      }
    })

    rowIndex++
  })

  // Total row
  const totalRow = summarySheet.getRow(rowIndex)
  totalRow.values = [
    'TOTAL',
    customerList.length,
    customerList.reduce((sum, c) => sum + (c.order_count || 0), 0),
    customerList.length > 0 
      ? (customerList.reduce((sum, c) => sum + (c.order_count || 0), 0) / customerList.length).toFixed(2)
      : 0
  ]
  totalRow.height = 25
  totalRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } }
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF000000' }
  }
  totalRow.alignment = { vertical: 'middle', horizontal: 'center' }
  totalRow.eachCell((cell, colNumber) => {
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }
    if (colNumber === 3) {
      cell.numFmt = '#,##0'
    }
    if (colNumber === 4) {
      cell.numFmt = '0.00'
    }
  })

  // Add Visual Statistics Section with Bar Chart Representation
  if (customerList.length > 0) {
    const chartRow = rowIndex + 3
    
    // Title for statistics section
    summarySheet.mergeCells(`A${chartRow}:D${chartRow}`)
    const chartTitleCell = summarySheet.getCell(`A${chartRow}`)
    chartTitleCell.value = 'Visual Statistics'
    chartTitleCell.font = { bold: true, size: 14, color: { argb: 'FF000000' } }
    chartTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    chartTitleCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    }
    summarySheet.getRow(chartRow).height = 30

    // Add percentage distribution
    const statsRow = chartRow + 2
    summarySheet.mergeCells(`A${statsRow}:D${statsRow}`)
    const statsTitleCell = summarySheet.getCell(`A${statsRow}`)
    statsTitleCell.value = 'Customer Distribution by Category (%)'
    statsTitleCell.font = { bold: true, size: 11 }
    statsTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    summarySheet.getRow(statsRow).height = 22

    // Add percentage data with visual bars
    let statsDataRow = statsRow + 2
    const firstStatsRow = statsDataRow
    const maxCustomers = Math.max(...Object.values(CATEGORIES).map(cat => customersByCategory[cat].length), 1)
    
    Object.values(CATEGORIES).forEach(category => {
      const categoryCustomers = customersByCategory[category]
      const count = categoryCustomers.length
      const percentage = customerList.length > 0 ? ((count / customerList.length) * 100).toFixed(1) : 0
      const colors = categoryColors[category]
      
      // Category name
      const categoryCell = summarySheet.getCell(`A${statsDataRow}`)
      categoryCell.value = category
      categoryCell.font = { bold: true, size: 10, color: { argb: colors.headerText } }
      categoryCell.alignment = { vertical: 'middle', horizontal: 'left' }
      categoryCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      // Count
      const countCell = summarySheet.getCell(`B${statsDataRow}`)
      countCell.value = count
      countCell.font = { size: 10, bold: true }
      countCell.alignment = { vertical: 'middle', horizontal: 'center' }
      countCell.numFmt = '#,##0'
      countCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      // Percentage
      const percentCell = summarySheet.getCell(`C${statsDataRow}`)
      percentCell.value = parseFloat(percentage)
      percentCell.font = { size: 10, bold: true }
      percentCell.alignment = { vertical: 'middle', horizontal: 'center' }
      percentCell.numFmt = '0.0"%"'
      percentCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      // Visual bar value for data bars
      const barCell = summarySheet.getCell(`D${statsDataRow}`)
      barCell.value = count
      barCell.numFmt = '#,##0'
      barCell.font = { size: 10, bold: true, color: { argb: colors.headerText } }
      barCell.alignment = { vertical: 'middle', horizontal: 'center' }
      barCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      summarySheet.getRow(statsDataRow).height = 20
      statsDataRow++
    })
    
    // Add data bar conditional formatting for the entire range
    const lastStatsRow = statsDataRow - 1
    summarySheet.addConditionalFormatting({
      ref: `D${firstStatsRow}:D${lastStatsRow}`,
      rules: [
        {
          type: 'dataBar',
          cfvo: [
            { type: 'min' },
            { type: 'max' }
          ],
          color: { argb: 'FF4472C4' }
        }
      ]
    })

    // Add order statistics
    const orderStatsRow = statsDataRow + 2
    summarySheet.mergeCells(`A${orderStatsRow}:D${orderStatsRow}`)
    const orderStatsTitleCell = summarySheet.getCell(`A${orderStatsRow}`)
    orderStatsTitleCell.value = 'Order Statistics by Category'
    orderStatsTitleCell.font = { bold: true, size: 11 }
    orderStatsTitleCell.alignment = { vertical: 'middle', horizontal: 'center' }
    summarySheet.getRow(orderStatsRow).height = 22

    let orderDataRow = orderStatsRow + 2
    const firstOrderRow = orderDataRow
    const maxOrders = Math.max(...Object.values(CATEGORIES).map(cat => 
      customersByCategory[cat].reduce((sum, c) => sum + (c.order_count || 0), 0)
    ), 1)
    
    Object.values(CATEGORIES).forEach(category => {
      const categoryCustomers = customersByCategory[category]
      const totalOrders = categoryCustomers.reduce((sum, c) => sum + (c.order_count || 0), 0)
      const colors = categoryColors[category]
      
      // Category name
      const categoryCell = summarySheet.getCell(`A${orderDataRow}`)
      categoryCell.value = category
      categoryCell.font = { bold: true, size: 10, color: { argb: colors.headerText } }
      categoryCell.alignment = { vertical: 'middle', horizontal: 'left' }
      categoryCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      // Total orders
      const ordersCell = summarySheet.getCell(`B${orderDataRow}`)
      ordersCell.value = totalOrders
      ordersCell.font = { size: 10, bold: true }
      ordersCell.alignment = { vertical: 'middle', horizontal: 'center' }
      ordersCell.numFmt = '#,##0'
      ordersCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      // Average orders
      const avgOrders = categoryCustomers.length > 0 
        ? (totalOrders / categoryCustomers.length).toFixed(1)
        : 0
      const avgCell = summarySheet.getCell(`C${orderDataRow}`)
      avgCell.value = parseFloat(avgOrders)
      avgCell.font = { size: 10 }
      avgCell.alignment = { vertical: 'middle', horizontal: 'center' }
      avgCell.numFmt = '0.0'
      avgCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      // Visual bar value for data bars
      const barCell = summarySheet.getCell(`D${orderDataRow}`)
      barCell.value = totalOrders
      barCell.numFmt = '#,##0'
      barCell.font = { size: 10, bold: true, color: { argb: colors.headerText } }
      barCell.alignment = { vertical: 'middle', horizontal: 'center' }
      barCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colors.rowBg }
      }
      
      summarySheet.getRow(orderDataRow).height = 20
      orderDataRow++
    })
    
    // Add data bar conditional formatting for the entire order range
    const lastOrderRow = orderDataRow - 1
    summarySheet.addConditionalFormatting({
      ref: `D${firstOrderRow}:D${lastOrderRow}`,
      rules: [
        {
          type: 'dataBar',
          cfvo: [
            { type: 'min' },
            { type: 'max' }
          ],
          color: { argb: 'FF70AD47' }
        }
      ]
    })
  }

  // Set column widths for summary sheet
  summarySheet.getColumn(1).width = 18
  summarySheet.getColumn(2).width = 20
  summarySheet.getColumn(3).width = 18
  summarySheet.getColumn(4).width = 28

  // Process each category - Always create all three sheets
  Object.keys(customersByCategory).forEach(category => {
    const categoryCustomers = customersByCategory[category]
    const colors = categoryColors[category]
    
    // Create worksheet
    const worksheet = workbook.addWorksheet(category, {
      pageSetup: {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0
      }
    })

    // Define column headers
    const headers = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Name', key: 'name', width: 28 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Email', key: 'email', width: 32 },
      { header: 'Category', key: 'category', width: 12 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'District', key: 'district', width: 16 },
      { header: 'Order Source', key: 'orderSource', width: 18 },
      { header: 'Last Enquired', key: 'lastEnquired', width: 18 },
      { header: 'Order Count', key: 'orderCount', width: 12 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Created At', key: 'createdAt', width: 22 }
    ]

    worksheet.columns = headers

    // Style header row
    const headerRow = worksheet.getRow(1)
    headerRow.height = 25
    headerRow.font = { 
      bold: true, 
      size: 11, 
      color: { argb: colors.headerText } 
    }
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: colors.headerBg }
    }
    headerRow.alignment = { 
      vertical: 'middle', 
      horizontal: 'center',
      wrapText: true
    }
    headerRow.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } }
    }

    // Add data rows
    if (categoryCustomers.length > 0) {
      categoryCustomers.forEach((customer, index) => {
        const row = worksheet.addRow({
          sno: index + 1,
          name: customer.name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          category: customer.customer_category || '',
          type: customer.sub_type || '',
          district: customer.district || '',
          orderSource: customer.order_source || '',
          lastEnquired: customer.last_enquired 
            ? format(new Date(customer.last_enquired), 'MMM dd, yyyy')
            : 'N/A',
          orderCount: customer.order_count || 0,
          status: customer.status || '',
          createdAt: customer.created_at
            ? format(new Date(customer.created_at), 'MMM dd, yyyy HH:mm')
            : ''
        })

        // Alternate row colors
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: colors.rowBg }
          }
        }

        // Style cells
        row.eachCell((cell, colNumber) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
          }
          cell.alignment = { 
            vertical: 'middle', 
            horizontal: colNumber === 1 ? 'center' : 'left',
            wrapText: true
          }
          cell.font = { size: 10 }

          // Highlight order count column
          if (colNumber === 10) {
            cell.font = { size: 10, bold: true }
            cell.numFmt = '#,##0'
          }

          // Highlight status column
          if (colNumber === 12) {
            const status = customer.status || ''
            if (status === 'Active' || status === 'Hot') {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE8F5E9' }
              }
              cell.font = { size: 10, bold: true, color: { argb: 'FF2E7D32' } }
            } else if (status === 'Inactive' || status === 'Cold') {
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFEBEE' }
              }
              cell.font = { size: 10, bold: true, color: { argb: 'FFC62828' } }
            }
          }
        })

        row.height = 20
      })
    } else {
      // Add empty row message
      const emptyRow = worksheet.addRow({
        sno: '',
        name: 'No customers found',
        phone: '',
        email: '',
        category: category,
        type: '',
        district: '',
        orderSource: '',
        lastEnquired: '',
        orderCount: 0,
        status: '',
        createdAt: ''
      })
      emptyRow.getCell(2).font = { italic: true, size: 11, color: { argb: 'FF666666' } }
      emptyRow.height = 25
    }

    // Freeze header row
    worksheet.views = [
      { state: 'frozen', ySplit: 1 }
    ]

    // Add auto filter
    worksheet.autoFilter = {
      from: 'A1',
      to: { row: 1, column: headers.length }
    }
  })


  // Generate filename with timestamp
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss')
  const filename = `customers_export_${timestamp}.xlsx`

  // Write file and trigger download
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
