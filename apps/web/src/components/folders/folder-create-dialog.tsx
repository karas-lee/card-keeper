"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFolderSchema } from "@cardkeeper/shared-utils";
import { useCreateFolder, useFolders } from "@/hooks/use-folders";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/common/loading-spinner";

interface FolderCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultParentId?: string | null;
}

type FormValues = {
  name: string;
  color?: string;
  parentId?: string | null;
};

export function FolderCreateDialog({
  open,
  onOpenChange,
  defaultParentId,
}: FolderCreateDialogProps) {
  const createFolder = useCreateFolder();
  const { data: folders } = useFolders();

  const form = useForm<FormValues>({
    resolver: zodResolver(createFolderSchema),
    defaultValues: {
      name: "",
      color: "#6366F1",
      parentId: defaultParentId || null,
    },
  });

  // Flatten root folders for parent selection (no nesting deeper than 1 level)
  const rootFolders = (folders || []).filter((f) => !f.parentId);

  async function onSubmit(values: FormValues) {
    await createFolder.mutateAsync({
      name: values.name,
      color: values.color,
      parentId: values.parentId || null,
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>새 폴더 만들기</DialogTitle>
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

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상위 폴더 (선택)</FormLabel>
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val: string) =>
                      field.onChange(val === "none" ? null : val)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="상위 폴더 없음" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">상위 폴더 없음</SelectItem>
                      {rootFolders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createFolder.isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={createFolder.isPending}>
                {createFolder.isPending && (
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
