"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "명함을 어떻게 추가하나요?",
    answer:
      "명함을 추가하는 방법은 두 가지가 있습니다. 첫째, 명함 목록 화면에서 '추가' 버튼을 클릭하여 직접 정보를 입력할 수 있습니다. 둘째, 'OCR 스캔' 기능을 사용하면 명함 사진을 촬영하거나 업로드하여 자동으로 정보를 추출할 수 있습니다.",
  },
  {
    question: "OCR 스캔은 어떻게 사용하나요?",
    answer:
      "메뉴에서 '스캔'을 선택한 후, 명함 사진을 촬영하거나 갤러리에서 이미지를 선택하세요. AI가 자동으로 이름, 회사, 전화번호, 이메일 등의 정보를 인식합니다. 인식된 정보를 확인하고 필요한 경우 수정한 후 저장하면 됩니다.",
  },
  {
    question: "데이터를 내보낼 수 있나요?",
    answer:
      "네, 설정 메뉴의 '데이터 내보내기'에서 명함 데이터를 vCard(.vcf) 또는 CSV 형식으로 내보낼 수 있습니다. 전체 명함을 내보내거나, 특정 폴더나 태그를 기준으로 선택적으로 내보낼 수 있습니다. vCard 파일은 대부분의 연락처 앱에서 가져올 수 있으며, CSV 파일은 엑셀이나 구글 시트에서 열 수 있습니다.",
  },
  {
    question: "폴더와 태그는 어떻게 다른가요?",
    answer:
      "폴더는 명함을 분류하는 계층 구조입니다. 하나의 명함은 하나의 폴더에만 속할 수 있습니다. 반면 태그는 명함에 여러 개의 라벨을 붙이는 방식입니다. 하나의 명함에 여러 태그를 추가할 수 있어 더 유연한 분류가 가능합니다.",
  },
  {
    question: "즐겨찾기는 어떻게 사용하나요?",
    answer:
      "명함 카드의 별표 아이콘을 클릭하면 즐겨찾기에 추가됩니다. 즐겨찾기한 명함은 필터를 통해 빠르게 찾을 수 있습니다. 자주 연락하는 사람의 명함을 즐겨찾기에 추가해 보세요.",
  },
  {
    question: "명함을 일괄 관리할 수 있나요?",
    answer:
      "명함 목록에서 선택 모드를 활성화하면 여러 명함을 한 번에 선택할 수 있습니다. 선택한 명함을 일괄 삭제하거나, 폴더 이동, 태그 추가/제거를 할 수 있습니다.",
  },
];

function AccordionItem({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="pr-4 font-medium text-gray-900">
          {item.question}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-gray-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all",
          isOpen ? "mb-4 max-h-96" : "max-h-0",
        )}
      >
        <p className="pb-2 text-sm leading-relaxed text-gray-600">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <HelpCircle className="h-6 w-6 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">도움말</h1>
      </div>

      <p className="text-gray-600">
        자주 묻는 질문을 확인하세요. 추가 문의사항이 있으시면 언제든
        연락해주세요.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white px-4">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={index} item={item} />
        ))}
      </div>
    </div>
  );
}
