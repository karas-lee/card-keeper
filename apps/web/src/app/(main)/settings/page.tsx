import Link from "next/link";
import {
  Settings,
  User,
  FileDown,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SETTINGS_LINKS = [
  {
    href: "/settings/profile",
    label: "프로필 설정",
    description: "이름, 비밀번호 등 계정 정보를 관리합니다",
    icon: User,
  },
  {
    href: "/settings/export",
    label: "데이터 내보내기",
    description: "명함 데이터를 vCard, CSV로 내보냅니다",
    icon: FileDown,
  },
  {
    href: "/settings/help",
    label: "도움말",
    description: "자주 묻는 질문과 사용 가이드",
    icon: HelpCircle,
  },
];

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
      </div>

      <div className="grid gap-3">
        {SETTINGS_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <link.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900">
                    {link.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {link.description}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
