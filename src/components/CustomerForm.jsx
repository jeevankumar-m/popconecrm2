import { useState, useEffect } from 'react'
import { CATEGORIES, getTypesForCategory, STATUS_OPTIONS, ORDER_SOURCES } from '../constants/customerTypes'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import './CustomerForm.css'

function CustomerForm({ customer, onSave, onCancel, orderSources = [] }) {
  const isEditMode = !!customer

  const [formData, setFormData] = useState({
    customer_category: customer?.customer_category || '',
    sub_type: customer?.sub_type || '',
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    district: customer?.district || '',
    address: customer?.address || '',
    pincode: customer?.pincode || '',
    order_source: customer?.order_source || '',
    last_enquired: customer?.last_enquired || '',
    order_count: customer?.order_count || 0,
    status: customer?.status || ''
  })

  const [errors, setErrors] = useState({})

  const availableTypes = formData.customer_category 
    ? getTypesForCategory(formData.customer_category)
    : []

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order_count' ? parseInt(value) || 0 : value
    }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Reset sub_type if category changes
    if (name === 'customer_category') {
      setFormData(prev => ({
        ...prev,
        customer_category: value,
        sub_type: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.customer_category) {
      newErrors.customer_category = 'Category is required'
    }
    
    if (!formData.sub_type) {
      newErrors.sub_type = 'Type is required'
    }
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Name is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave(formData)
    }
  }

  return (
    <div className="customer-form-overlay" onClick={onCancel}>
      <div className="customer-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="customer-form-header">
          <h2>{isEditMode ? 'Edit Customer' : 'Create New Customer'}</h2>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-group">
            <label>Category <span className="required">*</span></label>
            <select
              name="customer_category"
              value={formData.customer_category}
              onChange={handleChange}
              className={errors.customer_category ? 'error' : ''}
              required
            >
              <option value="">Select Category</option>
              {Object.values(CATEGORIES).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.customer_category && (
              <span className="error-message">{errors.customer_category}</span>
            )}
          </div>

          <div className="form-group">
            <label>Type <span className="required">*</span></label>
            <select
              name="sub_type"
              value={formData.sub_type}
              onChange={handleChange}
              className={errors.sub_type ? 'error' : ''}
              required
              disabled={!formData.customer_category}
            >
              <option value="">Select Type</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {errors.sub_type && (
              <span className="error-message">{errors.sub_type}</span>
            )}
          </div>

          <div className="form-group">
            <label>Name <span className="required">*</span></label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
              required
            />
            {errors.name && (
              <span className="error-message">{errors.name}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>
          </div>

      <div className="form-row">
        <div className="form-group">
          <label>District</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d*"
                placeholder="e.g., 560001"
              />
            </div>
          </div>

      <div className="form-group">
        <label>Full Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          placeholder="Street, landmark, city"
        />
      </div>

      <div className="form-group">
            <label>Order Source</label>
            <select
              name="order_source"
              value={formData.order_source}
              onChange={handleChange}
            >
              <option value="">Select Order Source</option>
              {ORDER_SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
              {/* Show additional order sources from database that aren't in predefined list */}
              {orderSources
                .filter(source => !ORDER_SOURCES.includes(source))
                .map(source => (
                  <option key={source} value={source}>{source}</option>
                ))}
            </select>
          </div>

      <div className="form-row">
        <div className="form-group">
          <label>Last Enquired</label>
          <DatePicker
            selected={formData.last_enquired ? new Date(formData.last_enquired) : null}
            onChange={(date) => {
              const dateString = date ? date.toISOString().split('T')[0] : ''
              setFormData(prev => ({ ...prev, last_enquired: dateString }))
            }}
            dateFormat="dd-MM-yyyy"
            placeholderText="Select date"
            className="form-input date-picker"
            isClearable
          />
        </div>

        <div className="form-group">
              <label>Order Count</label>
              <input
                type="number"
                name="order_count"
                value={formData.order_count}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

      <div className="form-group">
        <label>Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="">Select Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {isEditMode ? 'Update' : 'Create'} Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomerForm

