# 다현이 추가/수정한 파일 목록 (팀원 코드와 합칠 때 이 파일들만 보면 돼요)

## 새로 만든 파일 (팀원 파일과 겹치지 않음)
- backend/app/routers/me_memories.py        (내 모든 그룹 추억 모아보기 API: GET /me/memories)
- backend/tests/test_me_memories.py, backend/tests/test_day_covers.py
- frontend/src/components/MemoryTabs.tsx, PhotoLightbox.tsx, PhotoCalendar.tsx, memories.css
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
- frontend/src/components/photos.css, memories.css : 모바일 사진 타일, 전체 추억 날짜 제목 위 간격 넓힘
- frontend/src/components/chat/chat.module.css, bundle.module.css : 채팅 사진 잘림 / 간격
- frontend/src/features/calendar/calendar.module.css : 달력 칸 정사각형
- frontend/src/components/photos.css : 모바일 사진 페이지를 '전체 추억'처럼 3열 정사각형 격자로
- frontend/src/components/chat/ChatPanel.tsx, chat.module.css : 모바일 채팅방을 화면 높이에 맞춰 입력창이 처음부터 탭바 바로 위에 가만히 있게 (스크롤 코드 없이 CSS로만, 모바일 제목은 숨김)
- frontend/src/app/groups/page.tsx : 그룹 홈 전환 버튼 순서 "내 그룹 | 전체 추억" + 처음 열면 내 그룹부터 (PC·모바일 공통)
- frontend/src/components/chat/chat.module.css, ChatPanel.tsx : 모바일 채팅 맨 위에 그룹 이름(카톡식), 입력창·약속 띠 작게 (PC는 그대로)
- frontend/src/components/chat/MessageComposer.tsx, OutgoingPhotos.tsx, AttachMessage.tsx, hooks/useOutgoingPhotos.ts : 사진 한 번에 최대 27장, 한 말풍선 9장(3x3) — PC·모바일 공통
- frontend/src/features/calendar/calendar.module.css : 모바일 달력은 멤버 줄 대신 색 점 (PC는 그대로)
- frontend/src/app/groups/[id]/photos/[photoId]/page.tsx : 사진 다운로드 버튼 글씨가 두 줄로 꺾이지 않게
- frontend/src/app/groups/[id]/photos/upload/page.tsx : 앨범에 올리는 사진도 올리기 전에 줄여서 올림 (속도)
- frontend/src/features/transit/sdk.ts, lib/kakao.ts : 지도 못 불러올 때 지금 주소(도메인)를 알려 주는 안내문

## 이번 라운드 (_21)
- [친구 속도 개선 zip 합침] backend/app/routers/photos.py, backend/meeting_tools/planning/{models,routes}.py, backend/memory_api/routes.py, backend/migrations/20261109_proxy_departures.sql(새 파일), backend/tests/test_proxy_departures.py(새 파일)
  frontend/src/components/chat/{sharedVoteStore.ts(새 파일),useVotePoll.ts}, features/recommendation/{RecommendationPage.tsx,planTypes.ts,recommendation.module.css,usePlacePlan.ts}, hooks/{useArrivals,useGroupMessages,useLocationShare}.ts, lib/api.ts
  (주의: 마이그레이션 SQL 을 공유 Supabase 에 먼저 실행해야 함 - 친구에게 확인)
- [채팅 첨부] components/chat/MessageComposer.tsx : 사진+첨부 칩을 "첨부" 하나로 합침 (눌러서 사진 / 문서·파일 선택), chat.module.css(.attachMenu)
- [그룹 홈 되돌림] app/groups/page.tsx : 전체 추억·그룹 색 점 제거, 내 그룹만 / components/AllMemories.tsx 삭제
- [추억 화면] 탭(사진/추억지도/지난기록) 없이 한 페이지에 정리
  app/groups/[id]/memories/page.tsx(새), components/MemoryHome.tsx(새), lib/photoCalendar.ts(새)
  components/MemoryTabs.tsx(← 추억 링크로), PhotoCalendar.tsx(inline 모드), Sidebar.tsx(추억 → /memories), features/memory/MemoryMap.tsx(MemoryMapPreview), components/memories.css, app/groups/[id]/photos/page.tsx(?day= 지원, 달력 계산을 lib 로)
- [추억 화면 폭 보정] memories.css : 태블릿/좁은 창에서 달력이 화면 전체로 늘어나지 않게 최대 460px, 사진 타일 6열
- [모바일 사진 1열 버그] features/memory/MemoryMap.tsx : 예전 복사본 features/memory/photos.css(모바일 1열) 대신 components/photos.css 를 불러오게 변경. 추억 화면에서 사진 페이지로 이동하면 옛 CSS 가 덮어써서 사진이 1장씩 크게 뜨던 문제
- [추억 화면 달력] components/MemoryHome.tsx, memories.css : 달력이 팝업처럼 화면을 덮던 문제(옛 .pc-back CSS 우선순위) 수정 (달력은 처음부터 펼쳐서 보여 줌, 접기 버튼 없음)
