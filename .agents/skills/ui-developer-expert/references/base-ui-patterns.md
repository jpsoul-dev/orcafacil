# Padrões Base UI — Shadcn com `@base-ui-components/react`

> Este projeto usa Shadcn com `"style": "base-vega"` (Base UI como engine primitiva).
> Pacote único: `@base-ui-components/react`. Posicionamento via `@floating-ui/react`.

---

## Diferença fundamental: render prop vs asChild

```tsx
// ❌ Radix (não usar)
<Button asChild>
  <a href="/dashboard">Dashboard</a>
</Button>

// ✅ Base UI (render prop)
<Button render={<a href="/dashboard" />}>Dashboard</Button>

// ✅ Base UI com render function (acesso a props do primitivo)
<Checkbox.Root render={(props) => <div {...props} className="custom-checkbox" />} />
```

---

## Dialog (Modal)

```tsx
import { Dialog } from '@base-ui-components/react/dialog'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  open, onOpenChange, title, description, onConfirm, isLoading
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 animate-in fade-in" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-lg bg-background p-6 shadow-lg animate-in fade-in zoom-in-95">
          <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted-foreground">
            {description}
          </Dialog.Description>

          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close render={<Button variant="outline" />}>Cancelar</Dialog.Close>
            <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// Trigger externo (sem Dialog.Trigger interno ao Root):
<Button onClick={() => setOpen(true)}>Abrir</Button>
<ConfirmDialog open={open} onOpenChange={setOpen} ... />
```

---

## Menu (Dropdown)

```tsx
import { Menu } from '@base-ui-components/react/menu'

interface ActionMenuProps {
  trigger: React.ReactNode
  items: Array<{
    label: string
    icon?: React.ReactNode
    onClick: () => void
    variant?: 'default' | 'destructive'
    disabled?: boolean
  }>
}

export function ActionMenu({ trigger, items }: ActionMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger render={<Button variant="ghost" size="icon" />}>
        {trigger}
      </Menu.Trigger>

      <Menu.Positioner side="bottom" alignment="end" sideOffset={4}>
        <Menu.Popup className="z-50 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95">
          {items.map((item, i) => (
            <Menu.Item
              key={i}
              disabled={item.disabled}
              onClick={item.onClick}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none",
                "hover:bg-accent hover:text-accent-foreground",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                item.variant === 'destructive' && "text-destructive hover:text-destructive"
              )}
            >
              {item.icon}
              {item.label}
            </Menu.Item>
          ))}
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Root>
  )
}
```

---

## Select (com Base UI — suporte a multiple nativo)

```tsx
import { Select } from '@base-ui-components/react/select'

// Select simples
interface SimpleSelectProps {
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  disabled?: boolean
}

export function SimpleSelect({ value, onValueChange, options, placeholder, disabled }: SimpleSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50">
        <Select.Value placeholder={placeholder ?? 'Selecione...'} />
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Select.Trigger>

      <Select.Positioner sideOffset={4}>
        <Select.Popup className="z-50 min-w-[var(--trigger-width)] rounded-md border bg-popover p-1 shadow-md animate-in fade-in zoom-in-95">
          {options.map(opt => (
            <Select.Item
              key={opt.value}
              value={opt.value}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent data-[selected]:font-medium"
            >
              <Select.ItemIndicator>
                <Check className="h-4 w-4" />
              </Select.ItemIndicator>
              <Select.ItemText>{opt.label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Positioner>
    </Select.Root>
  )
}

// ✅ Select múltiplo (nativo no Base UI — não existia no Radix)
<Select.Root multiple value={selectedValues} onValueChange={setSelectedValues}>
  {/* Mesma estrutura acima */}
</Select.Root>
```

---

## Combobox / Autocomplete

```tsx
import { Combobox } from '@base-ui-components/react/combobox'

interface ComboboxFieldProps<T extends { id: string; label: string }> {
  options: T[]
  value: T | null
  onChange: (value: T | null) => void
  placeholder?: string
  filterFn?: (option: T, inputValue: string) => boolean
}

export function ComboboxField<T extends { id: string; label: string }>({
  options, value, onChange, placeholder, filterFn
}: ComboboxFieldProps<T>) {
  const [inputValue, setInputValue] = useState('')

  const filtered = filterFn
    ? options.filter(o => filterFn(o, inputValue))
    : options.filter(o => o.label.toLowerCase().includes(inputValue.toLowerCase()))

  return (
    <Combobox.Root
      value={value}
      onValueChange={onChange}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
    >
      <Combobox.Input
        placeholder={placeholder ?? 'Pesquisar...'}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
      />

      <Combobox.Positioner sideOffset={4}>
        <Combobox.Popup className="z-50 w-[var(--trigger-width)] rounded-md border bg-popover p-1 shadow-md">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Nenhum resultado</div>
          ) : (
            filtered.map(option => (
              <Combobox.Item
                key={option.id}
                value={option}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent data-[selected]:font-medium"
              >
                <Combobox.ItemIndicator>
                  <Check className="h-4 w-4" />
                </Combobox.ItemIndicator>
                {option.label}
              </Combobox.Item>
            ))
          )}
        </Combobox.Popup>
      </Combobox.Positioner>
    </Combobox.Root>
  )
}
```

