import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { JsonEditor } from "@/components/table-editor/json-editor"
import { TableEditor } from "@/components/table-editor/table-editor"
import { CampaignTask, Setting, Schedule, CampaignType, Campaign, ExampleTable } from "./table-editor/model/types";
import { Table } from "./table-editor/model/data"

interface DataEditorProps {
  name: string;
}

export function DataEditor({ name }: DataEditorProps) {
  return (
    <div>
      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="json">Json</TabsTrigger>
        </TabsList>
        <TabsContent value="table">
          <Card>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>
                Make changes to <b>{name}</b> here. Click save when you&apos;re
                done.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                switch (name) {
                  case Table.Campaigns:
                    return <TableEditor<Campaign> name={name} />;
                  case Table.CampaignTypes:
                    return <TableEditor<CampaignType> name={name} />;
                  case Table.CampaignTasks:
                    return <TableEditor<CampaignTask> name={name} />;
                  case Table.Settings:
                    return <TableEditor<Setting> name={name} />;
                  case Table.Schedules:
                    return <TableEditor<Schedule> name={name} />;
                  case Table.ExampleTable:
                    return <TableEditor<ExampleTable> name={name} />;
                  case Table.Prompts:
                    return <TableEditor<ExampleTable> name={name} />;
                }
              })()}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="json">
          <Card>
            <CardHeader>
              <CardTitle>{name}</CardTitle>
              <CardDescription>
                Make changes to <b>{name}</b> here. Click save when you&apos;re
                done.
              </CardDescription>
            </CardHeader>
            <CardContent>
            {(() => {
                switch (name) {
                  case Table.Campaigns:
                    return <JsonEditor<Campaign> name={name} />;
                  case Table.CampaignTypes:
                    return <JsonEditor<CampaignType> name={name} />;
                  case Table.CampaignTasks:
                    return <JsonEditor<CampaignTask> name={name} />;
                  case Table.Settings:
                    return <JsonEditor<Setting> name={name} />;
                  case Table.Schedules:
                    return <JsonEditor<Schedule> name={name} />;
                  case Table.ExampleTable:
                    return <JsonEditor<ExampleTable> name={name} />;
                  case Table.Prompts:
                    return <JsonEditor<ExampleTable> name={name} />;
                }
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
