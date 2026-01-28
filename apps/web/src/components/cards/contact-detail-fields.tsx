"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { CreateCardInput } from "@cardkeeper/shared-utils";

const contactTypeOptions = [
  { value: "PHONE", label: "전화" },
  { value: "EMAIL", label: "이메일" },
  { value: "FAX", label: "팩스" },
  { value: "MOBILE", label: "휴대폰" },
  { value: "OTHER", label: "기타" },
] as const;

export function ContactDetailFields() {
  const { control } = useFormContext<CreateCardInput>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contactDetails",
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel className="text-sm font-medium">연락처</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              type: "PHONE",
              label: "",
              value: "",
              isPrimary: fields.length === 0,
            })
          }
        >
          <Plus className="mr-1 h-3.5 w-3.5" />
          추가
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-400">
          연락처 정보가 없습니다. 추가 버튼을 눌러주세요.
        </p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-wrap items-start gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
          >
            {/* Contact type */}
            <FormField
              control={control}
              name={`contactDetails.${index}.type`}
              render={({ field: typeField }) => (
                <FormItem className="w-[120px]">
                  <Select
                    value={typeField.value}
                    onValueChange={typeField.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contactTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Label */}
            <FormField
              control={control}
              name={`contactDetails.${index}.label`}
              render={({ field: labelField }) => (
                <FormItem className="w-[100px]">
                  <FormControl>
                    <Input
                      placeholder="라벨"
                      {...labelField}
                      value={labelField.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Value */}
            <FormField
              control={control}
              name={`contactDetails.${index}.value`}
              render={({ field: valueField }) => (
                <FormItem className="min-w-[180px] flex-1">
                  <FormControl>
                    <Input placeholder="값을 입력하세요" {...valueField} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* isPrimary */}
            <FormField
              control={control}
              name={`contactDetails.${index}.isPrimary`}
              render={({ field: primaryField }) => (
                <FormItem className="flex items-center gap-1.5 pt-2">
                  <FormControl>
                    <Checkbox
                      checked={primaryField.value}
                      onCheckedChange={primaryField.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0 text-xs text-gray-500">
                    대표
                  </FormLabel>
                </FormItem>
              )}
            />

            {/* Remove button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mt-0.5 h-8 w-8 shrink-0 text-red-500 hover:text-red-700"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">삭제</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
