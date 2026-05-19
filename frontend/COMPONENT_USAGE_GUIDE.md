# Component Usage Guide

Quick reference for the new and enhanced components in the Smart Placement Tracker.

## Import Pattern

```javascript
// Single imports
import { Card, Button, Badge } from '../components/ui';
// or
import Card from '../components/ui/Card';
```

---

## UI Components Reference

### Card Component

**Enhanced with variants and hover effects**

```jsx
// Default
<Card title="Title" subtitle="Subtitle">
  Content
</Card>

// Elevated variant
<Card variant="elevated" title="Title">
  Content
</Card>

// Gradient variant
<Card variant="gradient" title="Title">
  Content
</Card>

// Non-hoverable
<Card hoverable={false}>
  Content
</Card>

// With action
<Card title="Title" action={<Button>Action</Button>}>
  Content
</Card>
```

### StatCard Component

```jsx
import { Users, TrendingUp } from 'lucide-react';
import { StatCard } from '../components/ui';

// Basic
<StatCard 
  title="Total Users" 
  value={1234}
  icon={Users}
  color="blue"
/>

// With trend
<StatCard 
  title="Growth" 
  value="+25%"
  trend="↑ 5% from last week"
  icon={TrendingUp}
  color="green"
  subtitle="Monthly"
/>

// Color options: blue, green, purple, orange, pink, cyan
```

### Button Component

```jsx
// Variants
<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icon
<Button icon={Save}>Save</Button>

// Loading
<Button loading>Saving...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### FormField Component

```jsx
import { Mail, Lock } from 'lucide-react';
import FormField from '../components/ui/FormField';

// Basic
<FormField label="Email" type="email" />

// With icon
<FormField 
  label="Email" 
  icon={Mail}
  hint="We'll never share your email"
/>

// With error
<FormField 
  label="Password" 
  type="password"
  icon={Lock}
  error="Password is required"
  showPasswordToggle
/>

// Required field
<FormField label="Name" required />
```

### Select Component

```jsx
import { Select } from '../components/ui';

const options = [
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' },
];

<Select 
  options={options}
  value={selected}
  onChange={setSelected}
  label="Choose option"
  placeholder="Select..."
/>
```

### Tabs Component

```jsx
import { Tabs } from '../components/ui';

const tabs = [
  { label: 'Tab 1', content: <div>Content 1</div> },
  { label: 'Tab 2', content: <div>Content 2</div> },
];

<Tabs 
  tabs={tabs}
  defaultTab={0}
  onChange={(idx) => console.log(idx)}
/>
```

### Modal Component

```jsx
import { Modal } from '../components/ui';
import Button from '../components/ui/Button';

const [open, setOpen] = useState(false);

<Modal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  Are you sure you want to proceed?
</Modal>
```

### Table Components

```jsx
import { 
  Table, TableHead, TableBody, 
  TableRow, TableCell 
} from '../components/ui';

<Table>
  <TableHead>
    <TableRow>
      <TableCell header>Name</TableCell>
      <TableCell header align="center">Status</TableCell>
      <TableCell header align="right">Actions</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell align="center">
        <Badge variant="success">Active</Badge>
      </TableCell>
      <TableCell align="right">
        <Button size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Alert Component

```jsx
import { Alert } from '../components/ui';

// Error
<Alert 
  variant="error" 
  title="Error"
  description="Something went wrong"
/>

// Success
<Alert 
  variant="success" 
  title="Success"
  description="Operation completed"
/>

// Info
<Alert 
  variant="info" 
  title="Info"
  description="This is informational"
/>

// Warning
<Alert 
  variant="warning" 
  title="Warning"
  description="Please be careful"
  closeable={true}
  onClose={() => console.log('closed')}
/>
```

### Spinner Component

```jsx
import Spinner, { LoadingOverlay } from '../components/ui/Spinner';

// Inline spinner
<Spinner size="md" />
<Spinner size="sm" />
<Spinner size="lg" />

// Full screen overlay
<LoadingOverlay fullScreen text="Loading..." />
```

### Skeleton Components

```jsx
import { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton,
  ChartSkeleton
} from '../components/ui';

// Generic skeleton
<Skeleton className="h-12 w-1/2 rounded-lg" />

// Card skeleton
<CardSkeleton />

// Table skeleton
<TableSkeleton rows={5} />

// Chart skeleton
<ChartSkeleton />
```

### PageHeader Component

