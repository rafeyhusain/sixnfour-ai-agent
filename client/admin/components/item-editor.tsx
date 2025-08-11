import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Numeric input from shadcn/ui (Input with type="number")

interface ItemEditorProps<T extends Record<string, any>> {
  item: T;
}

export function ItemEditor<T extends Record<string, any>>({ item }: ItemEditorProps<T>) {
  if (!item) return null;

  return (
    <form className="space-y-4">
      {Object.entries(item).map(([key, value]) => {
        // Readonly textbox for 'id'
        if (key === "id") {
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>{key}</label>
              <Input id={key} value={value} readOnly className="bg-gray-100" />
            </div>
          );
        }
        // Textarea for 'description'
        if (key === "description") {
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>{key}</label>
              <Textarea id={key} value={value} readOnly={false} />
            </div>
          );
        }
        // Numeric input for numbers
        if (typeof value === "number") {
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>{key}</label>
              <Input id={key} type="number" value={value} readOnly={false} />
            </div>
          );
        }
        // Default input for strings
        if (typeof value === "string") {
          return (
            <div key={key}>
              <label className="block text-sm font-medium mb-1" htmlFor={key}>{key}</label>
              <Input id={key} value={value} readOnly={false} />
            </div>
          );
        }
        // For arrays/objects, just show JSON
        return (
          <div key={key}>
            <label className="block text-sm font-medium mb-1" htmlFor={key}>{key}</label>
            <Textarea id={key} value={JSON.stringify(value, null, 2)} readOnly />
          </div>
        );
      })}
    </form>
  );
} 