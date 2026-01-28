"use client";

import { useRouter } from "next/navigation";
import {
  Star,
  Phone,
  Mail,
  Pencil,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleFavorite } from "@/hooks/use-cards";
import { useUiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";
import type { CardSummary, ContactDetail } from "@cardkeeper/shared-types";

interface CardListViewProps {
  cards: CardSummary[];
}

const MAX_VISIBLE_TAGS = 3;

function getInitials(name: string): string {
  return name.charAt(0).toUpperCase();
}

function getPrimaryContact(
  contacts: ContactDetail[],
  type: "PHONE" | "MOBILE" | "EMAIL",
): ContactDetail | undefined {
  return (
    contacts.find(
      (c) => (c.type === type || c.type === "MOBILE") && c.isPrimary,
    ) ||
    contacts.find(
      (c) => c.type === type || (type === "PHONE" && c.type === "MOBILE"),
    )
  );
}

function CardListRow({ card }: { card: CardSummary }) {
  const router = useRouter();
  const toggleFavorite = useToggleFavorite();
  const { isSelectionMode, selectedCardIds, toggleCardSelection } =
    useUiStore();

  const isSelected = selectedCardIds.includes(card.id);
  const visibleTags = card.tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTags = card.tags.length - MAX_VISIBLE_TAGS;
  const primaryPhone = getPrimaryContact(card.contactDetails, "PHONE");
  const primaryEmail = getPrimaryContact(card.contactDetails, "EMAIL");

  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-sm",
        isSelected && "ring-2 ring-primary-500",
      )}
    >
      {/* Checkbox */}
      {isSelectionMode && (
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => toggleCardSelection(card.id)}
        />
      )}

      {/* Avatar */}
      <button
        className="flex shrink-0 cursor-pointer items-center"
        onClick={() => router.push(`/cards/${card.id}`)}
      >
        {card.thumbnailUrl ? (
          <img
            src={card.thumbnailUrl}
            alt={card.name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
            {getInitials(card.name)}
          </div>
        )}
      </button>

      {/* Name / Company / JobTitle */}
      <button
        className="min-w-0 flex-1 cursor-pointer text-left"
        onClick={() => router.push(`/cards/${card.id}`)}
      >
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">
            {card.name}
          </span>
          {card.jobTitle && (
            <span className="hidden truncate text-xs text-gray-400 sm:inline">
              {card.jobTitle}
            </span>
          )}
        </div>
        {card.company && (
          <p className="truncate text-xs text-gray-500">{card.company}</p>
        )}
      </button>

      {/* Tags */}
      <div className="hidden items-center gap-1 md:flex">
        {visibleTags.map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="text-xs"
            style={
              tag.color
                ? { backgroundColor: `${tag.color}20`, color: tag.color }
                : undefined
            }
          >
            {tag.name}
          </Badge>
        ))}
        {remainingTags > 0 && (
          <Badge variant="outline" className="text-xs">
            +{remainingTags}
          </Badge>
        )}
      </div>

      {/* Favorite */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() =>
          toggleFavorite.mutate({
            id: card.id,
            isFavorite: !card.isFavorite,
          })
        }
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

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {primaryPhone && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
              >
                <a href={`tel:${primaryPhone.value}`}>
                  <Phone className="h-3.5 w-3.5" />
                  <span className="sr-only">전화</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>전화</TooltipContent>
          </Tooltip>
        )}
        {primaryEmail && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                asChild
              >
                <a href={`mailto:${primaryEmail.value}`}>
                  <Mail className="h-3.5 w-3.5" />
                  <span className="sr-only">이메일</span>
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>이메일</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Overflow menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">더보기</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/cards/${card.id}/edit`)}>
            <Pencil className="mr-2 h-4 w-4" />
            수정
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => {
              // Deletion is handled via the detail page or selection bar
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function CardListView({ cards }: CardListViewProps) {
  return (
    <div className="flex flex-col gap-2">
      {cards.map((card) => (
        <CardListRow key={card.id} card={card} />
      ))}
    </div>
  );
}
