"use client";

import { Phone, Mail, Globe, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ContactDetail } from "@cardkeeper/shared-types";

interface CardQuickActionsProps {
  contactDetails: ContactDetail[];
  address?: string | null;
  website?: string | null;
}

function getFirstContactOfType(
  contacts: ContactDetail[],
  types: string[],
): ContactDetail | undefined {
  return (
    contacts.find((c) => types.includes(c.type) && c.isPrimary) ||
    contacts.find((c) => types.includes(c.type))
  );
}

export function CardQuickActions({
  contactDetails,
  address,
  website,
}: CardQuickActionsProps) {
  const phone = getFirstContactOfType(contactDetails, ["PHONE", "MOBILE"]);
  const email = getFirstContactOfType(contactDetails, ["EMAIL"]);

  const actions = [
    {
      label: "전화",
      icon: Phone,
      href: phone ? `tel:${phone.value}` : undefined,
      show: !!phone,
    },
    {
      label: "이메일",
      icon: Mail,
      href: email ? `mailto:${email.value}` : undefined,
      show: !!email,
    },
    {
      label: "웹사이트",
      icon: Globe,
      href: website
        ? website.startsWith("http")
          ? website
          : `https://${website}`
        : undefined,
      show: !!website,
      external: true,
    },
    {
      label: "지도",
      icon: MapPin,
      href: address
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
        : undefined,
      show: !!address,
      external: true,
    },
  ].filter((action) => action.show);

  if (actions.length === 0) return null;

  return (
    <div className="flex gap-2">
      {actions.map((action) => (
        <Tooltip key={action.label}>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10"
              onClick={() => {
                if (action.external && action.href) {
                  window.open(action.href, "_blank", "noopener,noreferrer");
                } else if (action.href) {
                  window.location.href = action.href;
                }
              }}
            >
              <action.icon className="h-4 w-4" />
              <span className="sr-only">{action.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{action.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
