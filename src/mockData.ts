import { CRMData } from "./types";

export const crmData: CRMData = {
  participants: [
    { id: "p1", name: "김민지", phone: "010-2231-9982", school: "연세대학교", grade: "2학년", firstJoinedAt: "2026-01-12", referralCode: "MINJI12", notes: "운영 스태프 후보로 적합함.", joinedByReferral: false },
    { id: "p2", name: "박지원", phone: "010-5512-7430", school: "이화여자대학교", grade: "1학년", firstJoinedAt: "2026-02-08", referralCode: "JIWON08", notes: "주말 이벤트 선호.", joinedByReferral: true },
    { id: "p3", name: "이도현", phone: "010-7302-4851", school: "고려대학교", grade: "3학년", firstJoinedAt: "2025-11-20", referralCode: "DANIEL20", notes: "스타트업과 커리어 네트워킹 주제에 관심이 높음.", joinedByReferral: false },
    { id: "p4", name: "최소연", phone: "010-9087-1238", school: "서강대학교", grade: "4학년", firstJoinedAt: "2026-03-03", referralCode: "SOYEON03", notes: "스폰서십 협업 관련 팀 연락 요청.", joinedByReferral: true },
    { id: "p5", name: "한지훈", phone: "010-6002-1189", school: "한양대학교", grade: "2학년", firstJoinedAt: "2025-10-09", referralCode: "ALEX09", notes: "지인 동반 참여 빈도가 높음.", joinedByReferral: false },
    { id: "p6", name: "서유나", phone: "010-8222-6910", school: "서울대학교", grade: "1학년", firstJoinedAt: "2026-03-06", referralCode: "YUNA06", notes: "만족도 응답이 매우 긍정적이었음.", joinedByReferral: true }
  ],
  events: [
    { id: "e1", name: "봄 브랜딩 믹서", date: "2026-03-08", location: "신촌 라운지", topic: "네트워킹", entryFee: 15000, discountPolicy: "친구 1명 초대 시 다음 이벤트 5,000원 할인", description: "브랜딩과 대학 커뮤니티에 관심 있는 학생들을 위한 캐주얼 네트워킹 모임." },
    { id: "e2", name: "크리에이터 성장 토크", date: "2026-02-14", location: "홍대 스튜디오홀", topic: "콘텐츠 전략", entryFee: 12000, discountPolicy: "추천 유입 참여자에게 웰컴 드링크 쿠폰 제공", description: "크리에이터 브랜딩과 숏폼 성과를 다루는 패널 토크 이벤트." },
    { id: "e3", name: "커리어 커피 밋업", date: "2026-01-12", location: "강남 카페랩", topic: "커리어", entryFee: 10000, discountPolicy: "친구 2명 초대 시 다음 모임 무료 입장", description: "마케팅 커리어 경험과 네트워킹을 중심으로 한 소규모 밋업." },
    { id: "e4", name: "윈터 소셜 나이트", date: "2025-12-18", location: "이태원 루프탑", topic: "커뮤니티", entryFee: 18000, discountPolicy: "추천 보상은 운영자가 수동으로 지정", description: "기존 참여자와 신규 초대자가 함께한 학기말 소셜 이벤트." }
  ],
  participations: [
    { id: "pt1", participantId: "p1", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "참여자 분위기가 매우 좋았어요.", discountApplied: false, finalPricePaid: 15000 },
    { id: "pt2", participantId: "p2", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "첫 참여였는데 편하게 어울릴 수 있었어요.", discountApplied: true, finalPricePaid: 10000 },
    { id: "pt3", participantId: "p3", eventId: "e1", appliedStatus: true, attendedStatus: "No-show", feedback: "개인 일정이 생겨 참석하지 못했어요.", discountApplied: false, finalPricePaid: 0 },
    { id: "pt4", participantId: "p4", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "다음에는 친구와 다시 오고 싶어요.", discountApplied: true, finalPricePaid: 10000 },
    { id: "pt5", participantId: "p5", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "장소 분위기가 좋았습니다.", discountApplied: false, finalPricePaid: 15000 },
    { id: "pt6", participantId: "p6", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "운영진 진행이 친절했어요.", discountApplied: true, finalPricePaid: 10000 },
    { id: "pt7", participantId: "p1", eventId: "e3", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "연사 구성이 좋았습니다.", discountApplied: false, finalPricePaid: 10000 },
    { id: "pt8", participantId: "p3", eventId: "e3", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "커리어 이야기들이 실질적으로 도움이 됐어요.", discountApplied: false, finalPricePaid: 10000 },
    { id: "pt9", participantId: "p5", eventId: "e3", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "비슷한 관심사의 사람들을 많이 만났어요.", discountApplied: false, finalPricePaid: 10000 },
    { id: "pt10", participantId: "p2", eventId: "e2", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "실무 팁이 많아 유익했어요.", discountApplied: false, finalPricePaid: 12000 },
    { id: "pt11", participantId: "p3", eventId: "e2", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "지금까지 Colorz 이벤트 중 가장 만족도가 높았습니다.", discountApplied: true, finalPricePaid: 7000 },
    { id: "pt12", participantId: "p5", eventId: "e4", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "커뮤니티 분위기가 강하게 느껴졌어요.", discountApplied: false, finalPricePaid: 18000 }
  ],
  referrals: [
    { id: "r1", referrerParticipantId: "p1", referredParticipantId: "p2", eventId: "e2", referralStatus: "Reward issued", rewardType: "다음 이벤트 5,000원 할인", rewardIssued: true, rewardUsed: true },
    { id: "r2", referrerParticipantId: "p5", referredParticipantId: "p4", eventId: "e1", referralStatus: "Approved", rewardType: "웰컴 드링크 + 다음 이벤트 할인", rewardIssued: false, rewardUsed: false },
    { id: "r3", referrerParticipantId: "p5", referredParticipantId: "p6", eventId: "e1", referralStatus: "Reward used", rewardType: "친구 2명 추천 시 무료 입장", rewardIssued: true, rewardUsed: true }
  ],
  rewards: [
    { id: "rw1", participantId: "p1", referralId: "r1", rewardType: "다음 이벤트 5,000원 할인", rewardStatus: "Used", issuedAt: "2026-02-14", usedAt: "2026-03-08", relatedEventId: "e1" },
    { id: "rw2", participantId: "p5", referralId: "r3", rewardType: "무료 입장", rewardStatus: "Issued", issuedAt: "2026-03-08", relatedEventId: "e1" },
    { id: "rw3", participantId: "p2", rewardType: "첫 참여 웰컴 드링크", rewardStatus: "Used", issuedAt: "2026-02-14", usedAt: "2026-02-14", relatedEventId: "e2" },
    { id: "rw4", participantId: "p4", referralId: "r2", rewardType: "추천 유입 첫 참여 혜택", rewardStatus: "Available", issuedAt: "2026-03-08", relatedEventId: "e1" }
  ],
  importHistory: [
    { id: "i1", fileName: "spring_form_export.csv", importType: "participants", importedAt: "2026-03-08T16:00:00", status: "Completed with warnings", rows: 48, created: 16, updated: 24, warnings: 8 },
    { id: "i2", fileName: "attendance_feb.csv", importType: "participations", importedAt: "2026-02-15T12:40:00", status: "Completed", rows: 31, created: 31, updated: 0, warnings: 0 }
  ]
};
