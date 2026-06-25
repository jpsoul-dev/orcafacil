"use client"

import * as React from "react"
import { Check, ChevronDown, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command as CommandPrimitive } from "cmdk"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Drawer } from "vaul"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { useIsMobile } from "@/hooks/use-mobile"

export interface EntitySelectorProps<T> {
  id?: string
  title?: string
  items: T[]
  value: string | null
  onChange: (value: string | null) => void
  getItemKey: (item: T) => string
  getItemLabel: (item: T) => string
  getItemDescription?: (item: T) => string
  getItemSecondaryLabel?: (item: T) => string
  
  placeholder?: string
  searchPlaceholder?: string
  emptyStateText?: string
  error?: boolean
  className?: string
  
  // Customização de Ações e Busca
  isLoading?: boolean
  onSearchChange?: (query: string) => void
  renderCreateAction?: () => React.ReactNode
  
  // Customização de UI
  customTrigger?: React.ReactNode
  renderItem?: (item: T, isSelected: boolean) => React.ReactNode
}

export function EntitySelector<T>({
  id,
  title = "Selecionar",
  items,
  value,
  onChange,
  getItemKey,
  getItemLabel,
  getItemDescription,
  getItemSecondaryLabel,
  placeholder = "Selecionar item...",
  searchPlaceholder = "Buscar...",
  emptyStateText = "Nenhum resultado encontrado.",
  error = false,
  className,
  isLoading = false,
  onSearchChange,
  renderCreateAction,
  customTrigger,
  renderItem,
}: EntitySelectorProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const isMobile = useIsMobile()

  const selectedItem = React.useMemo(() => {
    return items.find((item) => getItemKey(item) === value)
  }, [value, items, getItemKey])

  const handleSelect = (item: T) => {
    const key = getItemKey(item)
    onChange(key === value ? null : key)
    setOpen(false)
    setSearch("")
    if (onSearchChange) onSearchChange("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(null)
    setSearch("")
    if (onSearchChange) onSearchChange("")
  }

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (onSearchChange) onSearchChange(val)
  }

  const filteredItems = React.useMemo(() => {
    if (onSearchChange) return items
    
    const query = search.toLowerCase().trim()
    if (!query) return items.slice(0, 50)

    return items
      .filter((item) => {
        const label = getItemLabel(item).toLowerCase()
        const desc = getItemDescription ? getItemDescription(item).toLowerCase() : ""
        const secLabel = getItemSecondaryLabel ? getItemSecondaryLabel(item).toLowerCase() : ""
        
        return (
          label.includes(query) || 
          desc.includes(query) || 
          secLabel.includes(query)
        )
      })
      .slice(0, 50)
  }, [items, search, getItemLabel, getItemDescription, getItemSecondaryLabel, onSearchChange])

  const triggerButton = (
    <button
      id={id}
      type="button"
      aria-expanded={open}
      aria-invalid={error}
      className={cn(
        "h-11 w-full min-w-0 rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none flex items-center justify-between",
        "hover:bg-card hover:text-foreground cursor-pointer",
        "dark:bg-input/30",
        !selectedItem && "text-muted-foreground",
        selectedItem && "text-foreground font-medium",
        error
          ? "border-destructive focus:ring-2 focus:ring-destructive/20 dark:border-destructive/50"
          : "focus:border-ring focus:ring-2 focus:ring-ring/20",
        className
      )}
    >
      <span className="truncate">
        {selectedItem ? getItemLabel(selectedItem) : placeholder}
      </span>
      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        {value && (
          <div
            role="button"
            tabIndex={0}
            onClick={handleClear}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors group"
            title="Limpar seleção"
          >
            <X className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
          </div>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </div>
    </button>
  )

  const finalTrigger = customTrigger || triggerButton

  const content = (
    <Command shouldFilter={false} className="w-full flex-1 flex flex-col overflow-hidden bg-transparent">
      <div className="p-4 border-b shrink-0 bg-card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <CommandPrimitive.Input
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={handleSearchChange}
            className="h-11 w-full min-w-0 rounded-sm border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 dark:bg-input/30"
            autoFocus={!isMobile}
          />
        </div>
      </div>
      <CommandList className="flex-1 overflow-y-auto no-scrollbar p-2">
        {filteredItems.length === 0 && !isLoading && (
          <CommandEmpty className="py-6 flex flex-col items-center justify-center text-center px-4">
            <p className="text-sm text-slate-500 mb-3">{emptyStateText}</p>
          </CommandEmpty>
        )}

        {isLoading && (
          <div className="py-6 text-center text-sm text-slate-500">
            Carregando...
          </div>
        )}

        {filteredItems.map((item) => {
          const key = getItemKey(item)
          const isSelected = value === key
          return (
            <CommandItem
              key={key}
              value={key}
              onSelect={() => handleSelect(item)}
              className="flex items-center justify-between py-3 px-3 cursor-pointer rounded-md data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors mb-1"
            >
              {renderItem ? (
                renderItem(item, isSelected)
              ) : (
                <>
                  <div className="flex flex-col min-w-0 pr-4">
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {getItemLabel(item)}
                    </span>
                    {(getItemDescription || getItemSecondaryLabel) && (
                      <div className="flex items-center gap-2 mt-0.5 opacity-60">
                        {getItemDescription && (
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {getItemDescription(item)}
                          </span>
                        )}
                        {getItemSecondaryLabel && (
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {getItemSecondaryLabel(item)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-primary shrink-0" />
                  )}
                </>
              )}
            </CommandItem>
          )
        })}
      </CommandList>
      {renderCreateAction && (
        <div className="p-4 border-t bg-card mt-auto shrink-0">
          {renderCreateAction()}
        </div>
      )}
    </Command>
  )

  if (isMobile) {
    return (
      <div className="w-full relative">
        <Drawer.Root open={open} onOpenChange={setOpen}>
          <Drawer.Trigger asChild>
            {finalTrigger}
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[10px] bg-card outline-none h-[85vh] max-h-[85vh]">
              <div className="p-4 bg-card rounded-t-[10px] shrink-0 border-b flex flex-col items-center">
                <div className="mx-auto h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/20 mb-4" />
                <Drawer.Title className="text-lg font-semibold text-center">{title}</Drawer.Title>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col">
                {content}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={finalTrigger} />
        <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col border-l">
          <SheetHeader className="px-4 py-4 border-b shrink-0 text-left">
            <SheetTitle>{title}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-hidden flex flex-col">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
