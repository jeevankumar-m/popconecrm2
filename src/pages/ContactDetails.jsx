import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './ContactDetails.css'

function ContactDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCustomer()
  }, [id])

  const loadCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setCustomer(data)
    } catch (error) {
      console.error('Error loading customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Preserve URL params when going back
    const params = window.location.search
    navigate(`/contacts${params}`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="contact-details">
        <p>Loading...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="contact-details">
        <p>Customer not found</p>
        <button onClick={handleBack}>Back to Popcone Contacts</button>
      </div>
    )
  }

  return (
    <div className="contact-details">
      <div className="contact-details-header">
        <button className="btn-back" onClick={handleBack}>
          ← Back to Popcone Contacts
        </button>
        <h1>{customer.name || 'Unnamed Customer'}</h1>
      </div>

      <div className="contact-details-content">
        <div className="details-section">
          <h2>Basic Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Category</label>
              <span className={`category-badge category-${customer.customer_category}`}>
                {customer.customer_category}
              </span>
            </div>
            <div className="detail-item">
              <label>Type</label>
              <span>{customer.sub_type || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Status</label>
              {customer.status && (
                <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                  {customer.status}
                </span>
              )}
            </div>
            <div className="detail-item">
              <label>Phone</label>
              <span>{customer.phone || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Email</label>
              <span>{customer.email || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Area</label>
              <span>{customer.area || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>Order Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Order Source</label>
              <span>{customer.order_source || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <label>Last Order Date</label>
              <span>{formatDate(customer.last_order_date)}</span>
            </div>
            <div className="detail-item">
              <label>Order Count</label>
              <span>{customer.order_count || 0}</span>
            </div>
            <div className="detail-item">
              <label>Assigned To</label>
              <span>{customer.assigned_to || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="details-section">
          <h2>System Information</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Created At</label>
              <span>{formatDate(customer.created_at)}</span>
            </div>
            <div className="detail-item">
              <label>Updated At</label>
              <span>{formatDate(customer.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactDetails

