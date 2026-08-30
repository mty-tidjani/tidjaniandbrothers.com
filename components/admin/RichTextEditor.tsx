"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  name: string;
  defaultValue?: string;
};

export function RichTextEditor({
  name,
  defaultValue = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none min-h-[400px] p-stack-md focus:outline-none",
      },
    },
  });

  if (!editor) {
    return (
      <div className="border-glass-stroke bg-surface-container-high/50 min-h-[500px] rounded-lg border" />
    );
  }

  const toolbarButton = (
    label: string,
    Icon: React.ComponentType<{ className?: string }>,
    isActive: boolean,
    onClick: () => void,
  ) => (
    <button
      key={label}
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "text-on-surface-variant hover:bg-surface-variant/50 hover:text-primary rounded p-2 transition-colors",
        isActive && "bg-surface-variant/50 text-primary",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );

  return (
    <div className="border-glass-stroke rounded-lg border">
      <div className="border-glass-stroke bg-surface-container-high/50 flex flex-wrap items-center gap-1 border-b p-3">
        {toolbarButton("Gras", Bold, editor.isActive("bold"), () =>
          editor.chain().focus().toggleBold().run(),
        )}
        {toolbarButton("Italique", Italic, editor.isActive("italic"), () =>
          editor.chain().focus().toggleItalic().run(),
        )}
        <div className="bg-glass-stroke mx-2 h-6 w-px" />
        {toolbarButton(
          "Titre 1",
          Heading1,
          editor.isActive("heading", { level: 1 }),
          () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        )}
        {toolbarButton(
          "Titre 2",
          Heading2,
          editor.isActive("heading", { level: 2 }),
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        )}
        <div className="bg-glass-stroke mx-2 h-6 w-px" />
        {toolbarButton(
          "Liste à puces",
          List,
          editor.isActive("bulletList"),
          () => editor.chain().focus().toggleBulletList().run(),
        )}
        {toolbarButton(
          "Liste numérotée",
          ListOrdered,
          editor.isActive("orderedList"),
          () => editor.chain().focus().toggleOrderedList().run(),
        )}
        {toolbarButton("Citation", Quote, editor.isActive("blockquote"), () =>
          editor.chain().focus().toggleBlockquote().run(),
        )}
      </div>
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={editor.getHTML()} readOnly />
    </div>
  );
}
