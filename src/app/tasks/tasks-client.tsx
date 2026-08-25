"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateTaskStatusAction } from "@/server/services/task.actions";
import { CheckSquare, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface TasksClientProps {
  taskData: {
    todoTasks: any[];
    inProgressTasks: any[];
    completedTasks: any[];
  };
  canManage: boolean;
}

export function TasksClient({ taskData, canManage }: TasksClientProps) {
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);

  async function handleStatusChange(taskId: string, nextStatus: "TODO" | "IN_PROGRESS" | "COMPLETED") {
    setLoadingTaskId(taskId);
    try {
      await updateTaskStatusAction(taskId, nextStatus);
    } catch (err: any) {
      alert(err.message || "Failed to update task status.");
    } finally {
      setLoadingTaskId(null);
    }
  }

  const renderTaskCard = (task: any, currentStatus: string) => (
    <Card key={task.id} className={task.priority === "URGENT" ? "border-destructive/40 bg-destructive/5" : ""}>
      <CardContent className="p-3 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <Badge
            variant={task.priority === "URGENT" ? "destructive" : task.priority === "HIGH" ? "default" : "outline"}
            className="text-[9px]"
          >
            {task.priority} • {task.category}
          </Badge>
        </div>

        <div className="font-bold text-foreground">{task.title}</div>
        {task.description && <p className="text-muted-foreground text-[11px] font-sans">{task.description}</p>}

        {canManage && (
          <div className="pt-2 border-t flex items-center justify-end gap-1">
            {currentStatus === "TODO" && (
              <Button size="sm" variant="outline" disabled={loadingTaskId === task.id} onClick={() => handleStatusChange(task.id, "IN_PROGRESS")} className="h-6 text-[10px]">
                Start Task
              </Button>
            )}
            {currentStatus === "IN_PROGRESS" && (
              <Button size="sm" disabled={loadingTaskId === task.id} onClick={() => handleStatusChange(task.id, "COMPLETED")} className="h-6 text-[10px]">
                Mark Complete
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* TODO Column */}
      <div className="space-y-3">
        <div className="p-3 rounded-lg border bg-muted/40 font-bold text-xs flex items-center justify-between">
          <span>To-Do Tasks</span>
          <Badge variant="secondary" className="text-[10px]">{taskData.todoTasks.length}</Badge>
        </div>
        <div className="space-y-3">
          {taskData.todoTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic p-4 text-center">No pending tasks.</p>
          ) : (
            taskData.todoTasks.map((t) => renderTaskCard(t, "TODO"))
          )}
        </div>
      </div>

      {/* IN_PROGRESS Column */}
      <div className="space-y-3">
        <div className="p-3 rounded-lg border bg-primary/10 border-primary/20 text-primary font-bold text-xs flex items-center justify-between">
          <span>In Progress</span>
          <Badge variant="default" className="text-[10px]">{taskData.inProgressTasks.length}</Badge>
        </div>
        <div className="space-y-3">
          {taskData.inProgressTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic p-4 text-center">No tasks in progress.</p>
          ) : (
            taskData.inProgressTasks.map((t) => renderTaskCard(t, "IN_PROGRESS"))
          )}
        </div>
      </div>

      {/* COMPLETED Column */}
      <div className="space-y-3">
        <div className="p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-bold text-xs flex items-center justify-between">
          <span>Completed</span>
          <Badge variant="outline" className="text-[10px] border-emerald-600">{taskData.completedTasks.length}</Badge>
        </div>
        <div className="space-y-3">
          {taskData.completedTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground italic p-4 text-center">No completed tasks yet.</p>
          ) : (
            taskData.completedTasks.map((t) => renderTaskCard(t, "COMPLETED"))
          )}
        </div>
      </div>
    </div>
  );
}
