"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateFolderSchema } from "@cardkeeper/shared-utils";
import { useUpdateFolder, type Folder } from "@/hooks/use-folders";
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

interface FolderEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folder: Folder | null;
}

type FormValues = {
  name?: string;
  color?: string;
};

export function FolderEditDialog({
  open,
  onOpenChange,
  folder,
}: FolderEditDialogProps) {
  const updateFolder = useUpdateFolder();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateFolderSchema),
    defaultValues: {
      name: folder?.name || "",
      color: folder?.color || "#6366F1",
    },
  });

  // Reset form when folder changes
  useEffect(() => {
    if (folder) {
      form.reset({
        name: folder.name,
        color: folder.color,
      });
    }
  }, [folder, form]);

  async function onSubmit(values: FormValues) {
    if (!folder) return;
    await updateFolder.mutateAsync({
      id: folder.id,
      ...values,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>폴더 수정</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>폴더 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="폴더 이름을 입력하세요" {...field} />
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
                      value={field.value || "#6366F1"}
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
                disabled={updateFolder.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={updateFolder.isPending}>
                {updateFolder.isPending && (
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
