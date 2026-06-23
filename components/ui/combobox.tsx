import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

export interface ComboboxProps<T> {
  id?: string
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
}

export function Combobox<T>({
  id,
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
}: ComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

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

  // Se houver busca controlada externamente, não filtra localmente
  const filteredItems = React.useMemo(() => {
    if (onSearchChange) return items
    
    const query = search.toLowerCase().trim()
    if (!query) return items.slice(0, 10)

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
      .slice(0, 20)
  }, [items, search, getItemLabel, getItemDescription, getItemSecondaryLabel, onSearchChange])

  return (
    <div className="relative w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          nativeButton={true}
          render={
            <button
              type="button"
              aria-expanded={open}
              aria-invalid={error}
              className={cn(
                "h-10 w-full min-w-0 rounded-sm border border-input bg-card px-3 py-2 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] outline-none flex items-center justify-between",
                "hover:bg-card hover:text-foreground cursor-pointer",
                "dark:bg-input/30",
                !selectedItem && "text-muted-foreground",
                selectedItem && "text-foreground font-medium",
                error
                  ? "border-destructive focus:ring-2 focus:ring-destructive/20 dark:border-destructive/50"
                  : "focus:border-ring focus:ring-2 focus:ring-ring/20",
                className
              )}
            />
          }
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
        </PopoverTrigger>

        <PopoverContent
          className="w-(--anchor-width) min-w-(--anchor-width) p-0 shadow-md border-border rounded-sm overflow-hidden bg-card"
          align="start"
          sideOffset={4}
        >
          <Command shouldFilter={false} className="w-full">
            <CommandInput
              placeholder={searchPlaceholder}
              value={search}
              onValueChange={handleSearchChange}
              className="h-11 border-none focus:ring-0"
            />
            <CommandList className="max-h-[300px] no-scrollbar p-1">
              {filteredItems.length === 0 && !isLoading && (
                <CommandEmpty className="py-6 flex flex-col items-center justify-center text-center px-4">
                  <p className="text-sm text-slate-500 mb-3">{emptyStateText}</p>
                  {renderCreateAction && renderCreateAction()}
                </CommandEmpty>
              )}

              {isLoading && (
                <div className="py-6 text-center text-sm text-slate-500">
                  Carregando...
                </div>
              )}

              <div className="overflow-y-auto">
                {filteredItems.map((item) => {
                  const key = getItemKey(item)
                  const isSelected = value === key
                  return (
                    <CommandItem
                      key={key}
                      value={key}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center justify-between py-2 px-3 cursor-pointer rounded-md data-[selected=true]:bg-slate-100 dark:data-[selected=true]:bg-slate-800 transition-colors"
                    >
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
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </CommandItem>
                  )
                })}
              </div>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
