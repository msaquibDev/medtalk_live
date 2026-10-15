export type Conference = {
  id: number;
  name: string;
  start: string;
  end?: string;
  venue: string;
  accessLink?: string;
  banner?: string;
  amount: string;
  type: "Paid" | "Free";
  status: "Upcoming" | "Live" | "Recorded";
  attendees: number;
};

export type Faculty = {
  id: number;
  name: string;
  email: string;
  phone: string;
  institute: string;
  speciality: string;
};

export type Speciality = { id: number; name: string };

export type RegisteredUser = {
  id: number;
  name: string;
  email: string;
  phoneCode: string;
  mobile: string;
  hospital: string;
  speciality: string;
  registeredAt: string;
};

export const initialSpecialities: Speciality[] = [
  { id: 1, name: "Uro-Oncology" },
  { id: 2, name: "Endourology" },
  { id: 3, name: "Andrology" },
  { id: 4, name: "Pediatric Urology" },
  { id: 5, name: "Reconstructive Urology" },
  { id: 6, name: "General Urology" },
  { id: 7, name: "Other" },
];

export const initialConferences: Conference[] = [
  { id: 1, name: "Advances in Uro-Oncology 2026", start: "Oct 18, 2026 | 09:00 AM", venue: "Taj Palace, New Delhi", banner: "/conference-placeholder.svg", amount: "INR 2,500", type: "Paid", status: "Upcoming", attendees: 248 },
  { id: 2, name: "Endourology Masterclass", start: "Oct 12, 2026 | 10:30 AM", venue: "Online | Meditalk Live", banner: "/conference-placeholder.svg", amount: "Free", type: "Free", status: "Live", attendees: 186 },
  { id: 3, name: "Urology Update 2025", start: "Dec 08, 2025 | 09:00 AM", venue: "ITC Grand Chola, Chennai", banner: "/conference-placeholder.svg", amount: "INR 1,800", type: "Paid", status: "Recorded", attendees: 524 },
];

export const initialFaculty: Faculty[] = [
  { id: 1, name: "Dr. Arjun Mehta", email: "arjun.mehta@meditalk.in", phone: "+91 98765 43210", institute: "Apollo Hospitals, Delhi", speciality: "Uro-Oncology" },
  { id: 2, name: "Dr. Priya Nair", email: "priya.nair@meditalk.in", phone: "+91 98470 12345", institute: "CMC Vellore", speciality: "Endourology" },
  { id: 3, name: "Dr. Rohan Iyer", email: "rohan.iyer@meditalk.in", phone: "+91 98400 87654", institute: "Manipal Hospital, Bengaluru", speciality: "Andrology" },
];

export const initialUsers: RegisteredUser[] = [
  { id: 1, name: "Dr. Piyush Gupta", email: "drpiyush2202@yahoo.co.in", phoneCode: "+91", mobile: "8826372491", hospital: "Apollo Hospitals, Delhi", speciality: "Uro-Oncology", registeredAt: "Sep 29, 2026 | 10:11 PM" },
  { id: 2, name: "Dr. Pranjal Chowdhury", email: "pc12376@gmail.com", phoneCode: "+91", mobile: "8472046025", hospital: "AMRI Hospitals, Kolkata", speciality: "Endourology", registeredAt: "Sep 29, 2026 | 10:10 PM" },
  { id: 3, name: "Dr. Saptagiri Prasad Ramayanam", email: "saptagiriprasad@gmail.com", phoneCode: "+91", mobile: "9390577539", hospital: "Yashoda Hospitals, Hyderabad", speciality: "Uro-Oncology", registeredAt: "Sep 29, 2026 | 09:21 PM" },
  { id: 4, name: "Dr. K. Satyanarayana Murthy", email: "murthy3.ksn@gmail.com", phoneCode: "+91", mobile: "7382446399", hospital: "KIMS Hospitals, Hyderabad", speciality: "Andrology", registeredAt: "Sep 29, 2026 | 09:06 PM" },
  { id: 5, name: "Dr. Tapan Kumar Sahoo", email: "drtapankumarsahoo@gmail.com", phoneCode: "+91", mobile: "8249810428", hospital: "SCB Medical College, Cuttack", speciality: "Endourology", registeredAt: "Sep 29, 2026 | 09:01 PM" },
  { id: 6, name: "Dr. Shyam Babu Prasad", email: "drsbpd.rni@gmail.com", phoneCode: "+91", mobile: "9431414601", hospital: "RIMS, Ranchi", speciality: "General Urology", registeredAt: "Sep 29, 2026 | 09:00 PM" },
  { id: 7, name: "Dr. Nitish Aggarwal", email: "nitishaggarwal184@gmail.com", phoneCode: "+91", mobile: "7986298601", hospital: "Max Super Speciality Hospital, Delhi", speciality: "Reconstructive Urology", registeredAt: "Sep 29, 2026 | 08:54 PM" },
];
