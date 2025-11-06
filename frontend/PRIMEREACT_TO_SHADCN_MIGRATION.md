# PrimeReact to shadcn/ui Migration Guide

## Overview

This guide documents the migration from PrimeReact to shadcn/ui component library.

## Why Migrate?

- **Modern Stack**: shadcn/ui is built on Radix UI primitives with Tailwind CSS
- **Customizable**: Components are copied into your project, fully customizable
- **Type-safe**: Built with TypeScript in mind
- **Smaller Bundle**: No runtime dependency, tree-shakeable
- **Better DX**: Works seamlessly with Tailwind

## Setup Completed

✅ Installed dependencies:
- `class-variance-authority`, `clsx`, `tailwind-merge`
- `lucide-react` (icons)
- `@radix-ui/*` (component primitives)
- `sonner` (toast notifications)
- `tailwindcss-animate`

✅ Updated Tailwind configuration
✅ Created component library in `src/components/ui/`
✅ Added utility functions in `src/lib/utils.js`
✅ Updated CSS with design tokens

## Component Mapping

| PrimeReact Component | shadcn/ui Equivalent | Status |
|---------------------|----------------------|--------|
| `<Button>` | `<Button>` | ✅ Ready |
| `<InputText>` | `<Input>` | ✅ Ready |
| `<Password>` | `<Input type="password">` | ✅ Ready |
| `<Dropdown>` | `<Select>` | ✅ Ready |
| `<MultiSelect>` | Custom with `<Select>` | 📝 Manual |
| `<Dialog>` | `<Dialog>` | ✅ Ready |
| `<Message>` | `<Alert>` | ✅ Ready |
| `<Toast>` | `<Toaster>` from sonner | ✅ Ready |
| `<OverlayPanel>` | `<Popover>` | ✅ Ready |
| `<Chips>` | `<Badge>` | ✅ Ready |
| `<ProgressSpinner>` | `<Loader2>` from lucide | ✅ Ready |
| `<Stepper>` | Custom component | 📝 Manual |
| `classNames` | `cn` utility | ✅ Ready |

## Migration Steps

### 1. Update Imports

**Before:**
```jsx
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import 'primereact/resources/themes/lara-light-teal/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
```

**After:**
```jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';
```

### 2. Update Component Usage

#### Button
**Before:**
```jsx
<Button label="Click me" icon="pi pi-check" severity="primary" />
```

**After:**
```jsx
<Button>Click me</Button>
// Or with icon
<Button><Check className="mr-2 h-4 w-4" />Click me</Button>
```

#### Input
**Before:**
```jsx
<InputText value={value} onChange={(e) => setValue(e.target.value)} />
```

**After:**
```jsx
<Input value={value} onChange={(e) => setValue(e.target.value)} />
```

#### Select (Dropdown)
**Before:**
```jsx
<Dropdown
  value={selectedValue}
  options={options}
  onChange={(e) => setSelectedValue(e.value)}
  optionLabel="label"
/>
```

**After:**
```jsx
<Select value={selectedValue} onValueChange={setSelectedValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    {options.map((option) => (
      <SelectItem key={option.value} value={option.value}>
        {option.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

#### Dialog
**Before:**
```jsx
<Dialog
  visible={visible}
  onHide={() => setVisible(false)}
  header="Dialog Title"
>
  Content here
</Dialog>
```

**After:**
```jsx
<Dialog open={visible} onOpenChange={setVisible}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    Content here
  </DialogContent>
</Dialog>
```

#### Alert (Message)
**Before:**
```jsx
<Message severity="error" text="Error message" />
```

**After:**
```jsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Error message</AlertDescription>
</Alert>
```

#### Toast
**Before:**
```jsx
import { Toast } from 'primereact/toast';
const toast = useRef(null);

toast.current.show({ severity: 'success', summary: 'Success', detail: 'Message' });

<Toast ref={toast} />
```

**After:**
```jsx
import { toast } from 'sonner';

toast.success('Message');

// In main.jsx:
<Toaster />
```

#### Popover (OverlayPanel)
**Before:**
```jsx
<OverlayPanel ref={op}>Content</OverlayPanel>
<Button onClick={(e) => op.current.toggle(e)} />
```

**After:**
```jsx
<Popover>
  <PopoverTrigger asChild>
    <Button>Open</Button>
  </PopoverTrigger>
  <PopoverContent>Content</PopoverContent>
</Popover>
```

### 3. Update Styling

- Remove PrimeReact CSS imports
- Use Tailwind classes directly
- Use shadcn/ui component variants

### 4. Update Icon Usage

**Before:**
```jsx
<i className="pi pi-check" />
```

**After:**
```jsx
import { Check } from 'lucide-react';
<Check className="h-4 w-4" />
```

## Files Requiring Manual Migration

The following files need manual component updates:

1. `/src/pages/onboarding/*.jsx` - Onboarding steps
2. `/src/components/modals/CreateProjectModal.jsx`
3. `/src/components/shared/InviteDialog.jsx`
4. `/src/components/dashboard/ProjectHeader.jsx`
5. `/src/components/common/LanguageSwitcher.jsx`
6. `/src/pages/projects/ProjectBoard.jsx`

##  Custom Components Needed

### MultiSelect
Create a custom multi-select component using shadcn Select or Checkbox components.

### Stepper
Create a custom stepper component for onboarding flow.

## Testing Checklist

- [ ] All pages render without errors
- [ ] Forms work correctly
- [ ] Modals/dialogs open and close
- [ ] Dropdowns and selects function properly
- [ ] Toast notifications appear
- [ ] Responsive design maintained
- [ ] Accessibility features work

## Rollback Plan

If needed to rollback:
1. `git revert <commit-hash>`
2. `npm install primereact primeicons`
3. Restore `main.jsx` and `tailwind.config.js`

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Lucide Icons](https://lucide.dev/icons/)
- [Sonner Toast](https://sonner.emilkowal.ski/)

