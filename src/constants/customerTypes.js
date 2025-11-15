// Customer Categories (Fixed - Never Change)
export const CATEGORIES = {
  B2C: 'B2C',
  B2B: 'B2B',
  BULK: 'BULK'
}

// Types by Category
export const TYPES_BY_CATEGORY = {
  [CATEGORIES.B2C]: ['Confirmed', 'COD Pending', 'Inquiry'],
  [CATEGORIES.B2B]: ['Regular Buyers', 'Leads / Potential'],
  [CATEGORIES.BULK]: ['One-time Order']
}

// Universal Type (applies to any category)
export const UNIVERSAL_TYPE = 'Dead Lead'

// Get all types for a category (including universal type)
export const getTypesForCategory = (category) => {
  if (!category) return []
  const categoryTypes = TYPES_BY_CATEGORY[category] || []
  return [...categoryTypes, UNIVERSAL_TYPE]
}

// Status options
export const STATUS_OPTIONS = ['Active', 'Inactive', 'Hot', 'Cold']

// Order Source options
export const ORDER_SOURCES = [
  'Direct',
  'Instagram',
  'Facebook',
  'WhatsApp',
  'Website',
  'Google Ads',
  'Referral',
  'Walk-in',
  'Phone Call',
  'Email',
  'Other'
]

