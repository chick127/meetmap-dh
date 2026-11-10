# 다현이 추가/수정한 파일 목록 (팀원 코드와 합칠 때 이 파일들만 보면 돼요)

## 새로 만든 파일 (팀원 파일과 겹치지 않음)
- backend/app/routers/me_memories.py        (내 모든 그룹 추억 모아보기 API: GET /me/memories)
- backend/tests/test_me_memories.py, backend/tests/test_day_covers.py
- frontend/src/components/AllMemories.tsx, MemoryTabs.tsx, PhotoLightbox.tsx, PhotoCalendar.tsx, memories.css
- frontend/src/lib/memories.ts

## 기존 파일 중 조금 고친 것
- backend/app/main.py            : me_memories 라우터 등록 (2줄)
- backend/app/models.py          : PhotoDayCover 테이블 추가
- backend/app/routers/photos.py  : 달력 대표 사진 API (day-covers)
- frontend/src/components/Sidebar.tsx : 사진/지난 기록 → "추억" 한 메뉴, 지도는 ?view=transit
- frontend/src/features/map/MapHub.tsx : 그룹 안 지도 머리말(추억 탭)
- frontend/src/features/memory/MemoryMap.tsx, PhotoMap.tsx : 크게 보기, 전체 지도로 버튼, 핀 색
- frontend/src/app/groups/page.tsx : 전체 추억 / 내 그룹 전환
- frontend/src/app/groups/[id]/photos/page.tsx, photos/[photoId]/page.tsx, records/page.tsx
- frontend/src/components/PhotoShell.tsx, photos.css, chat/MessageComposer.tsx, photos/upload/page.tsx
- frontend/src/lib/photos.ts
- frontend/src/app/globals.css : 맨 아래 "모바일 탭바" CSS 블록만 추가 (기존 줄은 안 건드림)

## 모바일 다듬기 (PC 화면은 그대로, 모바일 media query 안에서만)
- frontend/src/app/globals.css : 맨 아래 모바일 블록(탭바, 약속 버튼 배치)
- frontend/src/app/groups/[id]/meetings/page.tsx : 버튼 묶음 div 에 className "meet-actions" 만 추가
- frontend/src/components/photos.css, memories.css : 모바일 사진 타일
- frontend/src/components/chat/chat.module.css, bundle.module.css : 채팅 사진 잘림 / 간격
- frontend/src/features/calendar/calendar.module.css : 달력 칸 정사각형
- frontend/src/components/photos.css : 모바일 사진 페이지를 '전체 추억'처럼 3열 정사각형 격자로
- frontend/src/components/chat/ChatPanel.tsx : 모바일에서 채팅방 처음 들어올 때 한 번만 입력창이 화면 아래에 보이게 스크롤 (이후 자유 스크롤)
- frontend/src/app/groups/page.tsx : 그룹 홈 위쪽 전환 버튼 순서 "내 그룹 | 전체 추억" (PC·모바일 공통)
