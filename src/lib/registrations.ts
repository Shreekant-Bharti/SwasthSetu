// Registration types and utilities for role-specific forms

export interface PatientRegistration {
  id: string;
  role: 'patient';
  status: 'pending' | 'approved' | 'declined';
  fullName: string;
  age: number;
  gender: string;
  village: string;
  mobile: string;
  email?: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  hasFamilyInsurance: boolean;
  medicalHistory: string;
  createdAt: string;
  approvedCredentials?: { username: string; password: string };
  declineReason?: string;
}

export interface DoctorRegistration {
  id: string;
  role: 'doctor';
  status: 'pending' | 'approved' | 'declined';
  fullName: string;
  licenseNumber: string;
  specialization: string;
  yearsOfExperience: number;
  hospitalAffiliation: string;
  mobile: string;
  email: string;
  profilePhoto?: string;
  bio: string;
  createdAt: string;
  approvedCredentials?: { username: string; password: string };
  declineReason?: string;
}

export interface HospitalRegistration {
  id: string;
  role: 'hospital';
  status: 'pending' | 'approved' | 'declined';
  hospitalName: string;
  registrationId: string;
  type: 'Government' | 'Private';
  address: string;
  numberOfBeds: number;
  contactPersonName: string;
  contactPersonMobile: string;
  email: string;
  opdHours: string;
  createdAt: string;
  approvedCredentials?: { username: string; password: string };
  declineReason?: string;
}

export interface PharmacyRegistration {
  id: string;
  role: 'pharmacy';
  status: 'pending' | 'approved' | 'declined';
  pharmacyName: string;
  ownerName: string;
  registrationNumber: string;
  address: string;
  mobile: string;
  timings: string;
  medicineCategories: string[];
  createdAt: string;
  approvedCredentials?: { username: string; password: string };
  declineReason?: string;
}

export interface InsuranceRegistration {
  id: string;
  role: 'insurance';
  status: 'pending' | 'approved' | 'declined';
  companyName: string;
  type: 'Company' | 'Agent';
  licenseId: string;
  contactPersonName: string;
  contactPersonMobile: string;
  coveragePlans: string;
  email: string;
  createdAt: string;
  approvedCredentials?: { username: string; password: string };
  declineReason?: string;
}

export interface AdminRegistration {
  id: string;
  role: 'admin';
  status: 'pending' | 'approved' | 'declined';
  adminName: string;
  organizationName: string;
  email: string;
  mobile: string;
  roleDescription: string;
  createdAt: string;
  approvedCredentials?: { username: string; password: string };
  declineReason?: string;
}

export type Registration = 
  | PatientRegistration 
  | DoctorRegistration 
  | HospitalRegistration 
  | PharmacyRegistration 
  | InsuranceRegistration 
  | AdminRegistration;

// Storage keys
const REGISTRATION_KEYS = {
  patient: 'registrations_patients',
  doctor: 'registrations_doctors',
  hospital: 'registrations_hospitals',
  pharmacy: 'registrations_pharmacies',
  insurance: 'registrations_insurance',
  admin: 'registrations_admins'
};

// Get registrations by role
export const getRegistrations = (role: keyof typeof REGISTRATION_KEYS): Registration[] => {
  return JSON.parse(localStorage.getItem(REGISTRATION_KEYS[role]) || '[]');
};

// Get all pending registrations
export const getAllPendingRegistrations = (): Registration[] => {
  const allRegs: Registration[] = [];
  Object.values(REGISTRATION_KEYS).forEach(key => {
    const regs = JSON.parse(localStorage.getItem(key) || '[]') as Registration[];
    allRegs.push(...regs.filter(r => r.status === 'pending'));
  });
  return allRegs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

// Save registration
export const saveRegistration = (registration: Omit<Registration, 'id' | 'status' | 'createdAt'>): string => {
  const role = registration.role;
  const key = REGISTRATION_KEYS[role];
  const regs = JSON.parse(localStorage.getItem(key) || '[]');
  
  const newReg = {
    ...registration,
    id: `reg-${role}-${Date.now()}`,
    status: 'pending' as const,
    createdAt: new Date().toISOString()
  };
  
  regs.push(newReg);
  localStorage.setItem(key, JSON.stringify(regs));
  return newReg.id;
};

// Generate random credentials
const generateCredentials = (role: string, name: string): { username: string; password: string } => {
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8);
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return {
    username: `${sanitizedName}${randomNum}@swasthsetu.com`,
    password: `${role}${randomNum}`
  };
};

