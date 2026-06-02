import { create } from 'zustand';

/**
 * Zustand-based Client Caching Store
 * Caches patients and appointments datasets for up to 5 minutes to optimize API traffic.
 */
export const useCacheStore = create((set, get) => ({
  // Patients cache bucket
  patientsCache: {
    data: null,
    timestamp: 0
  },

  // Doctors cache bucket
  doctorsCache: {
    data: null,
    timestamp: 0
  },

  // Appointments cache bucket
  appointmentsCache: {
    data: null,
    timestamp: 0
  },

  // Setters
  setPatientsCache: (data) => set({
    patientsCache: {
      data,
      timestamp: Date.now()
    }
  }),

  setDoctorsCache: (data) => set({
    doctorsCache: {
      data,
      timestamp: Date.now()
    }
  }),

  setAppointmentsCache: (data) => set({
    appointmentsCache: {
      data,
      timestamp: Date.now()
    }
  }),

  // Validators (Checks if cache is fresh - less than 5 minutes old)
  isPatientsCacheValid: () => {
    const { patientsCache } = get();
    if (!patientsCache.data) return false;
    const elapsed = Date.now() - patientsCache.timestamp;
    return elapsed < 5 * 60 * 1000; // 5 minutes in milliseconds
  },

  isDoctorsCacheValid: () => {
    const { doctorsCache } = get();
    if (!doctorsCache.data) return false;
    const elapsed = Date.now() - doctorsCache.timestamp;
    return elapsed < 5 * 60 * 1000; // 5 minutes in milliseconds
  },

  isAppointmentsCacheValid: () => {
    const { appointmentsCache } = get();
    if (!appointmentsCache.data) return false;
    const elapsed = Date.now() - appointmentsCache.timestamp;
    return elapsed < 5 * 60 * 1000; // 5 minutes
  },

  // Manual cache invalidate triggers
  clearPatientsCache: () => set({
    patientsCache: { data: null, timestamp: 0 }
  }),

  clearDoctorsCache: () => set({
    doctorsCache: { data: null, timestamp: 0 }
  }),

  clearAppointmentsCache: () => set({
    appointmentsCache: { data: null, timestamp: 0 }
  }),

  clearAllCache: () => set({
    patientsCache: { data: null, timestamp: 0 },
    doctorsCache: { data: null, timestamp: 0 },
    appointmentsCache: { data: null, timestamp: 0 }
  })
}));

export default useCacheStore;
