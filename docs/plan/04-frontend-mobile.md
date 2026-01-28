# 04. 모바일 프론트엔드 (React Native Expo)

---

## 1. Expo Router 전체 라우트 트리

```
apps/mobile/app/
├── _layout.tsx                    # Root Layout (providers, fonts, splash)
├── index.tsx                      # 앱 진입점 → 인증 상태에 따라 리디렉트
│
├── (auth)/                        # 인증 그룹
│   ├── _layout.tsx                # Auth Stack Layout
│   ├── login.tsx                  # 로그인
│   ├── register.tsx               # 회원가입
│   ├── forgot-password.tsx        # 비밀번호 재설정 요청
│   └── onboarding.tsx             # 온보딩 슬라이드
│
├── (tabs)/                        # 메인 탭 그룹
│   ├── _layout.tsx                # Tab Navigator Layout
│   ├── index.tsx                  # [홈] 명함 리스트
│   ├── scan.tsx                   # [스캔] 카메라 뷰파인더
│   ├── folders.tsx                # [폴더] 폴더 목록
│   └── settings.tsx               # [설정] 설정 메인
│
├── card/
│   ├── [id].tsx                   # 명함 상세 (Push)
│   ├── edit/[id].tsx              # 명함 편집 (Push)
│   └── new.tsx                    # 수동 명함 입력 (Push)
│
├── scan/
│   └── confirm.tsx                # OCR 결과 확인/편집 (Push)
│
├── folder/
│   └── [id].tsx                   # 폴더별 명함 목록 (Push)
│
├── tags/
│   └── manage.tsx                 # 태그 관리 (Push)
│
├── settings/
│   ├── profile.tsx                # 프로필 편집
│   ├── export.tsx                 # 내보내기
│   └── help.tsx                   # 도움말
│
└── +not-found.tsx                 # 404
```

---

## 2. 탭 네비게이터 구성

### 2.1 `(tabs)/_layout.tsx`

```typescript
import { Tabs } from "expo-router";
import { Home, Scan, FolderOpen, Settings } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          borderTopColor: "#E5E7EB",
          height: 80,
          paddingBottom: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "홈", tabBarIcon: ({ color }) => <Home color={color} /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{ title: "스캔", tabBarIcon: ({ color }) => <Scan color={color} /> }}
      />
      <Tabs.Screen
        name="folders"
        options={{ title: "폴더", tabBarIcon: ({ color }) => <FolderOpen color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "설정", tabBarIcon: ({ color }) => <Settings color={color} /> }}
      />
    </Tabs>
  );
}
```

### 2.2 탭 아이콘 & 인디케이터

| 탭 | 아이콘 | 비활성 | 활성 |
|----|--------|--------|------|
| 홈 | Home (lucide) | #9CA3AF | #6366F1 |
| 스캔 | Scan (lucide) | #9CA3AF | #6366F1 |
| 폴더 | FolderOpen (lucide) | #9CA3AF | #6366F1 |
| 설정 | Settings (lucide) | #9CA3AF | #6366F1 |

---

## 3. 네비게이션 패턴

### 3.1 Stack Navigation

| 화면 | Stack Push 대상 | 비고 |
|------|----------------|------|
| 명함 상세 | `card/[id]` | 홈 → 상세 |
| 명함 편집 | `card/edit/[id]` | 상세 → 편집 |
| 수동 입력 | `card/new` | 홈 → 입력 |
| OCR 확인 | `scan/confirm` | 스캔 → 확인 |
| 폴더 내 명함 | `folder/[id]` | 폴더 → 목록 |
| 태그 관리 | `tags/manage` | 설정 → 태그 |
| 프로필 편집 | `settings/profile` | 설정 → 프로필 |

### 3.2 Modal 화면

| 모달 | 트리거 | 컴포넌트 |
|------|--------|---------|
| 폴더 선택 | 명함 이동, 필터 | `FolderSelectBottomSheet` |
| 태그 선택 | 명함 태그 추가, 필터 | `TagSelectBottomSheet` |
| 필터/정렬 | 홈 필터 아이콘 | `FilterSortBottomSheet` |
| 삭제 확인 | 삭제 버튼 | `ConfirmationAlert` |
| 이미지 뷰어 | 명함 이미지 탭 | `ImageViewerModal` (full screen) |

