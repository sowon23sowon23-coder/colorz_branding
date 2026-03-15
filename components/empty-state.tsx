import { Card, CardContent } from "@/components/ui";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <Card className="border-dashed border-slate-300 bg-slate-50/70">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-14 text-center">
        <div className="text-lg font-semibold text-slate-900">{title}</div>
        <div className="max-w-md text-sm leading-6 text-slate-500">{description}</div>
        {action}
      </CardContent>
    </Card>
  );
}

