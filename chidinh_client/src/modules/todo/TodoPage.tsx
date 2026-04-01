import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Panel } from "../../shared/ui/Panel";
import { SectionHeading } from "../../shared/ui/SectionHeading";
import { Button } from "../../shared/ui/Button";
import { createTodo, deleteTodo, listTodos, updateTodo } from "./api";

const todoSchema = z.object({
  title: z.string().trim().min(1, "Tên công việc không được để trống").max(200, "Tên công việc quá dài"),
});

type TodoFormValues = z.infer<typeof todoSchema>;

export function TodoPage() {
  const queryClient = useQueryClient();
  const todosQuery = useQuery({
    queryKey: ["todos"],
    queryFn: listTodos,
  });

  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: "",
    },
  });

  const items = todosQuery.data?.items ?? [];
  const metrics = useMemo(() => {
    const total = items.length;
    const completed = items.filter((item) => item.completed).length;

    return {
      total,
      completed,
      open: total - completed,
    };
  }, [items]);

  const createMutation = useMutation({
    mutationFn: (newTitle: string) => createTodo(newTitle),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      form.reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTodo(id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  const handleCreate = async ({ title }: TodoFormValues) => {
    try {
      await createMutation.mutateAsync(title);
    } catch {
      // Error is rendered from mutation state.
    }
  };

  return (
    <section className="space-y-8 pb-32">
      <SectionHeading
        eyebrow="Ứng Dụng"
        title="Quản Trị Tác Vụ"
        description="Các tác vụ cần thực thi trong không gian làm việc số."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <Panel className="bg-primary border-4 text-center py-6">
          <p className="font-bold text-sm uppercase tracking-widest text-[#5a5a5a] bg-card border-2 border-border px-3 py-1 inline-block mb-3">Công Việc</p>
          <p className="text-4xl font-head text-primary-foreground">{metrics.total} <span className="text-lg">TỔNG KHỐI LƯỢNG</span></p>
        </Panel>
        <Panel className="bg-[#fffdfa] border-4 text-center py-6">
          <p className="font-bold text-sm uppercase tracking-widest text-[#000] border-2 border-border border-dashed px-3 py-1 inline-block mb-3">Đang Mở</p>
          <p className="text-4xl font-head text-[#ff6b6b]">{metrics.open} <span className="text-lg text-border">CHƯA XONG</span></p>
        </Panel>
        <Panel className="bg-[#3a3a3a] border-4 text-center py-6">
          <p className="font-bold text-sm uppercase tracking-widest text-card bg-[#5a5a5a] border-2 border-[#1c1c1c] px-3 py-1 inline-block mb-3">Đã Tắt</p>
          <p className="text-4xl font-head text-primary">{metrics.completed} <span className="text-lg text-primary-hover">HOÀN TẤT</span></p>
        </Panel>
      </div>

      <div className="border-4 border-border bg-card p-6 shadow-md mt-8">
        <div className="mb-4">
          <p className="font-head text-2xl uppercase">Tạo Tác Vụ Mới</p>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
            Ghi nhận tiến trình công việc cần thực thi
          </p>
        </div>

        <form
          className="flex flex-col gap-4 md:flex-row md:items-start"
          onSubmit={form.handleSubmit(handleCreate)}
        >
          <div className="flex-1">
            <input 
              id="todo-title" 
              className="w-full text-lg p-4 font-bold placeholder:font-normal placeholder:opacity-50" 
              placeholder="Hôm nay bạn cần làm gì?" 
              {...form.register("title")} 
            />
            {form.formState.errors.title ? (
              <p className="mt-2 text-sm font-bold text-destructive uppercase bg-destructive/10 inline-block px-2">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <Button
            type="submit"
            className="w-full text-lg py-4 md:w-auto px-8 whitespace-nowrap"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "ĐANG THÊM..." : "THÊM CÔNG VIỆC"}
          </Button>
        </form>
      </div>

      <div className="mt-8 space-y-4">
        {todosQuery.isLoading ? (
          <Panel className="border-4 bg-[#e0e0e0] flex justify-center py-8">
            <p className="font-head text-2xl animate-pulse">ĐANG TẢI DỮ LIỆU...</p>
          </Panel>
        ) : null}

        {todosQuery.isError ? (
          <Panel className="border-4 bg-destructive text-destructive-foreground flex justify-center py-8">
            <p className="font-head text-2xl">KHÔNG THỂ TẢI DANH SÁCH</p>
          </Panel>
        ) : null}

        {!todosQuery.isLoading && !todosQuery.isError && items.length === 0 ? (
          <Panel className="border-4 bg-[#f4e4d6] border-[#dcc5b6] shadow-none flex flex-col items-center py-12">
            <p className="text-3xl font-head text-border uppercase">Chưa có tác vụ nào</p>
            <p className="mt-2 font-medium text-[#5a5a5a] uppercase tracking-widest">
              Không gian bộ nhớ hiện đang trống
            </p>
          </Panel>
        ) : null}

        {items.length > 0 ? items.map((todo) => (
          <div 
            className={`flex items-center justify-between gap-4 p-4 border-l-8 border-t-2 border-b-2 border-r-2 shadow-sm transition-all hover:-translate-y-1 ${todo.completed ? 'bg-[#f5f5f5] text-[#a0a0a0] border-border' : 'bg-card border-border hover:border-primary'}`} 
            key={todo.id}
          >
            <label className="flex items-center gap-4 cursor-pointer flex-1 cursor-pointer">
              <input
                className="h-6 w-6 border-4 cursor-pointer accent-primary"
                type="checkbox"
                checked={todo.completed}
                onChange={(event) =>
                  updateMutation.mutate({
                    id: todo.id,
                    completed: event.target.checked,
                  })
                }
              />
              <span className={`text-lg font-medium transition-all ${todo.completed ? 'line-through decoration-4 opacity-70' : ''}`}>{todo.title}</span>
            </label>

            <Button
              variant={todo.completed ? "ghost" : "secondary"}
              className="px-4 py-2 font-head text-xs shadow-none border hover:shadow-none hover:bg-destructive hover:text-white"
              type="button"
              onClick={() => deleteMutation.mutate(todo.id)}
            >
              [X]
            </Button>
          </div>
        )) : null}
      </div>
    </section>
  );
}
