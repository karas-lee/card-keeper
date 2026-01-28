"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToggleFavorite, useDeleteCard } from "@/hooks/use-cards";
import { useUiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";
import type { CardSummary, ContactDetail } from "@cardkeeper/shared-types";

interface CardTableViewProps {
  cards: CardSummary[];
  onSort?: (field: string) => void;
  sortField?: string;
  sortOrder?: "asc" | "desc";
}

function getPrimaryValue(
  contacts: ContactDetail[],
  type: "PHONE" | "MOBILE" | "EMAIL",
): string {
  const primary =
    contacts.find((c) => (c.type === type || c.type === "MOBILE") && c.isPrimary) ||
    contacts.find((c) => c.type === type || (type === "PHONE" && c.type === "MOBILE"));
  return primary?.value || "";
}

export function CardTableView({
  cards,
  onSort,
  sortField,
  sortOrder,
}: CardTableViewProps) {
  const router = useRouter();
  const toggleFavorite = useToggleFavorite();
  const deleteCard = useDeleteCard();
  const { isSelectionMode, selectedCardIds, toggleCardSelection, toggleAllCards } =
    useUiStore();

  const allSelected =
    cards.length > 0 && cards.every((c) => selectedCardIds.includes(c.id));

  const handleHeaderCheckbox = () => {
    toggleAllCards(cards.map((c) => c.id));
  };

  const handleRowClick = (cardId: string) => {
    if (isSelectionMode) {
      toggleCardSelection(cardId);
      return;
    }
    router.push(`/cards/${cardId}`);
  };

  const SortableHeader = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
      <button
        type="button"
        className="inline-flex items-center gap-1 hover:text-gray-700"
        onClick={() => onSort?.(field)}
      >
        {children}
        <ArrowUpDown
          className={cn(
            "h-3 w-3",
            sortField === field ? "text-primary-500" : "text-gray-400",
          )}
        />
      </button>
    </th>
  );

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {isSelectionMode && (
              <th className="w-10 px-4 py-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleHeaderCheckbox}
                />
              </th>
            )}
            <SortableHeader field="name">이름</SortableHeader>
            <SortableHeader field="company">회사</SortableHeader>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              직함
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              전화번호
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              이메일
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              태그
            </th>
            <th className="w-10 px-4 py-3" />
            <th className="w-10 px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {cards.map((card) => {
            const isSelected = selectedCardIds.includes(card.id);
            const phone = getPrimaryValue(card.contactDetails, "PHONE");
            const email = getPrimaryValue(card.contactDetails, "EMAIL");

            return (
              <tr
                key={card.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-gray-50",
                  isSelected && "bg-primary-50",
                )}
                onClick={() => handleRowClick(card.id)}
              >
                {isSelectionMode && (
                  <td className="px-4 py-3">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleCardSelection(card.id)}
                      />
                    </div>
                  </td>
                )}
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-2">
                    {card.thumbnailUrl ? (
                      <img
                        src={card.thumbnailUrl}
                        alt={card.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
                        {card.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-900">
                      {card.name}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {card.company || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {card.jobTitle || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {phone ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `tel:${phone}`;
                      }}
                    >
                      <Phone className="h-3 w-3" />
                      {phone}
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {email ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-primary-600 hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${email}`;
                      }}
                    >
                      <Mail className="h-3 w-3" />
                      {email}
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {card.tags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="secondary"
                        className="text-xs"
                        style={
                          tag.color
                            ? {
                                backgroundColor: `${tag.color}20`,
                                color: tag.color,
                              }
                            : undefined
                        }
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {card.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{card.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite.mutate({
                        id: card.id,
                        isFavorite: !card.isFavorite,
                      });
                    }}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        card.isFavorite
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300",
                      )}
                    />
                    <span className="sr-only">즐겨찾기</span>
                  </Button>
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">더보기</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          router.push(`/cards/${card.id}/edit`);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        수정
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          deleteCard.mutate(card.id);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
          {cards.length === 0 && (
            <tr>
              <td
                colSpan={isSelectionMode ? 9 : 8}
                className="px-4 py-12 text-center text-sm text-gray-500"
              >
                명함이 없습니다
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
