# PageHeader Component

A reusable header component for dashboard pages with consistent styling and features.

## Location

`shared/components/dashboard/PageHeader.tsx`

## Features

- ✅ Consistent design across all dashboard pages
- ✅ TypeScript type safety
- ✅ Flexible action buttons
- ✅ Loading state indicator
- ✅ Count badges
- ✅ Refresh functionality
- ✅ Custom actions support
- ✅ Responsive layout

## Props

### Required Props

| Prop       | Type         | Description                          |
| ---------- | ------------ | ------------------------------------ |
| `title`    | `string`     | The main title of the page           |
| `subtitle` | `string`     | The subtitle/description text        |
| `icon`     | `LucideIcon` | The icon component from lucide-react |

### Optional Props

| Prop             | Type                 | Default   | Description                           |
| ---------------- | -------------------- | --------- | ------------------------------------- |
| `isFetching`     | `boolean`            | `false`   | Shows loading indicator               |
| `countLabel`     | `string`             | -         | Display count badge (e.g., "50 قضية") |
| `onRefresh`      | `() => void`         | -         | Adds refresh button                   |
| `onAdd`          | `() => void`         | -         | Adds primary add button               |
| `addButtonLabel` | `string`             | `"إضافة"` | Label for add button                  |
| `customActions`  | `PageHeaderAction[]` | `[]`      | Array of custom action buttons        |
| `children`       | `React.ReactNode`    | -         | Custom elements (badges, etc.)        |

### Custom Action Type

```typescript
interface PageHeaderAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
}
```

## Usage Examples

### Basic Usage

```tsx
import PageHeader from "@/shared/components/dashboard/PageHeader";
import { Briefcase } from "lucide-react";

<PageHeader
  title="القضايا"
  subtitle="إدارة ومتابعة القضايا والملفات القانونية."
  icon={Briefcase}
/>;
```

### With Count and Add Button

```tsx
<PageHeader
  title="العملاء"
  subtitle="إدارة بيانات العملاء والتواصل معهم."
  icon={Users}
  countLabel={`${totalCount} عميل`}
  onAdd={() => setShowModal(true)}
  addButtonLabel="إضافة عميل"
/>
```

### With Refresh and Loading State

```tsx
<PageHeader
  title="المهام"
  subtitle="إدارة ومتابعة المهام والأعمال اليومية"
  icon={CheckSquare}
  isFetching={isFetching}
  countLabel={`${totalCount} مهمة`}
  onRefresh={refetch}
  onAdd={() => setShowAddModal(true)}
  addButtonLabel="مهمة جديدة"
/>
```

### With Custom Actions

```tsx
import { Download, Upload, Settings } from "lucide-react";

<PageHeader
  title="التقارير"
  subtitle="عرض وتصدير التقارير"
  icon={FileText}
  customActions={[
    {
      label: "تصدير",
      onClick: handleExport,
      icon: Download,
      variant: "secondary",
    },
    {
      label: "استيراد",
      onClick: handleImport,
      icon: Upload,
      variant: "ghost",
    },
    {
      label: "الإعدادات",
      onClick: openSettings,
      icon: Settings,
      variant: "ghost",
    },
  ]}
/>;
```

### With Custom Children (Additional Badges)

```tsx
<PageHeader
  title="القضايا"
  subtitle="إدارة القضايا"
  icon={Briefcase}
  countLabel={`${totalCount} قضية`}
>
  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 text-amber-700 text-sm border border-amber-200">
    <AlertCircle size={14} />
    {urgentCount} عاجلة
  </span>
</PageHeader>
```

## Implementation Status

### ✅ Implemented Pages

1. **Cases Page** - `/dashboard/cases/page.tsx`
   - Icon: Briefcase
   - Features: Count badge, refresh button, add button
2. **Clients Page** - `/dashboard/clients/page.tsx`
   - Icon: Users
   - Features: Count badge, add button
3. **Tasks Page** - `/dashboard/tasks/page.tsx`
   - Icon: CheckSquare
   - Features: Count badge, add button
4. **Courts Page** - `/dashboard/courts/page.tsx`
   - Icon: Scale
   - Features: Count badge, refresh button, add button
5. **Sessions Page** - `/dashboard/sessions/page.tsx`
   - Icon: CalendarDays
   - Features: Count badge, add button
6. **Users Settings** - `/dashboard/settings/users/page.tsx`
   - Icon: Users
   - Features: Count badge, refresh button, add button
7. **Permissions Settings** - `/dashboard/settings/permissions/page.tsx`
   - Icon: Shield
   - Features: Count badge, add button
8. **Office Settings** - `/dashboard/settings/office/page.tsx`
   - Icon: Building2
   - Features: Basic header (no actions)

### ⚠️ Pages with Custom Headers (Not Using PageHeader)

1. **User Profile** - `/dashboard/settings/userprofile/page.tsx`
   - Uses custom hero-style header with gradient background
   - Intentionally designed to be unique
2. **Case Details** - `/dashboard/cases/[id]/page.tsx`
   - Uses specialized CaseHeader component for detail view
3. **Client Details** - `/dashboard/clients/[id]/page.tsx`
   - Uses specialized header for detail view
4. **Main Dashboard** - `/dashboard/page.tsx`
   - Dashboard overview page with statistics cards
   - Does not need traditional page header

---

## Implementation Status

### ✅ Implemented Pages

- `/dashboard/cases` - Cases page
- `/dashboard/clients` - Clients page
- `/dashboard/tasks` - Tasks page
- `/dashboard/courts` - Courts page

### 📋 Pending Pages

- `/dashboard/sessions` - Sessions page
- `/dashboard/settings/*` - Settings pages

## Migration Guide

### Before (Old Pattern)

```tsx
<div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
  <div className="flex flex-wrap items-start justify-between gap-4">
    <div className="space-y-1">
      <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 flex items-center gap-3">
        <Briefcase className="text-blue-600" size={32} />
        القضايا
      </h1>
      <p className="text-sm text-gray-600">
        إدارة ومتابعة القضايا والملفات القانونية.
      </p>
    </div>
    {/* Complex buttons and badges here... */}
  </div>
</div>
```

### After (New Pattern)

```tsx
<PageHeader
  title="القضايا"
  subtitle="إدارة ومتابعة القضايا والملفات القانونية."
  icon={Briefcase}
  isFetching={isFetching}
  countLabel={`${totalCount} قضية`}
  onRefresh={refetch}
  onAdd={() => setShowAddModal(true)}
  addButtonLabel="إضافة قضية"
/>
```

## Benefits

1. **Consistency**: All pages have the same header styling and behavior
2. **Maintainability**: Update header design in one place
3. **Type Safety**: TypeScript ensures correct usage
4. **DRY**: No code duplication
5. **Flexibility**: Supports custom actions and children
6. **Accessibility**: Proper aria attributes and semantic HTML
7. **Responsive**: Works on all screen sizes

## Styling

The component uses Tailwind CSS with the following color scheme:

- Primary: Blue (`blue-600`, `blue-700`)
- Success: Green (`green-500`)
- Loading: Blue with pulse animation
- Text: Gray scale (`gray-600`, `gray-700`, `gray-900`)
- Borders: Gray (`gray-200`)

## Notes

- The component is fully responsive and works on mobile devices
- Icons should be from the `lucide-react` library
- All text is in Arabic (RTL-ready)
- Buttons have hover states and transitions
- Disabled states are properly handled
