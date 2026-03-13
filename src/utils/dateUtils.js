export function parseKSTDateString(dateString) {
  if (!dateString) return new Date("");

  // 커스텀 날짜 파싱 (예: "26년3월14일5시28분AM" 또는 "2026년 3월 14일 15시 30분")
  const match = dateString.match(/(\d{2,4})년\s*(\d{1,2})월\s*(\d{1,2})일(?:\s*(\d{1,2})시\s*(?:(\d{1,2})분)?\s*(AM|PM|am|pm)?)?/i);
  
  if (match) {
    let yearStr = match[1];
    let year = parseInt(yearStr, 10);
    // 2자리 연도면 2000 추가 (예: 26 -> 2026)
    if (year < 100) year += 2000;
    
    const month = String(parseInt(match[2], 10)).padStart(2, '0');
    const day = String(parseInt(match[3], 10)).padStart(2, '0');
    
    let hourStr = match[4];
    let minStr = match[5];
    let ampm = match[6] ? match[6].toUpperCase() : '';
    
    let hour = hourStr ? parseInt(hourStr, 10) : 0;
    const minute = minStr ? String(parseInt(minStr, 10)).padStart(2, '0') : '00';
    
    // AM/PM 로직 적용
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    
    const hourFormatted = String(hour).padStart(2, '0');
    
    // 강제로 KST (+09:00) 로딩
    const isoString = `${year}-${month}-${day}T${hourFormatted}:${minute}:00+09:00`;
    return new Date(isoString);
  }

  // 매치 안되면 기본 Date 파싱 시도
  return new Date(dateString);
}

export function formatChangelogDate(dateString) {
  if (!dateString) return "";
  const d = parseKSTDateString(dateString);
  if (isNaN(d.getTime())) return dateString;

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const formattedDate = `${year}.${month}.${day}`;

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  let relativeTime = "";
  if (diffDay > 0) {
    relativeTime = `${diffDay}일 전`;
  } else if (diffHour > 0) {
    // If it's less than a day, show hours
    relativeTime = `${diffHour}시간 전`;
    if (diffMin % 60 > 0) {
      relativeTime = `${diffHour}시간 ${diffMin % 60}분 전`;
    }
  } else if (diffMin > 0) {
    relativeTime = `${diffMin}분 전`;
  } else {
    relativeTime = "방금 전";
  }

  return `${formattedDate} (${relativeTime})`;
}
