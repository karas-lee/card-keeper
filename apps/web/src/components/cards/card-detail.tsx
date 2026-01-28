"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Star,
  Pencil,
  Trash2,
  Building2,
  Briefcase,
  MapPin,
  Globe,
  StickyNote,
  FolderOpen,
  X,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmationDialog } from "@/components/common/confirmation-dialog";
import { CardQuickActions } from "./card-quick-actions";
import {
  useDeleteCard,
  useToggleFavorite,
  useRemoveTag,
} from "@/hooks/use-cards";
import { formatDate, formatRelativeTime } from "@cardkeeper/shared-utils";
import { cn } from "@/lib/utils";
import type { CardDetail as CardDetailType } from "@cardkeeper/shared-types";

interface CardDetailProps {
  card: CardDetailType;
}

const contactTypeLabels: Record<string, string> = {
  PHONE: "전화",
  EMAIL: "이메일",
  FAX: "팩스",
  MOBILE: "휴대폰",
  OTHER: "기타",
};

export function CardDetail({ card }: CardDetailProps) {
  const router = useRouter();
  const deleteCard = useDeleteCard();
  const toggleFavorite = useToggleFavorite();
  const removeTag = useRemoveTag();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    deleteCard.mutate(card.id, {
      onSuccess: () => {
        router.push("/cards");
      },
    });
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            {/* Avatar + Name */}
            <div className="flex items-center gap-4">
              {card.thumbnailUrl ? (
                <img
                  src={card.thumbnailUrl}
                  alt={card.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
                  {card.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {card.name}
                </h2>
                {card.jobTitle && (
                  <p className="text-sm text-gray-500">{card.jobTitle}</p>
                )}
                {card.company && (
                  <p className="text-sm text-gray-500">{card.company}</p>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  toggleFavorite.mutate({
                    id: card.id,
                    isFavorite: !card.isFavorite,
                  })
                }
              >
                <Star
                  className={cn(
                    "h-5 w-5",
                    card.isFavorite
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300",
                  )}
                />
                <span className="sr-only">즐겨찾기</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/cards/${card.id}/edit`)}
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">수정</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
                <span className="sr-only">삭제</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick actions */}
          <CardQuickActions
            contactDetails={card.contactDetails}
            address={card.address}
            website={card.website}
          />

          <Separator />

          {/* Contact details */}
          {card.contactDetails.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">연락처</h3>
              <div className="space-y-2">
                {card.contactDetails.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {contactTypeLabels[contact.type] || contact.type}
                      </Badge>
                      {contact.label && (
                        <span className="text-xs text-gray-400">
                          {contact.label}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {contact.type === "EMAIL" ? (
                        <a
                          href={`mailto:${contact.value}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {contact.value}
                        </a>
                      ) : contact.type === "PHONE" ||
                        contact.type === "MOBILE" ? (
                        <a
                          href={`tel:${contact.value}`}
                          className="text-sm text-primary-600 hover:underline"
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-900">
                          {contact.value}
                        </span>
                      )}
                      {contact.isPrimary && (
                        <Badge variant="secondary" className="text-[10px]">
                          대표
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company info */}
          {card.company && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{card.company}</span>
            </div>
          )}

          {/* Job title */}
          {card.jobTitle && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{card.jobTitle}</span>
            </div>
          )}

          {/* Address */}
          {card.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(card.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {card.address}
              </a>
            </div>
          )}

          {/* Website */}
          {card.website && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-gray-400" />
              <a
                href={
                  card.website.startsWith("http")
                    ? card.website
                    : `https://${card.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:underline"
              >
                {card.website}
              </a>
            </div>
          )}

          {/* Memo */}
          {card.memo && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">메모</h3>
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-600">
                  {card.memo}
                </p>
              </div>
            </>
          )}

          {/* Folder */}
          {card.folder && (
            <>
              <Separator />
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {card.folder.name}
                </span>
                {card.folder.color && (
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: card.folder.color }}
                  />
                )}
              </div>
            </>
          )}

          {/* Tags */}
          {card.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">태그</h3>
                <div className="flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="gap-1 pr-1"
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
                      <button
                        className="ml-1 rounded-full p-0.5 hover:bg-gray-200"
                        onClick={() =>
                          removeTag.mutate({ id: card.id, tagId: tag.id })
                        }
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">태그 제거</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>
                등록: {formatDate(card.createdAt)} (
                {formatRelativeTime(card.createdAt)})
              </span>
            </div>
            <span>
              수정: {formatDate(card.updatedAt)} (
              {formatRelativeTime(card.updatedAt)})
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="명함 삭제"
        description={`"${card.name}" 명함을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmLabel="삭제"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteCard.isPending}
      />
    </>
  );
}
