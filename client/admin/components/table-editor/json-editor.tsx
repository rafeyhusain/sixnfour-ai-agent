"use client"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { useData } from "./hooks/useData"
import { AlertStrip } from "../wingui/alert-strip/alert-strip"
import { Toolbar } from "./components/toolbar"
import { SpinnerStrip } from "../wingui/spinner-strip/spinner-strip";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react";

interface JsonEditorProps {
  name: string;
}

export function JsonEditor<T>({ name }: JsonEditorProps) {

  const FormSchema = z.object({
    json: z.string(),
  });

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      json: "[]",
    },
  })

  const { data, loading, error, message, saveData, setJson } = useData<T>(name);

  useEffect(() => {
    if (data) {
      form.setValue("json", JSON.stringify(data, null, 2));
    }
  }, [data]);

  if (loading) return <SpinnerStrip show={loading} size="medium" text="Loading..." />

  return (
    <>
      {error && <AlertStrip type="error" title="Error" message={message} />}
      {!error && <AlertStrip type="success" title="Success" message={message} />}
      <br/>
      <Toolbar onSave={saveData} loading={loading} />

      <Form {...form}>
        <form className="w-2/3 space-y-6">
          <FormField
            name="json"
            render={({ field }) => (
              <FormItem>
                <FormDescription>
                  {loading && <Spinner size="small" />} Be cautious: editing JSON directly can break the table if the format is invalid.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="You can enter json for this table"
                    className="resize-none"
                    {...field}
                    onChange={e => {
                      field.onChange(e); // update form state
                      setJson(e.target.value); // update your data state
                    }}
                    rows={16}
                    style={{ width: "100%", fontFamily: "monospace", fontSize: 12 }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  )
}
