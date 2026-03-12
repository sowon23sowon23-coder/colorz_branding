import { CRMData } from "./types";

export const crmData: CRMData = {
  participants: [
    { id: "p1", name: "Minji Kim", phone: "010-2231-9982", school: "Yonsei University", grade: "2nd year", firstJoinedAt: "2026-01-12", referralCode: "MINJI12", notes: "Strong candidate for volunteer host role.", joinedByReferral: false },
    { id: "p2", name: "Jiwon Park", phone: "010-5512-7430", school: "Ewha Womans University", grade: "1st year", firstJoinedAt: "2026-02-08", referralCode: "JIWON08", notes: "Prefers weekend events.", joinedByReferral: true },
    { id: "p3", name: "Daniel Lee", phone: "010-7302-4851", school: "Korea University", grade: "3rd year", firstJoinedAt: "2025-11-20", referralCode: "DANIEL20", notes: "Interested in startup and career networking topics.", joinedByReferral: false },
    { id: "p4", name: "Soyeon Choi", phone: "010-9087-1238", school: "Sogang University", grade: "4th year", firstJoinedAt: "2026-03-03", referralCode: "SOYEON03", notes: "Requested team contact for sponsorship collaboration.", joinedByReferral: true },
    { id: "p5", name: "Alex Han", phone: "010-6002-1189", school: "Hanyang University", grade: "2nd year", firstJoinedAt: "2025-10-09", referralCode: "ALEX09", notes: "Often brings classmates.", joinedByReferral: false },
    { id: "p6", name: "Yuna Seo", phone: "010-8222-6910", school: "Seoul National University", grade: "1st year", firstJoinedAt: "2026-03-06", referralCode: "YUNA06", notes: "Submitted high satisfaction feedback.", joinedByReferral: true }
  ],
  events: [
    { id: "e1", name: "Spring Brand Mixer", date: "2026-03-08", location: "Sinchon Lounge", topic: "Networking", entryFee: 15000, discountPolicy: "Bring 1 friend for 5,000 KRW off next event.", description: "Casual networking night for students interested in branding and campus communities." },
    { id: "e2", name: "Creator Growth Talk", date: "2026-02-14", location: "Hongdae Studio Hall", topic: "Content Strategy", entryFee: 12000, discountPolicy: "Referred participant gets welcome drink coupon.", description: "Panel event about creator branding and short-form content performance." },
    { id: "e3", name: "Career Coffee Meetup", date: "2026-01-12", location: "Gangnam Cafe Lab", topic: "Career", entryFee: 10000, discountPolicy: "Invite 2 friends for free entry to the next meetup.", description: "Small-group meetup focused on marketing career stories and peer networking." },
    { id: "e4", name: "Winter Social Night", date: "2025-12-18", location: "Itaewon Rooftop", topic: "Community", entryFee: 18000, discountPolicy: "Referral reward manually assigned by operator.", description: "End-of-semester social gathering with returning participants and invitees." }
  ],
  participations: [
    { id: "pt1", participantId: "p1", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "Loved the crowd quality.", discountApplied: false, finalPricePaid: 15000 },
    { id: "pt2", participantId: "p2", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "Good first experience.", discountApplied: true, finalPricePaid: 10000 },
    { id: "pt3", participantId: "p3", eventId: "e1", appliedStatus: true, attendedStatus: "No-show", feedback: "Schedule conflict.", discountApplied: false, finalPricePaid: 0 },
    { id: "pt4", participantId: "p4", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "Would return with friends.", discountApplied: true, finalPricePaid: 10000 },
    { id: "pt5", participantId: "p5", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "Nice venue.", discountApplied: false, finalPricePaid: 15000 },
    { id: "pt6", participantId: "p6", eventId: "e1", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "Friendly hosts.", discountApplied: true, finalPricePaid: 10000 },
    { id: "pt7", participantId: "p1", eventId: "e3", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "Great speaker mix.", discountApplied: false, finalPricePaid: 10000 },
    { id: "pt8", participantId: "p3", eventId: "e3", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "Very useful career stories.", discountApplied: false, finalPricePaid: 10000 },
    { id: "pt9", participantId: "p5", eventId: "e3", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "Good peer connections.", discountApplied: false, finalPricePaid: 10000 },
    { id: "pt10", participantId: "p2", eventId: "e2", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "Practical tips.", discountApplied: false, finalPricePaid: 12000 },
    { id: "pt11", participantId: "p3", eventId: "e2", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 5, feedback: "Best Colorz event so far.", discountApplied: true, finalPricePaid: 7000 },
    { id: "pt12", participantId: "p5", eventId: "e4", appliedStatus: true, attendedStatus: "Attended", satisfactionScore: 4, feedback: "Community vibe was strong.", discountApplied: false, finalPricePaid: 18000 }
  ],
  referrals: [
    { id: "r1", referrerParticipantId: "p1", referredParticipantId: "p2", eventId: "e2", referralStatus: "Reward issued", rewardType: "5,000 KRW next-event discount", rewardIssued: true, rewardUsed: true },
    { id: "r2", referrerParticipantId: "p5", referredParticipantId: "p4", eventId: "e1", referralStatus: "Approved", rewardType: "Welcome drink + next-event discount", rewardIssued: false, rewardUsed: false },
    { id: "r3", referrerParticipantId: "p5", referredParticipantId: "p6", eventId: "e1", referralStatus: "Reward used", rewardType: "Free entry after 2 referrals", rewardIssued: true, rewardUsed: true }
  ],
  rewards: [
    { id: "rw1", participantId: "p1", referralId: "r1", rewardType: "5,000 KRW next-event discount", rewardStatus: "Used", issuedAt: "2026-02-14", usedAt: "2026-03-08", relatedEventId: "e1" },
    { id: "rw2", participantId: "p5", referralId: "r3", rewardType: "Free entry", rewardStatus: "Issued", issuedAt: "2026-03-08", relatedEventId: "e1" },
    { id: "rw3", participantId: "p2", rewardType: "First-time welcome drink", rewardStatus: "Used", issuedAt: "2026-02-14", usedAt: "2026-02-14", relatedEventId: "e2" },
    { id: "rw4", participantId: "p4", referralId: "r2", rewardType: "First-time referral benefit", rewardStatus: "Available", issuedAt: "2026-03-08", relatedEventId: "e1" }
  ],
  importHistory: [
    { id: "i1", fileName: "spring_form_export.csv", importType: "participants", importedAt: "2026-03-08T16:00:00", status: "Completed with warnings", rows: 48, created: 16, updated: 24, warnings: 8 },
    { id: "i2", fileName: "attendance_feb.csv", importType: "participations", importedAt: "2026-02-15T12:40:00", status: "Completed", rows: 31, created: 31, updated: 0, warnings: 0 }
  ]
};
