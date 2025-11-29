// localStorage utilities for data persistence

export interface User {
  id: string;
  role: 'patient' | 'doctor' | 'hospital' | 'pharmacy' | 'insurance' | 'admin';
  name: string;
  phone: string;
  village: string;
  email: string;
  status: 'active' | 'pending';
}

export interface Appointment {
  id: string;
  userId: string;
  patientName: string;
  doctor: string;
  hospital: string;
  department: string;
  date: string;
  time: string;
  status: 'pending' | 'transferred' | 'checked' | 'referred' | 'rescheduled' | 'cancelled';
  paymentStatus: 'paid' | 'pending';
  amount: number;
  transferredToDoctor?: boolean;
  opdCardImage?: string;
  rescheduleReason?: string;
  cancelReason?: string;
}

export interface PatientNotification {
  id: string;
  userId: string;
  type: 'transfer' | 'reschedule' | 'cancel' | 'prescription' | 'referral';
  message: string;
  appointmentId?: string;
  read: boolean;
  createdAt: string;
}

export interface HospitalReferral {
  id: string;
  appointmentId: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  reason: string;
  status: 'pending' | 'bed_assigned' | 'completed';
  bedNumber?: string;
  notes?: string;
  paymentCollected?: number;
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  shop: string;
  stock: number;
  price: number;
}

export interface ChatMessage {
  from: 'patient' | 'doctor';
  text: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  userId: string;
  patientName: string;
  messages: ChatMessage[];
}

export interface Insurance {
  id: string;
  userId: string;
  plan: string;
  planPrice: number;
  coverage: string;
  familyMembers: Array<{
    name: string;
    age: number;
    relation: string;
  }>;
  status: 'pending' | 'active' | 'rejected' | 'declined';
  createdAt?: string;
  orderId?: string;
  paymentMethod?: string;
  patientName?: string;
  patientEmail?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  medicines: string;
  diagnosis: string;
  notes: string;
  opdImage?: string;
}

export interface PatientHistory {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  diagnosis: string;
  prescription: string;
  doctorName: string;
}