```jsx
import PageHeader from '../components/ui/PageHeader';

// Basic
<PageHeader 
  title="Page Title" 
  description="Page description"
/>

// With action
<PageHeader 
  title="Students" 
  description="Manage students"
  action={<Button>Add Student</Button>}
/>

// With breadcrumb
<PageHeader 
  title="Student Profile" 
  breadcrumb={[
    { label: 'Home', href: '/' },
    { label: 'Students', href: '/students' },
    { label: 'John', href: '/students/john' },
  ]}
/>
```

### Badge Component

```jsx
import Badge from '../components/ui/Badge';

// Variants
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>
<Badge variant="purple">Purple</Badge>
<Badge variant="default">Default</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

### Divider Component

```jsx
import { Divider, Grid } from '../components/ui/Divider';

// Simple divider
<Divider />

// With label
<Divider label="Or continue with" />

// Grid helper
<Grid columns={3} gap={4}>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</Grid>

// Grid columns: 1, 2, 3, 4, 5, 6
// Gap: 2, 3, 4, 6, 8
```

### PageState Components

```jsx
import { 
  LoadingGrid, 
  ErrorState, 
  SuccessState,
  EmptyState 
} from '../components/ui';

// Loading
<LoadingGrid count={6} />

// Error
<ErrorState 
  title="Error loading data"
  message="Please try again"
  onRetry={handleRetry}
/>

// Success
<SuccessState 
  title="Success!"
  message="Your changes have been saved"
  action={<Button>View</Button>}
/>

// Empty
<EmptyState 
  title="No data"
  description="No items to display"
  action={<Button>Create Item</Button>}
/>
```

---

## Layout Components

### Header Component
Already integrated in DashboardLayout, automatically handles:
- Theme toggle
- Notifications
- Logout
- Mobile menu toggle

### Sidebar Component
Already integrated in DashboardLayout, automatically handles:
- Navigation links
- Unread notification count
- User profile card
- Mobile responsiveness

### DashboardLayout Component
Wraps the entire dashboard with:
- Header at top
- Sidebar on left
- Main content area
- Responsive behavior

---

## Common Patterns

### Form with Validation

```jsx
import FormField from '../components/ui/FormField';
import Button from '../components/ui/Button';
import { Alert } from '../components/ui';

export function ContactForm() {
  const [data, setData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    const newErrors = {};
    if (!data.name) newErrors.name = 'Name is required';
    if (!data.email) newErrors.email = 'Email is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // Submit
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        label="Name"
        value={data.name}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        error={errors.name}
        required
      />
      <FormField
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        error={errors.email}
        required
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Data Display Table

```jsx
import { Table, TableHead, TableBody, TableRow, TableCell } from '../components/ui';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export function StudentList({ students }) {
  return (
    <Card title="Students" subtitle="All registered students">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell header>Name</TableCell>
            <TableCell header>Email</TableCell>
            <TableCell header>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>
                <Badge variant={student.status === 'active' ? 'success' : 'warning'}>
                  {student.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
```

---

## Responsive Design Tips

1. Use `Grid` component for responsive layouts
2. Cards are responsive by default
3. Tables scroll horizontally on mobile
4. Modals adapt to screen size
5. Use `sm:`, `md:`, `lg:` Tailwind breakpoints

---

## Dark Mode

All components automatically support dark mode:
- Use `dark:` prefix in Tailwind classes
- Components detect system preference
- Manual toggle via Header theme button

---

## Animation Classes

Available animation utilities:

```css
.animate-fade-in        /* Fade in with slide up */
.animate-fade-in-up     /* Larger fade up */
.animate-slide-in-right /* Slide from left */
.animate-pulse-glow     /* Pulsing glow */
.animate-gradient-shift /* Gradient animation */
```

---

## Tips & Best Practices

1. **Use variants**: Choose appropriate card and button variants
2. **Icons**: Always use Lucide React icons for consistency
3. **Colors**: Use color props (blue, green, purple, etc.)
4. **Spacing**: Use consistent gap and padding values
5. **Loading**: Always show LoadingGrid or skeleton while loading
6. **Empty states**: Always handle empty data with EmptyState
7. **Errors**: Use ErrorState for error handling
8. **Accessibility**: Add labels and error messages
9. **Mobile**: Test on mobile devices
10. **Dark mode**: Test dark mode for all new components

---

## Common Issues & Solutions

**Issue**: Button doesn't align with input
**Solution**: Wrap in container with `flex gap-2`

**Issue**: Modal appears behind overlay
**Solution**: Modal component handles z-index automatically

**Issue**: Table overflows on mobile
**Solution**: Table automatically scrolls horizontally

**Issue**: Form fields have inconsistent heights
**Solution**: Use FormField component for consistency