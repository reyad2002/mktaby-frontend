# Calendar Page Documentation

## Overview

The Calendar page provides a comprehensive calendar interface for viewing and managing events across the system, including cases, sessions, tasks, clients, and users.

## Features

### 1. **Month View**

- Interactive calendar displaying the entire month
- Shows event counts for each day
- Click any day to view detailed events for that day
- Navigate between months using Previous/Next buttons
- Today's date is highlighted with an amber border
- Selected dates are highlighted with a blue border

### 2. **Day View**

- Detailed view of all events for a selected date
- Shows event name, ID, type, and status
- Color-coded by entity type:
  - **Cases** (Blue) - القضايا
  - **Sessions** (Purple) - الجلسات
  - **Tasks** (Green) - المهام
  - **Clients** (Cyan) - العملاء
  - **Users** (Orange) - المستخدمون
  - **Employees** (Pink) - الموظفون
  - **Office** (Indigo) - المكتب
  - **Folders** (Amber) - المجلدات

### 3. **Entity Type Filter**

- Filter events by entity type (Cases, Sessions, Tasks, Clients, Users)
- Filter applies to both month and day views
- "All" option shows events from all entity types

### 4. **View Mode Toggle**

- Switch between Month and Day views
- Day view is only enabled when a date is selected
- Easy back navigation from day view to month view

## API Integration

The calendar page uses the following API endpoints:

### Get Month Events

```typescript
getMonthEventsApi(queryParams: GetCalendarMonthQuery)
```

Returns events for the entire month within the specified date range.

**Query Parameters:**

- `startDate` (optional): ISO datetime string for month start
- `endDate` (optional): ISO datetime string for month end
- `entityType` (optional): Filter by entity type (Case, Session, Task, etc.)

**Response:**

```typescript
interface CalendarMonthItemDto {
  date: string; // ISO date-time string
  count: number; // Number of events on this date
}
```

### Get Day Events

```typescript
getDayEventsApi(queryParams: GetCalendarDayQuery)
```

Returns detailed events for a specific day.

**Query Parameters:**

- `startDate` (optional): ISO datetime string for day start
- `endDate` (optional): ISO datetime string for day end
- `entityType` (optional): Filter by entity type

**Response:**

```typescript
interface CalendarDayItemDto {
  name: string; // Event name
  entityId: number; // Entity ID
  entityType: string; // Type of entity (Case, Session, Task, etc.)
  status: string; // Event status
}
```

## Status Colors

Events are displayed with different status colors:

- **Green** - Active, Completed, Done, Executed
- **Yellow** - UnderReview, Suspended
- **Orange** - UnderInvestigation
- **Blue** - ReadyForHearing, InCourt, Pending, InProgress
- **Purple** - InCourt
- **Gray** - Postponed, Closed
- **Red** - Rejected, Cancelled
- **Teal** - Settled
- **Indigo** - ReservedForJudgment
- **Zinc** - Archived
- **Cyan** - Appealed
- **Lime** - Executed

## Loading States

- Month loading shows a centered loading spinner
- Day loading shows a centered loading spinner
- Fetching indicator in the page header while data is loading

## Theme Consistency

The calendar page uses the consistent website theme:

- **Colors**: Blue primary (#2563eb), Gray backgrounds
- **Typography**: Consistent font sizes and weights
- **Spacing**: Standard padding and margins
- **Borders**: Rounded corners and subtle gray borders
- **Interactions**: Hover effects and smooth transitions
- **RTL Support**: Full support for Arabic (RTL) text direction

## User Experience

1. **Initial Load**: Month view loads automatically for current month
2. **Date Selection**: Click any date to see detailed events
3. **Month Navigation**: Use Previous/Next buttons to navigate months
4. **Filtering**: Use the entity type dropdown to filter events
5. **Day View**: Switch to day view to see detailed event information
6. **Back Navigation**: Use "Return to Month" button to go back

## File Structure

```
features/calendar/
├── apis/
│   └── calenderApis.tsx    # API calls
├── types/
│   └── calenderTypes.tsx   # TypeScript types
└── PATHES.tsx              # API endpoints

app/dashboard/calendar/
└── page.tsx               # Calendar page component
```

## Future Enhancements

- [ ] Event creation from calendar
- [ ] Event editing/deletion
- [ ] Week view option
- [ ] Event details modal
- [ ] Recurring events support
- [ ] Event reminders/notifications
- [ ] Export calendar functionality
- [ ] Calendar themes/customization
- [ ] Multiple calendar views side-by-side
- [ ] Event search within calendar
