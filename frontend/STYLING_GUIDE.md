# StackFlow Frontend - Styling Guide

## Overview

The frontend has been styled with a minimal, clean, and modern design using Tailwind CSS. All pages follow a consistent design language for a cohesive user experience.

## Design System

### Color Palette

**Primary Colors:**
- Primary 50-900: Blue shades (main brand color)
- Used for buttons, links, accents, and interactive elements

**Neutral Colors:**
- Gray 50-900: Used for backgrounds, text, borders
- White: Card backgrounds, inputs

**Status Colors:**
- Blue: Projects, informational
- Green: Success states, tasks
- Red: Errors, warnings
- Purple: Team/users

### Typography

- **Font Family**: System fonts (Inter, system-ui, sans-serif)
- **Headings**: Bold, clear hierarchy
  - H1: 3-4xl (Brand/Logo)
  - H2: 2-3xl (Page titles)
  - H3: xl (Section titles)
- **Body**: text-base (16px default)
- **Small text**: text-sm, text-xs for metadata

## Custom CSS Classes

### Buttons

```css
.btn                 /* Base button style */
.btn-primary         /* Primary action buttons (blue) */
.btn-secondary       /* Secondary actions (gray) */
.btn-outline         /* Outlined buttons for less emphasis */
```

**Usage:**
```jsx
<button className="btn btn-primary">Submit</button>
<button className="btn btn-outline">Cancel</button>
```

### Inputs

```css
.input              /* Base input style */
.input-error        /* Error state for inputs */
```

**Usage:**
```jsx
<input className="input" type="email" />
<input className="input input-error" type="text" />
```

### Cards

```css
.card               /* Base card container */
.card-hover         /* Hover effect for clickable cards */
```

**Usage:**
```jsx
<div className="card p-6">Content</div>
<div className="card card-hover p-6">Clickable content</div>
```

## Page-by-Page Styling

### 1. Authentication Pages

**Design Features:**
- Gradient background (primary-50 to blue-50)
- Centered card layout
- Brand logo at top
- Clear CTAs
- Inline form validation
- Loading spinners

**Pages:**
- [Register.jsx](src/pages/auth/Register.jsx)
- [Login.jsx](src/pages/auth/Login.jsx)
- [VerifyOtp.jsx](src/pages/auth/VerifyOtp.jsx)

### 2. Onboarding Flow

**Design Features:**
- Gradient background
- Progress bar showing completion
- Step-by-step navigation
- Back button on each step
- Icons for visual appeal
- Consistent card layout

**Layout:**
- [OnboardingLayout.jsx](src/pages/onboarding/OnboardingLayout.jsx)

**Steps (1-9):**
- Step 1: Welcome with checklist
- Step 2: Workspace creation
- Step 3: Profile setup with password
- Step 4: Role selection with checkboxes
- Step 5: Project naming
- Step 6: Section management with add/remove
- Step 7: Task creation
- Step 8: Layout selection with cards
- Step 9: Team invitations

### 3. Dashboard

**Design Features:**
- Header with logo and user info
- Workspace grid layout
- Icon-based visual hierarchy
- Empty states with CTAs
- Hover effects on cards
- Role badges

**File:** [Dashboard.jsx](src/pages/dashboard/Dashboard.jsx)

### 4. Workspace

**Design Features:**
- Stats cards with icons
- Metric visualization
- Coming soon placeholder
- Consistent header pattern

**File:** [Workspace.jsx](src/pages/dashboard/Workspace.jsx)

### 5. Invitation Accept

**Design Features:**
- Loading state
- Success/Error states with icons
- Auto-redirect countdown
- Clear messaging

**File:** [InvitationAccept.jsx](src/pages/InvitationAccept.jsx)

## Icons

All icons use SVG with Heroicons style:
- Consistent stroke width (2)
- 24x24 viewBox
- Inline SVG for performance
- Color matched to context

Common icons:
- Email (envelope)
- Checkmark (success)
- X (error/close)
- Arrow (navigation)
- Briefcase (workspace)
- Users (team)
- Document (projects)
- Clipboard (tasks)

## Responsive Design

### Breakpoints (Tailwind Default)
- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px

### Mobile-First Approach
- Base styles for mobile
- Use sm:, md:, lg: prefixes for larger screens
- Hide/show elements with hidden/block classes
- Stack elements vertically on mobile

**Example:**
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

## Loading States

All loading states use spinning circle animation:

```jsx
<svg className="animate-spin h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
</svg>
```

## Form Patterns

### Input Groups
```jsx
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Label
  </label>
  <input type="text" className="input" />
</div>
```

### Error Messages
```jsx
{error && (
  <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
    {error}
  </div>
)}
```

### Success Messages
```jsx
{success && (
  <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
    {success}
  </div>
)}
```

## Spacing System

- **Tight**: mb-2, gap-2 (8px)
- **Normal**: mb-4, gap-4 (16px)
- **Comfortable**: mb-6, gap-6 (24px)
- **Loose**: mb-8, gap-8 (32px)

## Animation & Transitions

- **Duration**: duration-200, duration-300, duration-500
- **Easing**: ease-out, ease-in-out
- **Hover states**: All interactive elements have hover effects
- **Focus states**: All inputs and buttons have focus rings

## Best Practices

### 1. Consistency
- Use predefined classes (.btn, .input, .card)
- Follow spacing patterns
- Maintain color hierarchy

### 2. Accessibility
- Always include labels
- Use semantic HTML
- Provide focus indicators
- Include ARIA attributes when needed

### 3. Performance
- Inline critical SVG icons
- Use Tailwind's utility classes (optimized in build)
- Avoid custom CSS when Tailwind utilities work

### 4. Maintainability
- Keep components small and focused
- Reuse common patterns
- Document non-obvious choices

## Customization

### Adding New Colors
Edit [tailwind.config.js](tailwind.config.js):

```js
theme: {
  extend: {
    colors: {
      brand: {
        500: '#your-color',
      },
    },
  },
}
```

### Adding New Components
Add to [index.css](src/index.css) in the `@layer components` section:

```css
@layer components {
  .your-component {
    /* styles */
  }
}
```

## Browser Support

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Known Issues

None currently. The styling is production-ready.

## Future Enhancements

Potential improvements:
- Dark mode support
- More button variants (danger, success, warning)
- Toast notification component
- Modal component
- Dropdown component
- Date picker styling
- File upload component
- Rich text editor styling

---

**Minimal, Clean, Professional - Ready for Production**
