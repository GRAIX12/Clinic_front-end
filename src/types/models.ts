export type Id = string;

export interface Patient {
  _id: Id;
  name: string;
  birthDate: string; // ISO string
  email: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Doctor {
  _id: Id;
  name: string;
  specialty?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Appointment {
  _id: Id;
  patientId: Id | Patient; // backend populates on GET
  doctorId: Id | Doctor;   // backend populates on GET
  startAt: string; // ISO
  endAt: string;   // ISO
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type PatientCreate = Omit<Patient, '_id'|'createdAt'|'updatedAt'>;
export type DoctorCreate = Omit<Doctor, '_id'|'createdAt'|'updatedAt'>;
export type AppointmentCreate = Omit<Appointment, '_id'|'createdAt'|'updatedAt'>;