export interface MedicineOrder {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  medicines: string;
  address: string;
  phone: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface LabBooking {
  id: string;
  patientId: string;
  patientName: string;
  prescriptionId: string;
  tests: string;
  phone: string;
  address: string;
  preferredDate: string;
  status: 'pending' | 'scheduled' | 'completed';
}

export interface MedicineReservation {
  id: string;
  patientId: string;
  patientName: string;
  medicineName: string;
  quantity: number;
  totalPrice: number;
  shopName: string;
  customerName: string;
  address: string;
  pincode: string;
  phone: string;
  paymentMethod: 'COD' | 'Online';
  paymentStatus: 'pending' | 'completed';
  orderDate: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  prescriptionId?: string;
}

// Initialize sample data
const initializeSampleData = () => {
  if (!localStorage.getItem('users')) {
    const sampleUsers: User[] = [
      {
        id: '1',
        role: 'patient',
        name: 'Ramesh Kumar',
        phone: '9876543210',
        village: 'Dhanpur',
        email: 'patient1@test',
        status: 'active'
      },
      {
        id: '2',
        role: 'doctor',
        name: 'Dr. Snehh Kumar',
        phone: '9876543211',
        village: 'Rampur',
        email: 'drsnehh@test',
        status: 'active'
      }
    ];
    localStorage.setItem('users', JSON.stringify(sampleUsers));
  }

  if (!localStorage.getItem('appointments')) {
    localStorage.setItem('appointments', JSON.stringify([]));
  }

  if (!localStorage.getItem('medicines')) {
    const sampleMedicines: Medicine[] = [
      { id: '1', name: 'Paracetamol 500mg', shop: 'Dhanpur Medical Store', stock: 100, price: 10 },
      { id: '2', name: 'Cough Syrup', shop: 'Dhanpur Medical Store', stock: 50, price: 85 },
      { id: '3', name: 'Antibiotic (Amoxicillin)', shop: 'Rampur Pharmacy', stock: 30, price: 120 },
      { id: '4', name: 'Antacid Tablets', shop: 'Rampur Pharmacy', stock: 75, price: 25 },
      { id: '5', name: 'Pain Relief Gel', shop: 'Dhanpur Medical Store', stock: 40, price: 150 },
    ];
    localStorage.setItem('medicines', JSON.stringify(sampleMedicines));
  }

  if (!localStorage.getItem('chats')) {
    localStorage.setItem('chats', JSON.stringify([]));
  }

  if (!localStorage.getItem('swasthsetu_insurances')) {
    localStorage.setItem('swasthsetu_insurances', JSON.stringify([]));
  }

  // Also handle old key for backward compatibility
  if (!localStorage.getItem('insurances')) {
    localStorage.setItem('insurances', JSON.stringify([]));
  }

  if (!localStorage.getItem('prescriptions')) {
    localStorage.setItem('prescriptions', JSON.stringify([]));
  }

  if (!localStorage.getItem('patientHistory')) {
    const sampleHistory: PatientHistory[] = [
      {
        id: '1',
        patientId: '1',
        patientName: 'Ramesh Kumar',
        visitDate: '2025-11-15',
        diagnosis: 'Seasonal Flu',
        prescription: 'Paracetamol 500mg, Rest',
        doctorName: 'Dr. Snehh Kumar'
      },
      {
        id: '2',
        patientId: '1',
        patientName: 'Ramesh Kumar',
        visitDate: '2025-10-20',
        diagnosis: 'Stomach Upset',
        prescription: 'Antacid Tablets, Light Diet',
        doctorName: 'Dr. Snehh Kumar'
      }
    ];
    localStorage.setItem('patientHistory', JSON.stringify(sampleHistory));
  }

  if (!localStorage.getItem('medicineOrders')) {
    const sampleOrders: MedicineOrder[] = [
      {
        id: 'ord-001',
        patientId: '1',
        patientName: 'Ramesh Kumar',
        prescriptionId: 'presc-001',
        medicines: 'Paracetamol 500mg (Qty: 2) - ₹100',
        address: '123 Main Street, Dhanpur, PIN: 123456',
        phone: '9876543210',
        status: 'pending',
        orderDate: '2025-11-28'
      }
    ];
    localStorage.setItem('medicineOrders', JSON.stringify(sampleOrders));
  }

  if (!localStorage.getItem('labBookings')) {
    localStorage.setItem('labBookings', JSON.stringify([]));
  }

  if (!localStorage.getItem('medicineReservations')) {
    const sampleReservations: MedicineReservation[] = [
      {
        id: 'res-001',
        patientId: '1',
        patientName: 'Ramesh Kumar',
        medicineName: 'Cough Syrup',
        quantity: 2,
        totalPrice: 170,
        shopName: 'Dhanpur Medical Store',
        customerName: 'Ramesh Kumar',
        address: '123 Main Street, Dhanpur',
        pincode: '123456',
        phone: '9876543210',
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        orderDate: '2025-11-29',
        status: 'pending'
      }
    ];
    localStorage.setItem('medicineReservations', JSON.stringify(sampleReservations));
  }
};

// Auth utilities
export const login = (email: string, password: string): User | null => {
  initializeSampleData();
  
  // Updated credentials with proper email format
  const credentials: Record<string, { password: string; email: string; role: User['role']; name: string }> = {
    'patient1@test': { password: 'patient123', email: 'patient1@test', role: 'patient', name: 'Ramesh Kumar' },
    'drsnehh@test': { password: 'doctor123', email: 'drsnehh@test', role: 'doctor', name: 'Dr. Snehh Kumar' },
    'doctor@swasthsetu.com': { password: 'doctor123', email: 'doctor@swasthsetu.com', role: 'doctor', name: 'Dr. Snehh Kumar' },
    'hospital@swasthsetu.com': { password: 'hospital123', email: 'hospital@swasthsetu.com', role: 'hospital', name: 'Hospital Admin' },
    'pharmacy@swasthsetu.com': { password: 'pharmacy123', email: 'pharmacy@swasthsetu.com', role: 'pharmacy', name: 'Pharmacy Manager' },
    'insurance@swasthsetu.com': { password: 'insurance123', email: 'insurance@swasthsetu.com', role: 'insurance', name: 'Insurance Officer' },
    'admin@swasthsetu.com': { password: 'admin123', email: 'admin@swasthsetu.com', role: 'admin', name: 'System Admin' },
    // Legacy credentials for backward compatibility
    'hospital1@test': { password: 'hospital123', email: 'hospital1@test', role: 'hospital', name: 'Hospital Admin' },
    'pharma1@test': { password: 'pharma123', email: 'pharma1@test', role: 'pharmacy', name: 'Pharmacy Manager' },
    'ins1@test': { password: 'ins123', email: 'ins1@test', role: 'insurance', name: 'Insurance Officer' },
    'admin@test': { password: 'admin123', email: 'admin@test', role: 'admin', name: 'System Admin' },
  };

  // Check if credentials exist and password matches
  const credential = credentials[email.toLowerCase()];
  if (!credential || credential.password !== password) {
    return null;
  }

  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  // If user doesn't exist but credentials are valid, create them
  if (!user) {
    const newUser: User = {
      id: Date.now().toString(),
      role: credential.role,
      name: credential.name,
      phone: '9876543210',
      village: 'Rampur',
      email: credential.email,
      status: 'active'
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    user = newUser;
  }
  
  // Store current user for session persistence
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
};

export const register = (userData: Omit<User, 'id' | 'status'>): void => {
  initializeSampleData();
  const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
  const newUser: User = {
    ...userData,
    id: Date.now().toString(),
    status: 'pending'
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

// Data utilities
export const getAppointments = (): Appointment[] => {
  return JSON.parse(localStorage.getItem('appointments') || '[]');
};

export const addAppointment = (appointment: Omit<Appointment, 'id'>): void => {
  const appointments = getAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: Date.now().toString()
  };
  appointments.push(newAppointment);
  localStorage.setItem('appointments', JSON.stringify(appointments));
};

export const getMedicines = (): Medicine[] => {
  return JSON.parse(localStorage.getItem('medicines') || '[]');
};

export const updateMedicineStock = (medicineId: string, newStock: number): void => {
  const medicines = getMedicines();
  const updatedMedicines = medicines.map(med =>
    med.id === medicineId ? { ...med, stock: newStock } : med
  );
  localStorage.setItem('medicines', JSON.stringify(updatedMedicines));
};

export const getChats = (): Chat[] => {
  return JSON.parse(localStorage.getItem('chats') || '[]');
};

export const addChatMessage = (userId: string, patientName: string, message: ChatMessage): void => {
  const chats = getChats();
  const existingChat = chats.find(c => c.userId === userId);
  
  if (existingChat) {
    existingChat.messages.push(message);
  } else {
    chats.push({
      id: Date.now().toString(),
      userId,
      patientName,
      messages: [message]
    });
  }
  localStorage.setItem('chats', JSON.stringify(chats));
};

export const getInsurances = (): Insurance[] => {
  return JSON.parse(localStorage.getItem('swasthsetu_insurances') || '[]');
};

export const addInsurance = (insurance: Omit<Insurance, 'id' | 'status'>): void => {
  const insurances = getInsurances();
  const newInsurance: Insurance = {
    ...insurance,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  insurances.push(newInsurance);
  localStorage.setItem('swasthsetu_insurances', JSON.stringify(insurances));
};

export const addInsuranceRequest = (data: { 
  userId: string; 
  plan: string; 
  planPrice: number;
  coverage: string;
  familyMembers: any[];
  orderId: string;
  status: string;
  paymentMethod: string;
}): Insurance => {
  const users = getUsers();
  const user = users.find(u => u.id === data.userId);
  
  const insurances = getInsurances();
  const newInsurance: Insurance = {
    id: Date.now().toString(),
    ...data,
    status: data.status as any,
    createdAt: new Date().toISOString(),
    patientName: user?.name || 'Unknown Patient',
    patientEmail: user?.email || ''
  };
  insurances.push(newInsurance);
  localStorage.setItem('swasthsetu_insurances', JSON.stringify(insurances));
  return newInsurance;
};

export const updateInsuranceStatus = (id: string, status: 'active' | 'declined'): Insurance | null => {
  const insurances = getInsurances();
  const index = insurances.findIndex(ins => ins.id === id);
  if (index !== -1) {
    insurances[index].status = status;
    localStorage.setItem('swasthsetu_insurances', JSON.stringify(insurances));
    return insurances[index];
  }
  return null;
};

export const getInsurancesByUserId = (userId: string): Insurance[] => {
  return getInsurances().filter(ins => ins.userId === userId);
};

export const getPendingInsuranceRequests = (): Insurance[] => {
  return getInsurances().filter(ins => ins.status === 'pending');
};

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const getPrescriptions = (): Prescription[] => {
  return JSON.parse(localStorage.getItem('prescriptions') || '[]');
};

export const addPrescription = (prescription: Omit<Prescription, 'id'>): void => {
  const prescriptions = getPrescriptions();
  const newPrescription: Prescription = {
    ...prescription,
    id: Date.now().toString()
  };
  prescriptions.push(newPrescription);
  localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
};

export const getPatientHistory = (): PatientHistory[] => {
  return JSON.parse(localStorage.getItem('patientHistory') || '[]');
};

export const addPatientHistory = (history: Omit<PatientHistory, 'id'>): void => {
  const histories = getPatientHistory();
  const newHistory: PatientHistory = {
    ...history,
    id: Date.now().toString()
  };
  histories.push(newHistory);
  localStorage.setItem('patientHistory', JSON.stringify(histories));
};

export const getMedicineOrders = (): MedicineOrder[] => {
  return JSON.parse(localStorage.getItem('medicineOrders') || '[]');
};

export const addMedicineOrder = (order: Omit<MedicineOrder, 'id' | 'status' | 'orderDate'>): void => {
  const orders = getMedicineOrders();
  const newOrder: MedicineOrder = {
    ...order,
    id: Date.now().toString(),
    status: 'pending',
    orderDate: new Date().toISOString().split('T')[0]
  };
  orders.push(newOrder);
  localStorage.setItem('medicineOrders', JSON.stringify(orders));
};

export const getLabBookings = (): LabBooking[] => {
  return JSON.parse(localStorage.getItem('labBookings') || '[]');
};

export const addLabBooking = (booking: Omit<LabBooking, 'id' | 'status'>): void => {
  const bookings = getLabBookings();
  const newBooking: LabBooking = {
    ...booking,
    id: Date.now().toString(),
    status: 'pending'
  };
  bookings.push(newBooking);
  localStorage.setItem('labBookings', JSON.stringify(bookings));
};

export const getMedicineReservations = (): MedicineReservation[] => {
  return JSON.parse(localStorage.getItem('medicineReservations') || '[]');
};

export const addMedicineReservation = (reservation: Omit<MedicineReservation, 'id' | 'orderDate' | 'status' | 'paymentStatus'>): MedicineReservation => {
  const reservations = getMedicineReservations();
  const newReservation: MedicineReservation = {
    ...reservation,
    id: Date.now().toString(),
    orderDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    paymentStatus: reservation.paymentMethod === 'COD' ? 'pending' : 'completed'
  };
  reservations.push(newReservation);
  localStorage.setItem('medicineReservations', JSON.stringify(reservations));
  return newReservation;
};

export const updateMedicineReservation = (id: string, updates: Partial<MedicineReservation>): MedicineReservation | null => {
  const reservations = getMedicineReservations();
  const index = reservations.findIndex(r => r.id === id);
  if (index !== -1) {
    reservations[index] = { ...reservations[index], ...updates };
    localStorage.setItem('medicineReservations', JSON.stringify(reservations));
    return reservations[index];
  }
  return null;
};

export const updateMedicineOrder = (id: string, updates: Partial<MedicineOrder>): MedicineOrder | null => {
  const orders = getMedicineOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) {
    orders[index] = { ...orders[index], ...updates };
    localStorage.setItem('medicineOrders', JSON.stringify(orders));
    return orders[index];
  }
  return null;
};

// Notification utilities
export const getNotifications = (userId: string): PatientNotification[] => {
  const notifications: PatientNotification[] = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
  return notifications.filter(n => n.userId === userId);
};

export const addNotification = (notification: Omit<PatientNotification, 'id' | 'read' | 'createdAt'>): void => {
  const notifications: PatientNotification[] = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
  const newNotification: PatientNotification = {
    ...notification,
    id: Date.now().toString(),
    read: false,
    createdAt: new Date().toISOString()
  };
  notifications.push(newNotification);
  localStorage.setItem('patientNotifications', JSON.stringify(notifications));
};

export const markNotificationRead = (id: string): void => {
  const notifications: PatientNotification[] = JSON.parse(localStorage.getItem('patientNotifications') || '[]');
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  localStorage.setItem('patientNotifications', JSON.stringify(updated));
};

// Hospital Referral utilities
export const getHospitalReferrals = (): HospitalReferral[] => {
  return JSON.parse(localStorage.getItem('hospitalReferrals') || '[]');
};

export const addHospitalReferral = (referral: Omit<HospitalReferral, 'id' | 'status' | 'createdAt'>): void => {
  const referrals = getHospitalReferrals();
  const newReferral: HospitalReferral = {
    ...referral,
    id: Date.now().toString(),
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  referrals.push(newReferral);
  localStorage.setItem('hospitalReferrals', JSON.stringify(referrals));
};

export const updateHospitalReferral = (id: string, updates: Partial<HospitalReferral>): void => {
  const referrals = getHospitalReferrals();
  const updated = referrals.map(r => r.id === id ? { ...r, ...updates } : r);
  localStorage.setItem('hospitalReferrals', JSON.stringify(updated));
};

// Update appointment with more options
export const updateAppointment = (id: string, updates: Partial<Appointment>): void => {
  const appointments = getAppointments();
  const updated = appointments.map(apt => apt.id === id ? { ...apt, ...updates } : apt);
  localStorage.setItem('appointments', JSON.stringify(updated));
};

// OPD Card/Prescription Image utilities
export const addOPDPrescription = (prescription: Omit<Prescription, 'id'> & { opdImage?: string }): void => {
  const prescriptions = getPrescriptions();
  const newPrescription = {
    ...prescription,
    id: Date.now().toString()
  };
  prescriptions.push(newPrescription);
  localStorage.setItem('prescriptions', JSON.stringify(prescriptions));
};

// Initialize on import
initializeSampleData();
