-- 가능한 날의 시간대(오전/오후) 컬럼 추가 (이미 있으면 건너뜀)
ALTER TABLE member_availability
ADD COLUMN IF NOT EXISTS period VARCHAR(8);