### 3.3 Bottom Sheet (react-native-bottom-sheet)

- 폴더 선택, 태그 선택, 필터 등에 사용
- Snap points: ["25%", "50%", "90%"]
- backdrop 탭으로 닫기
- 제스처 드래그로 크기 조절

---

## 4. 플랫폼별 컴포넌트

### 4.1 컴포넌트 구조

```
apps/mobile/src/components/
├── ui/                            # 공통 UI (NativeWind 기반)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Text.tsx
│   ├── Badge.tsx
│   ├── Avatar.tsx
│   ├── Skeleton.tsx
│   ├── Separator.tsx
│   └── IconButton.tsx
│
├── cards/
│   ├── CardList.tsx               # FlatList 기반 목록
│   ├── CardItem.tsx               # 개별 카드 아이템
│   ├── CardDetail.tsx             # 상세 정보
│   ├── CardForm.tsx               # 생성/편집 폼
│   ├── CardSearchBar.tsx          # 검색바
│   ├── CardFilterSheet.tsx        # 필터 Bottom Sheet
│   ├── CardSelectionBar.tsx       # 다중 선택 액션 바
│   ├── CardQuickActions.tsx       # 빠른 액션
│   └── ContactDetailFields.tsx    # 다중 전화/이메일
│
├── scan/
│   ├── CameraViewfinder.tsx       # 카메라 뷰파인더
│   ├── FrameGuide.tsx             # 명함 프레임 가이드 오버레이
│   ├── CaptureButton.tsx          # 촬영 버튼 (원형, Haptic)
│   ├── ScanProgress.tsx           # OCR 진행 표시
│   └── OcrResultForm.tsx          # 결과 확인/편집 폼
│
├── folders/
│   ├── FolderList.tsx             # 폴더 목록
│   ├── FolderItem.tsx             # 폴더 아이템
│   ├── FolderSelectSheet.tsx      # 폴더 선택 Bottom Sheet
│   └── FolderCreateSheet.tsx      # 폴더 생성 Sheet
│
├── tags/
│   ├── TagList.tsx                # 태그 목록
│   ├── TagBadge.tsx               # 태그 뱃지
│   ├── TagSelectSheet.tsx         # 태그 선택 Sheet
│   └── TagCreateSheet.tsx         # 태그 생성 Sheet
│
├── auth/
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   ├── SocialLoginButtons.tsx     # Firebase Auth 소셜 로그인
│   └── OnboardingSlides.tsx       # 온보딩 슬라이드
│
├── settings/
│   ├── ProfileForm.tsx
│   └── ExportWizard.tsx
│
└── common/
    ├── EmptyState.tsx
    ├── LoadingSpinner.tsx
    ├── ErrorView.tsx
    ├── InfiniteList.tsx           # FlatList + onEndReached
    ├── ConfirmationAlert.tsx
    ├── ImageViewer.tsx
    └── BottomSheetWrapper.tsx
```

### 4.2 Camera Viewfinder (`CameraViewfinder.tsx`)

```typescript
// Expo Camera 사용
import { CameraView, useCameraPermissions } from "expo-camera";

// 기능:
// - 카메라 권한 요청/확인
// - 전/후면 카메라 전환 (facing: "front" | "back")
// - 오토포커스
// - 플래시 제어 (auto/on/off)
// - 줌 제어 (핀치 줌 제스처)
```

### 4.3 Frame Guide (`FrameGuide.tsx`)

```typescript
// 명함 크기 가이드 오버레이
// - 반투명 마스크 (명함 영역 외부)
// - 명함 비율 가이드 라인 (3.5:2 비율)
// - 코너 표시
// - "명함을 가이드 안에 맞춰주세요" 텍스트
// - react-native-reanimated로 가이드 애니메이션
```

### 4.4 Capture Button (`CaptureButton.tsx`)

