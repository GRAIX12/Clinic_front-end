import { api } from './client';
import type { Appointment, AppointmentCreate, Doctor, DoctorCreate, Patient, PatientCreate, Id } from '../types/models';

export const clinicApi = {
  // Patients
  listPatients: async (): Promise<Patient[]> => (await api.get('/patients')).data,
  getPatient: async (id: Id): Promise<Patient> => (await api.get(`/patients/${id}`)).data,
  createPatient: async (payload: PatientCreate): Promise<Patient> => (await api.post('/patients', payload)).data,
  updatePatient: async (id: Id, payload: Partial<PatientCreate>): Promise<Patient> =>
    (await api.put(`/patients/${id}`, payload)).data,
  deletePatient: async (id: Id): Promise<{ message: string }> => (await api.delete(`/patients/${id}`)).data,

  // Doctors
  listDoctors: async (): Promise<Doctor[]> => (await api.get('/doctors')).data,
  getDoctor: async (id: Id): Promise<Doctor> => (await api.get(`/doctors/${id}`)).data,
  createDoctor: async (payload: DoctorCreate): Promise<Doctor> => (await api.post('/doctors', payload)).data,
  updateDoctor: async (id: Id, payload: Partial<DoctorCreate>): Promise<Doctor> =>
    (await api.put(`/doctors/${id}`, payload)).data,
  deleteDoctor: async (id: Id): Promise<{ message: string }> => (await api.delete(`/doctors/${id}`)).data,

  // Appointments (GET returns populated patientId & doctorId objects)
  listAppointments: async (): Promise<Appointment[]> => (await api.get('/appointments')).data,
  getAppointment: async (id: Id): Promise<Appointment> => (await api.get(`/appointments/${id}`)).data,
  createAppointment: async (payload: AppointmentCreate): Promise<Appointment> => (await api.post('/appointments', payload)).data,
  updateAppointment: async (id: Id, payload: Partial<AppointmentCreate>): Promise<Appointment> =>
    (await api.put(`/appointments/${id}`, payload)).data,
  deleteAppointment: async (id: Id): Promise<{ message: string }> => (await api.delete(`/appointments/${id}`)).data
};
