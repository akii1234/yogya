# Frontend Pagination Updates

## Overview
Updated the frontend to support the new pagination endpoints and provide better user experience for managing large numbers of job descriptions.

## Changes Made

### 1. Updated Job Service (`src/services/jobService.js`)

#### New Functions Added:
- **`fetchJobDescriptions(pageSize = 100)`** - Fetch jobs with custom page size
- **`fetchAllJobDescriptions()`** - Fetch all jobs without pagination
- **`fetchJobDescriptionsPaginated(page, pageSize)`** - Fetch jobs with full pagination support

#### Updated Functions:
- **`fetchJobDescriptions()`** - Now accepts pageSize parameter (defaults to 100)

### 2. Enhanced Job List Component (`src/components/Jobs/JobList.jsx`)

#### New Features:
- **Pagination Controls** - Navigate through pages of jobs
- **Page Size Selector** - Choose 25, 50, 100, or 200 jobs per page
- **Show All Jobs Toggle** - Switch between paginated and all jobs view
- **Total Count Display** - Shows total number of jobs available
- **Loading States** - Better UX during data fetching

#### New State Variables:
```javascript
const [pagination, setPagination] = useState({
  count: 0,
  next: null,
  previous: null,
  currentPage: 1
});
const [pageSize, setPageSize] = useState(100);
const [showAllJobs, setShowAllJobs] = useState(false);
```

#### New UI Elements:
- **Pagination Component** - Material-UI pagination with first/last buttons
- **Page Size Dropdown** - Select number of items per page
- **Show All Toggle** - Switch to view all jobs at once
- **Enhanced Status Display** - Shows filtered vs total count

## User Interface

### Pagination Controls
Located at the bottom of the job list table:

1. **Status Text** - "Showing X of Y job descriptions"
2. **Show All Jobs Toggle** - Switch to view all jobs without pagination
3. **Page Size Selector** - Choose items per page (25, 50, 100, 200)
4. **Pagination Navigation** - Navigate between pages

### Header Updates
- Job count now shows total available jobs instead of current page count
- Dynamic updates based on pagination settings

## API Integration

### Endpoints Used:
- **`GET /api/job_descriptions/?page_size=100`** - Default paginated view
- **`GET /api/job_descriptions/all/`** - All jobs without pagination
- **`GET /api/job_descriptions/?page=2&page_size=50`** - Custom pagination

### Response Handling:
- Handles both paginated and non-paginated responses
- Graceful fallback for different response formats
- Error handling for failed requests

## Usage Examples

### For Job Management Page:
```javascript
// Load first 100 jobs (default)
const jobs = await fetchJobDescriptions();

// Load all jobs without pagination
const allJobs = await fetchAllJobDescriptions();

// Load specific page with custom size
const pageData = await fetchJobDescriptionsPaginated(2, 50);
```

### Frontend Component Usage:
```javascript
// Toggle between paginated and all jobs
<FormControlLabel
  control={
    <Switch
      checked={showAllJobs}
      onChange={handleShowAllToggle}
    />
  }
  label="Show All Jobs"
/>

// Change page size
<Select
  value={pageSize}
  onChange={handlePageSizeChange}
>
  <MenuItem value={25}>25 per page</MenuItem>
  <MenuItem value={100}>100 per page</MenuItem>
</Select>

// Navigate pages
<Pagination
  count={totalPages}
  page={currentPage}
  onChange={handlePageChange}
/>
```

## Benefits

1. **Better Performance** - Load only needed data
2. **Improved UX** - Users can choose their preferred view
3. **Scalability** - Handles large datasets efficiently
4. **Flexibility** - Multiple ways to view job data
5. **Consistency** - Matches backend pagination implementation

## Testing

### Test Scenarios:
1. **Default Load** - Should show first 100 jobs
2. **Page Navigation** - Should load different pages correctly
3. **Page Size Change** - Should update items per page
4. **Show All Toggle** - Should load all jobs without pagination
5. **Search & Filter** - Should work with pagination
6. **Error Handling** - Should handle API errors gracefully

### Expected Results:
- Job management page now shows all 102 Wipro jobs
- Users can navigate through pages efficiently
- Performance remains good with large datasets
- UI is intuitive and responsive 