```typescript
// 원형 촬영 버튼
// - 외부 링: 흰색 원
// - 내부 원: 흰색 채움 (눌렀을 때 축소 애니메이션)
// - Haptic Feedback: expo-haptics (ImpactFeedbackStyle.Medium)
// - 촬영 중 비활성화
// - 갤러리 선택 버튼 (좌측 하단)
// - 카메라 전환 버튼 (우측 하단)
```

---

## 5. 모바일 전용 인터랙션

### 5.1 Long Press 다중 선택

```
동작 흐름:
1. 카드 아이템 Long Press (500ms)
   → Haptic Feedback (ImpactFeedbackStyle.Medium)
   → 선택 모드 활성화
   → 해당 카드 선택됨

2. 선택 모드에서:
   - 일반 탭 → 선택/해제 토글
   - Haptic Feedback (ImpactFeedbackStyle.Light)
   - 상단에 선택 카운트 표시
   - 하단에 액션 바: [이동] [태그] [삭제]

3. 선택 모드 해제:
   - "완료" 버튼 탭
   - 뒤로가기
   - 모든 선택 해제 시
```

### 5.2 Haptic Feedback 매핑

| 액션 | Haptic 스타일 |
|------|--------------|
| 촬영 | ImpactFeedbackStyle.Medium |
| Long Press 진입 | ImpactFeedbackStyle.Medium |
| 선택/해제 토글 | ImpactFeedbackStyle.Light |
| 즐겨찾기 토글 | ImpactFeedbackStyle.Light |
| 삭제 확인 | NotificationFeedbackType.Warning |
| 저장 완료 | NotificationFeedbackType.Success |
| 에러 | NotificationFeedbackType.Error |

### 5.3 Swipe 액션 (선택적)

| 방향 | 액션 | 비고 |
|------|------|------|
| Left Swipe | 삭제 (빨간색) | 확인 다이얼로그 표시 |
| Right Swipe | 즐겨찾기 토글 (노란색) | 즉시 반영 |

> react-native-gesture-handler의 Swipeable 사용

### 5.4 Pull-to-Refresh

- 모든 목록 화면에 Pull-to-Refresh 적용
- TanStack Query의 refetch 트리거
- 커스텀 RefreshControl 컴포넌트

---

## 6. Deep Linking

### 6.1 URL Scheme 설정

```
cardkeeper://                     # 앱 열기
cardkeeper://cards                # 명함 목록
cardkeeper://cards/{id}           # 명함 상세
cardkeeper://scan                 # 스캔 화면
cardkeeper://folders              # 폴더 목록
cardkeeper://folders/{id}         # 폴더별 목록
```

### 6.2 Universal Links / App Links

```
https://cardkeeper.app/cards/{id}     → card/[id]
https://cardkeeper.app/verify-email?token=xxx  → 이메일 인증
https://cardkeeper.app/reset-password?token=xxx → 비밀번호 재설정
```

### 6.3 Expo Router 설정

```typescript
// app.json
{
  "expo": {
    "scheme": "cardkeeper",
    "experiments": {
      "typedRoutes": true
    }
  }
}
```

---

## 7. MMKV 로컬 스토리지

### 7.1 사용 용도

| 키 | 값 | 용도 |
|----|-----|------|
| `auth.accessToken` | string | JWT Access Token |
| `auth.refreshToken` | string | Refresh Token |
| `ui.viewMode` | "card" \| "list" | 목록 뷰 모드 |
| `ui.onboardingDone` | boolean | 온보딩 완료 여부 |
| `search.recentQueries` | string[] (JSON) | 최근 검색어 (최대 10개) |
| `draft.newCard` | object (JSON) | 수동 입력 Draft |

### 7.2 초기화

```typescript
import { MMKV } from "react-native-mmkv";

export const storage = new MMKV({
  id: "cardkeeper-storage",
  encryptionKey: "cardkeeper-encryption-key", // 민감 데이터 암호화
});

// Zustand persist 미들웨어와 연동
import { StateStorage } from "zustand/middleware";

export const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.delete(name),
};
```

---

## 8. 오프라인 고려사항

### 8.1 MVP 범위

- **읽기:** TanStack Query 캐시로 마지막 조회 데이터 표시
- **쓰기:** 오프라인 시 에러 메시지 표시 (MVP에서는 쓰기 오프라인 미지원)
- **인디케이터:** 상단에 네트워크 상태 배너 표시

