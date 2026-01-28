"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTagSchema } from "@cardkeeper/shared-utils";
import { useCreateTag } from "@/hooks/use-tags";
import { ColorPicker } from "@/components/common/color-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";

interface TagCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  name: string;
  color?: string;
};

export function TagCreateDialog({ open, onOpenChange }: TagCreateDialogProps) {
  const createTag = useCreateTag();

  const form = useForm<FormValues>({
    resolver: zodResolver(createTagSchema),
    defaultValues: {
      name: "",
      color: "#8B5CF6",
    },
  });

  async function onSubmit(values: FormValues) {
    await createTag.mutateAsync(values);
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 태그 만들기</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>태그 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="태그 이름을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>색상</FormLabel>
                  <FormControl>
                    <ColorPicker
                      value={field.value || "#8B5CF6"}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createTag.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={createTag.isPending}>
                {createTag.isPending && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                만들기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
