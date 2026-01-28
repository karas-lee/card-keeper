"use client";

import { useRouter } from "next/navigation";
import {
  Star,
  Phone,
  Mail,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToggleFavorite } from "@/hooks/use-cards";
import { useUiStore } from "@/stores/ui.store";
import { cn } from "@/lib/utils";
import type { CardSummary, ContactDetail } from "@cardkeeper/shared-types";

interface CardItemProps {
  card: CardSummary;
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
    contacts.find((c) => (c.type === type || c.type === "MOBILE") && c.isPrimary) ||
    contacts.find((c) => c.type === type || (type === "PHONE" && c.type === "MOBILE"))
  );
}

export function CardItem({ card }: CardItemProps) {
  const router = useRouter();
  const toggleFavorite = useToggleFavorite();
  const { isSelectionMode, selectedCardIds, toggleCardSelection } =
    useUiStore();

  const isSelected = selectedCardIds.includes(card.id);
  const visibleTags = card.tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTags = card.tags.length - MAX_VISIBLE_TAGS;

  const primaryPhone = getPrimaryContact(card.contactDetails, "PHONE");
  const primaryEmail = getPrimaryContact(card.contactDetails, "EMAIL");

  const handleClick = () => {
    if (isSelectionMode) {
      toggleCardSelection(card.id);
      return;
    }
    router.push(`/cards/${card.id}`);
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate({ id: card.id, isFavorite: !card.isFavorite });
  };

  const handleCheckboxChange = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCardSelection(card.id);
  };

  return (
    <Card
      className={cn(
        "group relative cursor-pointer transition-shadow hover:shadow-md",
        isSelected && "ring-2 ring-primary-500",
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        {/* Selection checkbox */}
        {isSelectionMode && (
          <div
            className="absolute left-3 top-3 z-10"
            onClick={handleCheckboxChange}
          >
            <Checkbox checked={isSelected} />
          </div>
        )}

        {/* Favorite star */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8"
          onClick={handleFavoriteToggle}
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

        {/* Avatar / Thumbnail */}
        <div className="mb-3 flex items-center gap-3">
          {card.thumbnailUrl ? (
            <img
              src={card.thumbnailUrl}
              alt={card.name}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-semibold text-primary-700">
              {getInitials(card.name)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-gray-900">
              {card.name}
            </h3>
            {card.company && (
              <p className="truncate text-xs text-gray-500">{card.company}</p>
            )}
            {card.jobTitle && (
              <p className="truncate text-xs text-gray-400">{card.jobTitle}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        {card.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
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
        )}

        {/* Quick actions on hover */}
        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {primaryPhone && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `tel:${primaryPhone.value}`;
                  }}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span className="sr-only">전화</span>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `mailto:${primaryEmail.value}`;
                  }}
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span className="sr-only">이메일</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>이메일</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/cards/${card.id}/edit`);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                <span className="sr-only">수정</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>수정</TooltipContent>
          </Tooltip>
        </div>
      </CardContent>
    </Card>
  );
}