---

## Popover

```tsx
import { Popover } from '@base-ui-components/react/popover'

export function InfoPopover({ content, children }: { content: ReactNode; children: ReactNode }) {
  return (
    <Popover.Root>
      <Popover.Trigger render={<button type="button" />}>
        {children}
      </Popover.Trigger>

      <Popover.Positioner side="top" alignment="center" sideOffset={8}>
        <Popover.Popup className="z-50 rounded-lg border bg-popover p-4 shadow-md animate-in fade-in zoom-in-95 max-w-xs">
          <Popover.Arrow className="fill-popover" />
          {content}
          <Popover.Close className="absolute right-2 top-2 rounded p-1 hover:bg-accent">
            <X className="h-3 w-3" />
          </Popover.Close>
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Root>
  )
}
```

---

## Tooltip

```tsx
import { Tooltip } from '@base-ui-components/react/tooltip'

export function TooltipWrapper({
  content, children, side = 'top'
}: {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger render={<span />}>{children}</Tooltip.Trigger>
        <Tooltip.Positioner side={side} sideOffset={4}>
          <Tooltip.Popup className="z-50 rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow animate-in fade-in">
            <Tooltip.Arrow className="fill-popover" />
            {content}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
```

---

## Checkbox (com estado indeterminate)

```tsx
import { Checkbox } from '@base-ui-components/react/checkbox'

interface CheckboxFieldProps {
  checked: boolean | 'indeterminate'  // Base UI: boolean strict, use indeterminate prop
  onCheckedChange: (checked: boolean) => void
  label: string
  disabled?: boolean
}

export function CheckboxField({ checked, onCheckedChange, label, disabled }: CheckboxFieldProps) {
  return (
    <Checkbox.Group>
      <div className="flex items-center gap-2">
        <Checkbox.Root
          checked={checked === 'indeterminate' ? false : checked}
          indeterminate={checked === 'indeterminate'}  // ✅ Base UI: prop separada
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          className="h-4 w-4 rounded border border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground"
        >
          <Checkbox.Indicator>
            {checked === 'indeterminate'
              ? <Minus className="h-3 w-3" />
              : <Check className="h-3 w-3" />
            }
          </Checkbox.Indicator>
        </Checkbox.Root>
        <Checkbox.Label className="text-sm font-medium">{label}</Checkbox.Label>
      </div>
    </Checkbox.Group>
  )
}
```

---

## Tabs

```tsx
import { Tabs } from '@base-ui-components/react/tabs'

interface TabItem {
  value: string
  label: string
  content: ReactNode
  badge?: number
}

export function AppTabs({ tabs, defaultValue }: { tabs: TabItem[]; defaultValue: string }) {
  return (
    <Tabs.Root defaultValue={defaultValue} className="w-full">
      <Tabs.List className="flex border-b">
        {tabs.map(tab => (
          <Tabs.Tab
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex items-center gap-1.5 border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground",
              "hover:text-foreground",
              "data-[selected]:border-primary data-[selected]:text-foreground"
            )}
          >
            {tab.label}
            {tab.badge !== undefined && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">{tab.badge}</span>
            )}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map(tab => (
        <Tabs.Panel key={tab.value} value={tab.value} className="mt-4 outline-none">
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  )
}
```

---

## Alertas de migração — NÃO usar padrões Radix

```tsx
// ❌ ERRADO — Radix pattern
import { DialogTrigger } from '@radix-ui/react-dialog'
<DialogTrigger asChild><button>Abrir</button></DialogTrigger>

// ❌ ERRADO — múltiplos pacotes Radix
import * as Select from '@radix-ui/react-select'

// ✅ CORRETO — Base UI
import { Dialog } from '@base-ui-components/react/dialog'
<Dialog.Trigger render={<button />}>Abrir</Dialog.Trigger>

// ❌ ERRADO — data-[state=open] (atributo Radix)
"data-[state=open]:animate-in"

// ✅ CORRETO — data-[open] (atributo Base UI)
"data-[open]:animate-in"
```