// Approve registration
export const approveRegistration = (id: string, role: keyof typeof REGISTRATION_KEYS): { username: string; password: string } | null => {
  const key = REGISTRATION_KEYS[role];
  const regs = JSON.parse(localStorage.getItem(key) || '[]') as Registration[];
  const index = regs.findIndex(r => r.id === id);
  
  if (index === -1) return null;
  
  const reg = regs[index];
  const name = 'fullName' in reg ? reg.fullName : 
               'hospitalName' in reg ? reg.hospitalName :
               'pharmacyName' in reg ? reg.pharmacyName :
               'companyName' in reg ? reg.companyName :
               'adminName' in reg ? reg.adminName : 'user';
  
  const credentials = generateCredentials(role, name);
  
  regs[index] = {
    ...reg,
    status: 'approved',
    approvedCredentials: credentials
  };
  
  localStorage.setItem(key, JSON.stringify(regs));
  
  // Add to approved credentials for login
  addApprovedCredentials(credentials.username, credentials.password, role, name);
  
  // Add notification
  addRegistrationNotification(id, role, 'approved', credentials);
  
  return credentials;
};

// Decline registration
export const declineRegistration = (id: string, role: keyof typeof REGISTRATION_KEYS, reason: string): void => {
  const key = REGISTRATION_KEYS[role];
  const regs = JSON.parse(localStorage.getItem(key) || '[]') as Registration[];
  const index = regs.findIndex(r => r.id === id);
  
  if (index === -1) return;
  
  regs[index] = {
    ...regs[index],
    status: 'declined',
    declineReason: reason
  };
  
  localStorage.setItem(key, JSON.stringify(regs));
  
  // Add notification
  addRegistrationNotification(id, role, 'declined');
};

// Add credentials to login system
const addApprovedCredentials = (email: string, password: string, role: string, name: string): void => {
  const credentials = JSON.parse(localStorage.getItem('approved_credentials') || '{}');
  credentials[email.toLowerCase()] = { password, email, role, name };
  localStorage.setItem('approved_credentials', JSON.stringify(credentials));
};

// Get approved credentials for login
export const getApprovedCredential = (email: string): { password: string; email: string; role: string; name: string } | null => {
  const credentials = JSON.parse(localStorage.getItem('approved_credentials') || '{}');
  return credentials[email.toLowerCase()] || null;
};

// Registration notifications
export interface RegistrationNotification {
  id: string;
  registrationId: string;
  role: string;
  type: 'approved' | 'declined';
  credentials?: { username: string; password: string };
  message: string;
  read: boolean;
  createdAt: string;
}

const addRegistrationNotification = (
  registrationId: string, 
  role: string, 
  type: 'approved' | 'declined',
  credentials?: { username: string; password: string }
): void => {
  const notifications = JSON.parse(localStorage.getItem('registration_notifications') || '[]');
  
  const message = type === 'approved' 
    ? `Your ${role} registration has been approved! Your login credentials are: Email: ${credentials?.username}, Password: ${credentials?.password}`
    : `Your ${role} registration has been declined. Refund / further steps will be notified.`;
  
  notifications.push({
    id: `notif-${Date.now()}`,
    registrationId,
    role,
    type,
    credentials,
    message,
    read: false,
    createdAt: new Date().toISOString()
  });
  
  localStorage.setItem('registration_notifications', JSON.stringify(notifications));
};

export const getRegistrationNotifications = (): RegistrationNotification[] => {
  return JSON.parse(localStorage.getItem('registration_notifications') || '[]');
};

// Specializations list
export const SPECIALIZATIONS = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Gynecologist',
  'Neurologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Psychiatrist'
];

// Hospital affiliations
export const HOSPITALS = [
  'Dhanpur Community Hospital',
  'Rampur District Hospital',
  'SwasthSetu Medical Center',
  'Rural Health Clinic',
  'Primary Health Center'
];

// Medicine categories
export const MEDICINE_CATEGORIES = [
  'General Medicines',
  'Antibiotics',
  'Pain Relief',
  'Diabetes',
  'Cardiac',
  'Pediatric',
  'Ayurvedic',
  'First Aid',
  'Vitamins & Supplements'
];
