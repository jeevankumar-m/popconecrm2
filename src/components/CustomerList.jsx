import { useNavigate } from 'react-router-dom'
import './CustomerList.css'

function CustomerList({ customers, loading, onEdit, onDelete }) {
  const navigate = useNavigate()

  const handleCustomerClick = (customerId, e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('.action-buttons')) {
      return
    }
    // Preserve current URL params when navigating
    const currentParams = window.location.search
    navigate(`/contacts/${customerId}${currentParams}`)
  }

  const handleEdit = (e, customer) => {
    e.stopPropagation()
    if (onEdit) onEdit(customer)
  }

  const handleDelete = (e, customerId) => {
    e.stopPropagation()
    if (onDelete) onDelete(customerId)
  }

  if (loading) {
    return (
      <div className="customer-list-loading">
        <p>Loading customers...</p>
      </div>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="customer-list-empty">
        <p>No customers found matching your filters.</p>
      </div>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return dateString
    }
  }

  return (
    <div className="customer-list">
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Area</th>
            <th>Order Source</th>
            <th>Last Order</th>
            <th>Order Count</th>
            <th>Assigned To</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr
              key={customer.id}
              onClick={(e) => handleCustomerClick(customer.id, e)}
              className="customer-row"
            >
              <td>{customer.name || 'N/A'}</td>
              <td>
                <span className={`category-badge category-${customer.customer_category}`}>
                  {customer.customer_category}
                </span>
              </td>
              <td>{customer.sub_type || 'N/A'}</td>
              <td>{customer.phone || 'N/A'}</td>
              <td>{customer.email || 'N/A'}</td>
              <td>{customer.area || 'N/A'}</td>
              <td>{customer.order_source || 'N/A'}</td>
              <td>{formatDate(customer.last_order_date)}</td>
              <td>{customer.order_count || 0}</td>
              <td>{customer.assigned_to || 'N/A'}</td>
              <td>
                {customer.status && (
                  <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                    {customer.status}
                  </span>
                )}
              </td>
              <td>
                <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn-edit"
                    onClick={(e) => handleEdit(e, customer)}
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.3333 2.00001C11.5084 1.8249 11.7163 1.686 11.9441 1.59129C12.1719 1.49659 12.4151 1.44824 12.6667 1.44824C12.9182 1.44824 13.1614 1.49659 13.3892 1.59129C13.617 1.686 13.8249 1.8249 14 2.00001C14.1751 2.17512 14.314 2.383 14.4087 2.61079C14.5034 2.83858 14.5518 3.08178 14.5518 3.33334C14.5518 3.5849 14.5034 3.8281 14.4087 4.05589C14.314 4.28368 14.1751 4.49156 14 4.66667L5.00001 13.6667L1.33334 14.6667L2.33334 11L11.3333 2.00001Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button
                    className="btn-delete"
                    onClick={(e) => handleDelete(e, customer.id)}
                    title="Delete"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 4H14M12.6667 4V13.3333C12.6667 13.6869 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.6869 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33334 13.6869 3.33334 13.3333V4M5.33334 4V2.66667C5.33334 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33334 6.66667 1.33334H9.33334C9.68696 1.33334 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M6.66667 7.33334V11.3333M9.33334 7.33334V11.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CustomerList