### 8.2 Post-MVP 계획

- Mutation Queue: 오프라인에서 변경 저장 → 온라인 복귀 시 동기화
- Background Sync
- Conflict Resolution 전략

---

## 9. 화면별 상세

### 9.1 홈 - 명함 리스트 (`(tabs)/index.tsx`)

**레이아웃:**
```
┌─────────────────────────────┐
│ CardKeeper       🔍  [+ ]  │  (Header)
├─────────────────────────────┤
│ [검색바 (확장형)]            │
│ 필터: [폴더] [태그] [★]     │
├─────────────────────────────┤
│ ┌───────────────────────┐   │
│ │ [썸네일] 김철수        │   │
│ │          CTO          │   │
│ │          테크코리아  ★ │   │
│ │ VIP  IT업계           │   │
│ └───────────────────────┘   │
│ ┌───────────────────────┐   │
│ │ [썸네일] 박지영        │   │
│ │          디자이너      │   │
│ │          크리에이티브   │   │
│ └───────────────────────┘   │
│                             │
│ (FlatList, 무한 스크롤)      │
├─────────────────────────────┤
│  [홈]  [스캔]  [폴더]  [설정] │ (Tab Bar)
└─────────────────────────────┘
```

**FlatList 최적화:**
- `keyExtractor`: card.id
- `getItemLayout`: 고정 높이 (성능)
- `onEndReached`: 다음 페이지 로드 (threshold 0.5)
- `windowSize`: 5 (메모리 최적화)
- `maxToRenderPerBatch`: 10
- `ListEmptyComponent`: EmptyState

### 9.2 스캔 (`(tabs)/scan.tsx`)

```
┌─────────────────────────────┐
│          [x]        [Flash] │
│                             │
│  ┌───────────────────────┐  │
│  │                       │  │
│  │   Camera Viewfinder   │  │
│  │                       │  │
│  │  ┌─ ─ ─ ─ ─ ─ ─ ┐   │  │
│  │  │  Frame Guide   │   │  │
│  │  │  (명함 영역)    │   │  │
│  │  └─ ─ ─ ─ ─ ─ ─ ┘   │  │
│  │                       │  │
│  └───────────────────────┘  │
│                             │
│  "명함을 가이드에 맞춰주세요"  │
│                             │
│ [갤러리]    (◯)    [전환]    │
│                             │
└─────────────────────────────┘
```

**동작:**
1. 촬영 버튼 탭 → Haptic + 촬영
2. 촬영 이미지 미리보기 + "사용하기" / "다시 촬영"
3. "사용하기" → POST /api/v1/scan/upload → OCR 처리 중 로딩
4. 성공 → `/scan/confirm?scanId=xxx`

**갤러리 선택:**
- expo-image-picker로 갤러리에서 이미지 선택
- 선택 후 동일 업로드 플로우

### 9.3 설정 (`(tabs)/settings.tsx`)

```
┌─────────────────────────────┐
│ 설정                         │
├─────────────────────────────┤
│ [아바타] 김현수               │
│         kim@example.com      │
│         [프로필 편집 >]       │
├─────────────────────────────┤
│ 📂 태그 관리              >  │
│ 📤 내보내기               >  │
├─────────────────────────────┤
│ ❓ 도움말                 >  │
│ 📜 이용약관               >  │
│ 🔒 개인정보처리방침        >  │
├─────────────────────────────┤
│ 🚪 로그아웃                  │
├─────────────────────────────┤
│ v0.1.0                       │
└─────────────────────────────┘
```

---

## 10. 모바일 Hooks

```
apps/mobile/src/hooks/
├── use-camera-permission.ts      # 카메라 권한 관리
├── use-network-status.ts         # 네트워크 상태 감지
├── use-haptic.ts                 # Haptic Feedback 래퍼
├── use-secure-store.ts           # expo-secure-store 래퍼
└── use-keyboard-height.ts        # 키보드 높이 감지
```

> 비즈니스 로직 hooks (use-cards, use-folders 등)는 api-client 패키지를 통해 Web과 공유

---

**다음 문서:** [05-state-management.md](./05-state-management.md)
