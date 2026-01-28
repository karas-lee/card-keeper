"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateTagSchema } from "@cardkeeper/shared-utils";
import { useUpdateTag, type Tag } from "@/hooks/use-tags";
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

interface TagEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag: Tag | null;
}

type FormValues = {
  name?: string;
  color?: string;
};

export function TagEditDialog({ open, onOpenChange, tag }: TagEditDialogProps) {
  const updateTag = useUpdateTag();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateTagSchema),
    defaultValues: {
      name: tag?.name || "",
      color: tag?.color || "#8B5CF6",
    },
  });

  // Reset form when tag changes
  useEffect(() => {
    if (tag) {
      form.reset({
        name: tag.name,
        color: tag.color,
      });
    }
  }, [tag, form]);

  async function onSubmit(values: FormValues) {
    if (!tag) return;
    await updateTag.mutateAsync({
      id: tag.id,
      ...values,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>태그 수정</DialogTitle>
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
                disabled={updateTag.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={updateTag.isPending}>
                {updateTag.isPending && (
                  <LoadingSpinner size="sm" className="mr-2" />
                )}
                저장
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
