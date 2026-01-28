"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createCardSchema,
  updateCardSchema,
  type CreateCardInput,
  type UpdateCardInput,
} from "@cardkeeper/shared-utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ContactDetailFields } from "./contact-detail-fields";
import { useDraftStore } from "@/stores/draft.store";

interface CardFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<CreateCardInput>;
  onSubmit: (data: CreateCardInput | UpdateCardInput) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  folders?: Array<{ id: string; name: string }>;
  tags?: Array<{ id: string; name: string; color: string | null }>;
}

export function CardForm({
  mode,
  defaultValues,
  onSubmit,
  isLoading = false,
  onCancel,
  folders = [],
  tags = [],
}: CardFormProps) {
  const { draft, setDraft, clearDraft } = useDraftStore();

  const schema = mode === "create" ? createCardSchema : updateCardSchema;

  const initialValues: Partial<CreateCardInput> =
    mode === "create" && draft
      ? { ...draft, ...defaultValues }
      : defaultValues ?? {};

  const form = useForm<CreateCardInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      company: "",
      jobTitle: "",
      address: "",
      website: "",
      memo: "",
      folderId: null,
      tagIds: [],
      contactDetails: [],
      ...initialValues,
    },
  });

  // Save draft on form change (create mode only)
  useEffect(() => {
    if (mode !== "create") return;

    const subscription = form.watch((values) => {
      setDraft(values as Partial<CreateCardInput>);
    });

    return () => subscription.unsubscribe();
  }, [form, mode, setDraft]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    if (mode === "create") {
      clearDraft();
    }
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                이름 <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="이름을 입력하세요" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Company */}
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>회사</FormLabel>
              <FormControl>
                <Input
                  placeholder="회사명을 입력하세요"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Job Title */}
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>직함</FormLabel>
              <FormControl>
                <Input
                  placeholder="직함을 입력하세요"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>주소</FormLabel>
              <FormControl>
                <Input
                  placeholder="주소를 입력하세요"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Website */}
        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>웹사이트</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com"
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Contact details */}
        <ContactDetailFields />

        <Separator />

        {/* Folder */}
        <FormField
          control={form.control}
          name="folderId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>폴더</FormLabel>
              <Select
                value={field.value ?? "none"}
                onValueChange={(val: string) =>
                  field.onChange(val === "none" ? null : val)
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="폴더를 선택하세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">폴더 없음</SelectItem>
                  {(folders ?? []).map((folder) => (
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

        {/* Tags */}
        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>태그</FormLabel>
              <div className="flex flex-wrap gap-2">
                {(tags ?? []).map((tag) => {
                  const isSelected = (field.value ?? []).includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        isSelected
                          ? "border-primary-500 bg-primary-50 text-primary-700"
                          : "border-gray-300 text-gray-600 hover:border-gray-400"
                      }`}
                      onClick={() => {
                        const current = field.value ?? [];
                        field.onChange(
                          isSelected
                            ? current.filter((id: string) => id !== tag.id)
                            : [...current, tag.id],
                        );
                      }}
                    >
                      {tag.color && (
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      {tag.name}
                    </button>
                  );
                })}
                {(tags ?? []).length === 0 && (
                  <p className="text-sm text-gray-400">
                    사용 가능한 태그가 없습니다.
                  </p>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Memo */}
        <FormField
          control={form.control}
          name="memo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>메모</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="메모를 입력하세요"
                  rows={4}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              취소
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
            {mode === "create" ? "추가" : "저장"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
