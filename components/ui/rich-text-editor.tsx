import * as React from 'react'
import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  RemoveFormatting,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  const handleToggle = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault() // Prevent form submission
    action()
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 border-b border-border bg-muted/40 rounded-t-sm">
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('bold') && 'bg-muted')}
        onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleBold().run())}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        title="Negrito"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('italic') && 'bg-muted')}
        onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleItalic().run())}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        title="Itálico"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('strike') && 'bg-muted')}
        onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleStrike().run())}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        title="Riscado"
      >
        <Strikethrough className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('bulletList') && 'bg-muted')}
        onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleBulletList().run())}
        title="Lista"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn('h-8 w-8', editor.isActive('orderedList') && 'bg-muted')}
        onClick={(e) => handleToggle(e, () => editor.chain().focus().toggleOrderedList().run())}
        title="Lista Numerada"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-border mx-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => handleToggle(e, () => editor.chain().focus().clearNodes().unsetAllMarks().run())}
        title="Limpar formatação"
      >
        <RemoveFormatting className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // desabilita headings para manter simples
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Escreva aqui...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Retorna string HTML
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-3 text-ds-body-sm',
      },
    },
  })

  // Sincroniza o valor externo caso mude (útil para form reset)
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div className={cn(
      'flex flex-col border border-input rounded-sm bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring/20 focus-within:border-ring transition-[border-color,box-shadow]',
      className
    )}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />

      <style dangerouslySetInnerHTML={{
        __html: `
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: hsl(var(--muted-foreground));
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror p:first-child {
          margin-top: 0;
        }
        .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror li p {
          margin: 0;
        }
      `}} />
    </div>
  )
}
