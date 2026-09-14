export interface Student {
  id: string;
  studentId: string;
  name: string;
  rfidUid: string;
  department: string;
  semester: string;
  section: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  bleDeviceId?: string;
  macAddress?: string;
  // Computed / cached stats
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  attendancePercentage: number;
}
