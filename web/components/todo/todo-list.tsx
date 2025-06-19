"use client";

import { Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  onToggleComplete: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  error?: boolean;
  search?: string;
}

export function TodoList({
  todos,
  onToggleComplete,
  onDelete,
  loading,
  error,
  search,
}: TodoListProps) {
  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 text-destructive">
        Failed to load tasks. Please try again.
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <h3 className="text-lg font-medium">No tasks found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {search
            ? "Try a different search term"
            : "Add a new task to get started"}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-lg border bg-card">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-start justify-between p-4">
          <div className="flex items-start space-x-4">
            <Button
              variant="outline"
              size="icon"
              className={`mt-0.5 h-6 w-6 shrink-0 rounded-full ${
                todo.completed ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => onToggleComplete(todo.id, todo.completed)}
            >
              {todo.completed && <Check className="h-4 w-4" />}
            </Button>
            <div>
              <p
                className={`font-medium ${
                  todo.completed ? "text-muted-foreground line-through" : ""
                }`}
              >
                {todo.title}
              </p>
              {todo.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {todo.description}
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(todo.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
