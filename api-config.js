// API Configuration
// Update this URL after deploying to Vercel
const API_BASE_URL = window.location.origin + '/api';

// Check if API is available
let API_AVAILABLE = false;

async function checkApiAvailability() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE_URL}/appointments?type=today&doctor=umar`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    API_AVAILABLE = response.ok;
    return API_AVAILABLE;
  } catch (error) {
    API_AVAILABLE = false;
    console.log('API not available, using local storage');
    return false;
  }
}

// API Helper Functions with fallback
const api = {
  // Appointments
  async getAppointments(doctor = null, type = 'today') {
    if (!API_AVAILABLE) return [];
    
    try {
      const url = `${API_BASE_URL}/appointments?type=${type}${doctor ? `&doctor=${doctor}` : ''}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('API getAppointments error:', error);
      API_AVAILABLE = false;
      return [];
    }
  },

  async addAppointment(doctor, patientName, appointmentNo, frozen = false, type = 'today') {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor, patientName, appointmentNo, frozen, type }),
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 5000);
          return controller.signal;
        })()
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add appointment');
      }
      
      return result.data;
    } catch (error) {
      console.error('API addAppointment error:', error);
      throw error;
    }
  },

  async updateAppointment(id, patientName, type = 'today') {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, patientName, type }),
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 5000);
          return controller.signal;
        })()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('API updateAppointment error:', error);
      throw error;
    }
  },

  async deleteAppointment(id, type = 'today') {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/appointments?id=${id}&type=${type}`, {
        method: 'DELETE',
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 5000);
          return controller.signal;
        })()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('API deleteAppointment error:', error);
      throw error;
    }
  },

  // Patient Status
  async getPatientStatus(doctor = null, type = 'today') {
    if (!API_AVAILABLE) return [];
    
    try {
      const url = `${API_BASE_URL}/patient-status?type=${type}${doctor ? `&doctor=${doctor}` : ''}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('API getPatientStatus error:', error);
      return [];
    }
  },

  async updatePatientStatus(doctor, patientName, isAvailable, type = 'today') {
    if (!API_AVAILABLE) {
      throw new Error('API not available');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/patient-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor, patientName, isAvailable, type }),
        signal: (() => {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 5000);
          return controller.signal;
        })()
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('API updatePatientStatus error:', error);
      throw error;
    }
  }
};

// Initialize API availability check
checkApiAvailability();

