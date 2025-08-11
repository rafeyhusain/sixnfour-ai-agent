import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface Action {
  label: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
  actions?: Action[];
}

export function Toolbar({ actions }: { actions: Action[] }) {
  return (
    <div className="flex items-center gap-3 py-2 px-4 bg-muted/40 rounded-xl border border-border shadow-sm mb-4">
      {actions.map((action, idx) => (
        <div key={action.label + idx} className="relative">
          {action.actions ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant={action.variant || "default"}>{action.label}</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {action.actions.map((subAction, subIdx) => (
                  <DropdownMenuItem
                    key={subAction.label + subIdx}
                    onSelect={subAction.onClick}
                    asChild={false}
                  >
                    {subAction.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant={action.variant || "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      ))}
    </div>
  );
} 