# Popcone CRM - Customer Filtering System

A React-based CRM application with advanced two-level customer filtering and Excel export functionality.

## Features

- **Two-Level Filtering System**
  - Category filter: B2C, B2B, BULK
  - Type filter: Category-specific types (Confirmed, COD Pending, Inquiry, etc.)
  - Universal type: Dead Lead (applies to any category)

- **Additional Filters**
  - Area
  - Order Source
  - Last Order Date (date range)
  - Order Count (min/max)
  - Assigned To
  - Status (Active/Inactive/Hot/Cold)

- **Excel Export**
  - Export filtered customer data to Excel
  - Separate sheets for each category (B2C, B2B, BULK)
  - Includes all customer fields

- **Filter Persistence**
  - Filters persist in URL parameters
  - Maintains filter state when navigating to contact details
  - Restores filters when returning to contacts page

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env`
3. Fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Database

Follow the instructions in `SUPABASE_SETUP.md` to:
- Create the `customers` table
- Set up indexes for performance
- Insert sample data (optional)

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/
│   ├── CustomerList.jsx       # Customer list table component
│   └── CustomerList.css
├── constants/
│   └── customerTypes.js       # Category and type definitions
├── lib/
│   └── supabase.js            # Supabase client configuration
├── pages/
│   ├── Contacts.jsx           # Main contacts page with filters
│   ├── Contacts.css
│   ├── ContactDetails.jsx     # Individual contact detail page
│   └── ContactDetails.css
├── utils/
│   └── excelExport.js         # Excel export functionality
├── App.jsx                    # Main app component with routing
└── main.jsx                   # Application entry point
```

## Usage

### Filtering Customers

1. **Select a Category**: Click on B2C, B2B, or BULK
2. **Select Types**: Choose one or more types from the chips that appear
3. **Apply Additional Filters**: Use the additional filter dropdowns to narrow results
4. **Clear Filters**: Click "Clear Filters" to reset all filters

### Exporting to Excel

1. Apply your desired filters
2. Click "Export to Excel"
3. The file will download with separate sheets for each category present in the filtered data

### Viewing Contact Details

1. Click on any customer row in the table
2. View detailed information about the customer
3. Click "Back to Contacts" to return (filters will be preserved)

## Technology Stack

- **React 19.2.0** - UI framework
- **Vite 7.2.2** - Build tool
- **React Router DOM** - Routing
- **Supabase** - Database and backend
- **xlsx (SheetJS)** - Excel file generation
- **date-fns** - Date formatting

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Notes

- Row Level Security (RLS) is disabled as per requirements
- All database operations are performed client-side
- Filter state is stored in URL parameters for easy sharing and bookmarking

## License

Private project - All rights reserved
