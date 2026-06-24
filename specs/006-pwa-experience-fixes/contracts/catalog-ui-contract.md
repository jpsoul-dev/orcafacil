# Component Contract: Catalog Selector UI

This contract defines the interfaces and properties required for switching between `Dialog` and `Drawer` components on mobile and desktop viewports for the item catalog selector.

## UI Selection Schema

The rendering engine switches components dynamically based on the viewport media query (`(max-width: 640px)`):

```typescript
interface ResponsivePickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: React.ReactNode
  title: string
  children: React.ReactNode
}
```

### Desktop Model (`Dialog`)
- **Container**: `Dialog` (from `@/components/ui/dialog`)
- **Overlay**: Faded translucent black background (`bg-black/80`).
- **Positioning**: Fixed centering on both X and Y axes (`left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2`).
- **Animation**: Fade-in and scale-up zoom (`duration-ds-fast animate-in zoom-in-95`).

### Mobile Model (`Drawer` / Bottom Sheet)
- **Container**: `Drawer` (from `vaul` / `@/components/ui/drawer`)
- **Overlay**: Translucent overlay with click-to-dismiss behavior.
- **Positioning**: Fixed at the bottom of the viewport (`fixed inset-x-0 bottom-0`).
- **Animation**: Slide up from the bottom edge (`slide-in-from-bottom duration-ds-fast`).
- **Ergonomics**: Includes a visible indicator pill at the top of the sheet for dragging/closing.

---

## Inter-component Data Integration

The children contents inside both layouts must consume the identical state and callback parameters:

```typescript
interface CatalogPickerContentProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  items: CatalogItem[]
  onItemSelect: (item: CatalogItem) => void
  onClose: () => void
}
```

### Search Input Behavior
- Focus is automatically requested on open.
- Key bindings: `Escape` closes the selector, `ArrowDown` / `ArrowUp` navigates list items (optional), `Enter` selects the active item.
- Inputs must support standard font sizes (`text-base` for mobile to prevent viewport scaling).
