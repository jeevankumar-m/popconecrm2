import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { CATEGORIES, getTypesForCategory, STATUS_OPTIONS } from '../constants/customerTypes'
import CustomerList from '../components/CustomerList'
import CustomerForm from '../components/CustomerForm'
import { exportToExcel } from '../utils/excelExport'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './Contacts.css'

const DUPLICATE_FIELDS = ['phone', 'email']

function Contacts() {
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTypes, setSelectedTypes] = useState([])
  const [area, setArea] = useState('')
  const [orderSource, setOrderSource] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [orderCountMin, setOrderCountMin] = useState('')
  const [orderCountMax, setOrderCountMax] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [status, setStatus] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  // Data states
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [areas, setAreas] = useState([])
  const [orderSources, setOrderSources] = useState([])
  const [assignedToList, setAssignedToList] = useState([])

  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  
  // Selection state
  const [selectedCustomers, setSelectedCustomers] = useState([])
  
  // Load filter options from existing data
  useEffect(() => {
    loadFilterOptions()
  }, [])

  // Load customers when filters change
  useEffect(() => {
    loadCustomers()
  }, [
    selectedCategory,
    selectedTypes,
    area,
    orderSource,
    dateFrom,
    dateTo,
    orderCountMin,
    orderCountMax,
    assignedTo,
    status,
    searchQuery
  ])

  // Clear selections when customer list changes (filter applied)
  useEffect(() => {
    setSelectedCustomers(prev => 
      prev.filter(id => customers.some(c => c.id === id))
    )
  }, [customers])

  // Load filter state from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const category = params.get('category')
    const types = params.get('types')?.split(',').filter(Boolean) || []
    
    if (category) setSelectedCategory(category)
    if (types.length > 0) setSelectedTypes(types)
    if (params.get('area')) setArea(params.get('area'))
    if (params.get('orderSource')) setOrderSource(params.get('orderSource'))
    if (params.get('dateFrom')) setDateFrom(params.get('dateFrom'))
    if (params.get('dateTo')) setDateTo(params.get('dateTo'))
    if (params.get('orderCountMin')) setOrderCountMin(params.get('orderCountMin'))
    if (params.get('orderCountMax')) setOrderCountMax(params.get('orderCountMax'))
    if (params.get('assignedTo')) setAssignedTo(params.get('assignedTo'))
    if (params.get('status')) setStatus(params.get('status'))
  }, [])

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (selectedTypes.length > 0) params.set('types', selectedTypes.join(','))
    if (area) params.set('area', area)
    if (orderSource) params.set('orderSource', orderSource)
    if (dateFrom) params.set('dateFrom', dateFrom)
    if (dateTo) params.set('dateTo', dateTo)
    if (orderCountMin) params.set('orderCountMin', orderCountMin)
    if (orderCountMax) params.set('orderCountMax', orderCountMax)
    if (assignedTo) params.set('assignedTo', assignedTo)
    if (status) params.set('status', status)

    const newUrl = params.toString() 
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [
    selectedCategory,
    selectedTypes,
    area,
    orderSource,
    dateFrom,
    dateTo,
    orderCountMin,
    orderCountMax,
    assignedTo,
    status
  ])

  const loadFilterOptions = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('area, order_source, assigned_to')
        .not('area', 'is', null)
        .not('order_source', 'is', null)
        .not('assigned_to', 'is', null)

      if (error) throw error

      // Extract unique values
      const uniqueAreas = [...new Set(data.map(d => d.area).filter(Boolean))]
      const uniqueSources = [...new Set(data.map(d => d.order_source).filter(Boolean))]
      const uniqueAssigned = [...new Set(data.map(d => d.assigned_to).filter(Boolean))]

      setAreas(uniqueAreas.sort())
      setOrderSources(uniqueSources.sort())
      setAssignedToList(uniqueAssigned.sort())
    } catch (error) {
      console.error('Error loading filter options:', error)
    }
  }

  const loadCustomers = async () => {
    setLoading(true)
    try {
      let query = supabase.from('customers').select('*')

      // Category filter
      if (selectedCategory) {
        query = query.eq('customer_category', selectedCategory)
      }

      // Type filter
      if (selectedTypes.length > 0) {
        query = query.in('sub_type', selectedTypes)
      }

      // Additional filters
      if (area) {
        query = query.eq('area', area)
      }

      if (orderSource) {
        query = query.eq('order_source', orderSource)
      }

      if (dateFrom) {
        query = query.gte('last_order_date', dateFrom)
      }

      if (dateTo) {
        query = query.lte('last_order_date', dateTo)
      }

      if (orderCountMin) {
        query = query.gte('order_count', parseInt(orderCountMin))
      }

      if (orderCountMax) {
        query = query.lte('order_count', parseInt(orderCountMax))
      }

      if (assignedTo) {
        query = query.eq('assigned_to', assignedTo)
      }

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      
      // Apply search filter client-side (Supabase text search is limited)
      let filteredData = data || []
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase().trim()
        filteredData = filteredData.filter(customer => {
          const name = (customer.name || '').toLowerCase()
          const email = (customer.email || '').toLowerCase()
          const phone = (customer.phone || '').toLowerCase()
          const area = (customer.area || '').toLowerCase()
          const assignedTo = (customer.assigned_to || '').toLowerCase()
          const orderSource = (customer.order_source || '').toLowerCase()
          
          return name.includes(searchLower) ||
                 email.includes(searchLower) ||
                 phone.includes(searchLower) ||
                 area.includes(searchLower) ||
                 assignedTo.includes(searchLower) ||
                 orderSource.includes(searchLower)
        })
      }
      
      setCustomers(filteredData)
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }


  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedTypes([])
    setArea('')
    setOrderSource('')
    setDateFrom('')
    setDateTo('')
    setOrderCountMin('')
    setOrderCountMax('')
    setAssignedTo('')
    setStatus('')
    setSearchQuery('')
    setSelectedCustomers([])
  }

  const handleExportToExcel = async () => {
    try {
      await exportToExcel(customers)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('Error exporting to Excel. Please try again.')
    }
  }

  const handleCreateCustomer = () => {
    setEditingCustomer(null)
    setShowForm(true)
  }

  const handleEditCustomer = (customer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  const findDuplicateCustomer = async (payload, excludeId = null) => {
    const orFilters = DUPLICATE_FIELDS
      .map(field => {
        const value = (payload[field] || '').trim()
        if (!value) return null
        // wrap value in double quotes to ensure special chars (like @) are handled
        return `${field}.eq.${encodeURIComponent(value)}`
      })
      .filter(Boolean)

    if (orFilters.length === 0) return null

    let query = supabase
      .from('customers')
      .select('id,name,phone,email')
      .limit(1)

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query.or(orFilters.join(','))
    if (error) throw error

    return data?.[0] || null
  }

  const handleSaveCustomer = async (formData) => {
    try {
      if (editingCustomer) {
        const duplicate = await findDuplicateCustomer(formData, editingCustomer.id)
        if (duplicate) {
          alert('Another customer already uses this phone/email. Please use unique values.')
          return
        }
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(formData)
          .eq('id', editingCustomer.id)

        if (error) throw error
      } else {
        const duplicate = await findDuplicateCustomer(formData)
        if (duplicate) {
          alert('Customer already exists with the same phone or email. Please update the existing record.')
          return
        }
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([formData])

        if (error) throw error
      }

      setShowForm(false)
      setEditingCustomer(null)
      loadCustomers()
      loadFilterOptions() // Refresh filter options
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('Error saving customer. Please try again.')
    }
  }

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

      if (error) throw error

      setSelectedCustomers(prev => prev.filter(id => id !== customerId))
      loadCustomers()
      loadFilterOptions() // Refresh filter options
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('Error deleting customer. Please try again.')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return

    const count = selectedCustomers.length
    if (!window.confirm(`Are you sure you want to delete ${count} customer${count > 1 ? 's' : ''}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', selectedCustomers)

      if (error) throw error

      setSelectedCustomers([])
      loadCustomers()
      loadFilterOptions() // Refresh filter options
    } catch (error) {
      console.error('Error deleting customers:', error)
      alert('Error deleting customers. Please try again.')
    }
  }

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId)
      } else {
        return [...prev, customerId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(customers.map(c => c.id))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('username')
    window.location.href = '/login'
  }

  const availableTypes = selectedCategory 
    ? getTypesForCategory(selectedCategory)
    : []

  return (
    <div className="contacts-page">
      {/* Top Header with Filters and Actions */}
      <div className="contacts-top-bar">
        <div className="top-bar-header">
          <h1>Popcone Contacts</h1>
          <div className="top-bar-right">
            <div className="search-container">
              <svg className="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="top-bar-actions">
              {loading ? (
                <span className="results-count">Loading...</span>
              ) : (
                <span className="results-count">
                  Showing {customers.length} customer{customers.length !== 1 ? 's' : ''}
                  {selectedCustomers.length > 0 && (
                    <span className="selected-count"> • {selectedCustomers.length} selected</span>
                  )}
                </span>
              )}
              {selectedCustomers.length > 0 && (
                <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 4H14M12.6667 4V13.3333C12.6667 13.6869 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.6869 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33334 13.6869 3.33334 13.3333V4M5.33334 4V2.66667C5.33334 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33334 6.66667 1.33334H9.33334C9.68696 1.33334 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.66667 7.33334V11.3333M9.33334 7.33334V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Delete Selected ({selectedCustomers.length})
                </button>
              )}
              <button className="btn-clear" onClick={clearFilters}>
                Clear Filters
              </button>
              <button 
                className="btn-export" 
                onClick={handleExportToExcel}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 10V13.3333C14 13.6869 13.8595 14.0261 13.6095 14.2761C13.3594 14.5262 13.0203 14.6667 12.6667 14.6667H3.33333C2.97971 14.6667 2.64057 14.5262 2.39052 14.2761C2.14048 14.0261 2 13.6869 2 13.3333V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5.33333 6.66667L8 9.33333L10.6667 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 9.33333V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Export
              </button>
              <button className="btn-create" onClick={handleCreateCustomer}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Create
              </button>
              <button className="btn-logout" onClick={handleLogout} title="Logout">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V3.33333C2 2.97971 2.14048 2.64057 2.39052 2.39052C2.64057 2.14048 2.97971 2 3.33333 2H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.6667 11.3333L14 8L10.6667 4.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="filters-bar">
          <div className="filters-row">
            {/* Category Filter */}
            <div className="filter-group">
              <label>Category</label>
              <select
                className="filter-select"
                value={selectedCategory || ''}
                onChange={(e) => {
                  const category = e.target.value || null
                  if (category) {
                    setSelectedCategory(category)
                    setSelectedTypes([])
                  } else {
                    setSelectedCategory(null)
                    setSelectedTypes([])
                  }
                }}
              >
                <option value="">All</option>
                {Object.values(CATEGORIES).map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Type Filters */}
            {selectedCategory && (
              <div className="filter-group">
                <label>Type</label>
                <div className="type-chips">
                  {availableTypes.map(type => (
                    <button
                      key={type}
                      className={`type-chip ${selectedTypes.includes(type) ? 'active' : ''}`}
                      onClick={() => handleTypeToggle(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Filters */}
            <div className="filter-group">
              <label>Area</label>
              <select 
                className="filter-select"
                value={area} 
                onChange={(e) => setArea(e.target.value)}
              >
                <option value="">All</option>
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Order Source</label>
              <select 
                className="filter-select"
                value={orderSource} 
                onChange={(e) => setOrderSource(e.target.value)}
              >
                <option value="">All</option>
                {orderSources.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Date From</label>
              <DatePicker
                selected={dateFrom ? new Date(dateFrom) : null}
                onChange={(date) => setDateFrom(date ? date.toISOString().split('T')[0] : '')}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select date"
                className="filter-input date-picker"
                isClearable
              />
            </div>

            <div className="filter-group">
              <label>Date To</label>
              <DatePicker
                selected={dateTo ? new Date(dateTo) : null}
                onChange={(date) => setDateTo(date ? date.toISOString().split('T')[0] : '')}
                dateFormat="dd-MM-yyyy"
                placeholderText="Select date"
                className="filter-input date-picker"
                isClearable
                minDate={dateFrom ? new Date(dateFrom) : null}
              />
            </div>

            <div className="filter-group">
              <label>Order Count</label>
              <div className="range-inputs">
                <input
                  className="filter-input"
                  type="number"
                  min="0"
                  value={orderCountMin}
                  onChange={(e) => setOrderCountMin(e.target.value)}
                  placeholder="Min"
                />
                <span className="range-separator">-</span>
                <input
                  className="filter-input"
                  type="number"
                  min="0"
                  value={orderCountMax}
                  onChange={(e) => setOrderCountMax(e.target.value)}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Assigned To</label>
              <select 
                className="filter-select"
                value={assignedTo} 
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">All</option>
                {assignedToList.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select 
                className="filter-select"
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">All</option>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="contacts-main">
        {/* Customer List */}
        <CustomerList 
          customers={customers} 
          loading={loading}
          onEdit={handleEditCustomer}
          onDelete={handleDeleteCustomer}
          selectedCustomers={selectedCustomers}
          onSelectCustomer={handleSelectCustomer}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Customer Form Modal */}
      {showForm && (
        <CustomerForm
          customer={editingCustomer}
          onSave={handleSaveCustomer}
          onCancel={() => {
            setShowForm(false)
            setEditingCustomer(null)
          }}
          orderSources={orderSources}
        />
      )}
    </div>
  )
}

export default Contacts
