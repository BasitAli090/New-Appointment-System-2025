// Database-integrated version - Works across all devices
// This replaces script.js when using database

// Frozen appointment numbers for each doctor
const FROZEN_NUMBERS = {
    umar: [1, 2, 3, 10, 15, 20],
    samreen: [1, 2, 3, 4, 5, 8, 9, 12, 13, 16, 17, 20, 21, 25, 26, 29, 30, 33, 34, 37, 38]
};

// ========== TODAY'S APPOINTMENTS (Separate from Yesterday) ==========
// Store appointments for each doctor (TODAY ONLY) - Loaded from database
let appointments = {
    umar: [],
    samreen: []
};

// Store patient availability status (TODAY ONLY) - Loaded from database
let patientStatus = {
    umar: {},
    samreen: {}
};

// Track which appointment is being edited (TODAY ONLY)
let editingAppointment = {
    umar: null,
    samreen: null
};

// ========== YESTERDAY'S APPOINTMENTS (Separate from Today) ==========
// Store yesterday's appointments for each doctor (YESTERDAY ONLY) - Loaded from database
let yesterdayAppointments = {
    umar: [],
    samreen: []
};

// Store yesterday's patient availability status (YESTERDAY ONLY) - Loaded from database
let yesterdayPatientStatus = {
    umar: {},
    samreen: {}
};

// Track which yesterday appointment is being edited (YESTERDAY ONLY)
let editingYesterdayAppointment = {
    umar: null,
    samreen: null
};

// Helper function to convert database format to app format
function dbToApp(dbItem) {
    // API already returns camelCase, but handle both formats
    return {
        id: dbItem.id,
        patientName: dbItem.patientName || dbItem.patient_name,
        appointmentNo: dbItem.appointmentNo || dbItem.appointment_no,
        frozen: dbItem.frozen
    };
}

// Helper function to convert app format to database format
function appToDb(appItem) {
    return {
        patient_name: appItem.patientName,
        appointment_no: appItem.appointmentNo,
        frozen: appItem.frozen || false
    };
}

// Toast Notification System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideIn 0.3s ease-out reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Update Statistics
function updateStatistics() {
    const umarCount = appointments.umar.filter(apt => !apt.frozen).length;
    const samreenCount = appointments.samreen.filter(apt => !apt.frozen).length;
    const totalCount = umarCount + samreenCount;
    
    document.getElementById('umar-count').textContent = umarCount;
    document.getElementById('samreen-count').textContent = samreenCount;
    document.getElementById('total-count').textContent = totalCount;
}

// Load appointments from database
async function loadAppointments(type = 'today') {
    try {
        // Check API availability first
        await checkApiAvailability();
        
        if (API_AVAILABLE) {
            const doctors = ['umar', 'samreen'];
            
            for (const doctor of doctors) {
                const data = await api.getAppointments(doctor, type);
                const target = type === 'yesterday' ? yesterdayAppointments : appointments;
                target[doctor] = data.map(dbToApp);
            }
        } else {
            // Initialize frozen appointments if API not available
            const target = type === 'yesterday' ? yesterdayAppointments : appointments;
            FROZEN_NUMBERS.umar.forEach(num => {
                if (!target.umar.find(a => a.appointmentNo === num)) {
                    target.umar.push({
                        id: `frozen-${num}`,
                        patientName: `Frozen Appointment ${num}`,
                        appointmentNo: num,
                        frozen: true
                    });
                }
            });
            FROZEN_NUMBERS.samreen.forEach(num => {
                if (!target.samreen.find(a => a.appointmentNo === num)) {
                    target.samreen.push({
                        id: `frozen-${num}`,
                        patientName: `Frozen Appointment ${num}`,
                        appointmentNo: num,
                        frozen: true
                    });
                }
            });
        }
        
        // Render appointments
        renderAppointments('umar');
        renderAppointments('samreen');
        if (type === 'yesterday') {
            renderYesterdayAppointments('umar');
            renderYesterdayAppointments('samreen');
        }
        updateStatistics();
    } catch (error) {
        console.error('Error loading appointments:', error);
        // Initialize frozen appointments as fallback
        const target = type === 'yesterday' ? yesterdayAppointments : appointments;
        FROZEN_NUMBERS.umar.forEach(num => {
            target.umar.push({
                id: `frozen-${num}`,
                patientName: `Frozen Appointment ${num}`,
                appointmentNo: num,
                frozen: true
            });
        });
        FROZEN_NUMBERS.samreen.forEach(num => {
            target.samreen.push({
                id: `frozen-${num}`,
                patientName: `Frozen Appointment ${num}`,
                appointmentNo: num,
                frozen: true
            });
        });
        renderAppointments('umar');
        renderAppointments('samreen');
        updateStatistics();
    }
}

// Load patient status from database
async function loadPatientStatus(type = 'today') {
    try {
        const doctors = ['umar', 'samreen'];
        
        for (const doctor of doctors) {
            const data = await api.getPatientStatus(doctor, type);
            const target = type === 'yesterday' ? yesterdayPatientStatus : patientStatus;
            target[doctor] = {};
            
            data.forEach(item => {
                const patientName = item.patientName || item.patient_name;
                const isAvailable = item.isAvailable !== undefined ? item.isAvailable : item.is_available;
                target[doctor][patientName] = isAvailable;
            });
        }
    } catch (error) {
        console.error('Error loading patient status:', error);
    }
}

// Initialize and load data from database
async function initializeApp() {
    try {
        // Check API availability
        await checkApiAvailability();
        
        if (API_AVAILABLE) {
            // Load today's appointments and status
            await loadAppointments('today');
            await loadPatientStatus('today');
            
            // Load yesterday's appointments and status
            await loadAppointments('yesterday');
            await loadPatientStatus('yesterday');
            
            showToast('App loaded successfully (Online)', 'success');
        } else {
            // Initialize frozen appointments for offline mode
            FROZEN_NUMBERS.umar.forEach(num => {
                appointments.umar.push({
                    id: `frozen-${num}`,
                    patientName: `Frozen Appointment ${num}`,
                    appointmentNo: num,
                    frozen: true
                });
                yesterdayAppointments.umar.push({
                    id: `frozen-${num}`,
                    patientName: `Frozen Appointment ${num}`,
                    appointmentNo: num,
                    frozen: true
                });
            });
            FROZEN_NUMBERS.samreen.forEach(num => {
                appointments.samreen.push({
                    id: `frozen-${num}`,
                    patientName: `Frozen Appointment ${num}`,
                    appointmentNo: num,
                    frozen: true
                });
                yesterdayAppointments.samreen.push({
                    id: `frozen-${num}`,
                    patientName: `Frozen Appointment ${num}`,
                    appointmentNo: num,
                    frozen: true
                });
            });
            
            renderAppointments('umar');
            renderAppointments('samreen');
            renderYesterdayAppointments('umar');
            renderYesterdayAppointments('samreen');
            updateStatistics();
            showToast('App loaded (Offline Mode - Database not configured)', 'info');
        }
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Error loading app data', 'error');
    }
}

// Filter Appointments
function filterAppointments(doctor, searchTerm) {
    const container = document.getElementById(`${doctor}-appointments`);
    const searchLower = searchTerm.toLowerCase().trim();
    
    if (!searchLower) {
        renderAppointments(doctor);
        return;
    }
    
    const doctorAppointments = appointments[doctor];
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);
    const filtered = visibleAppointments.filter(apt => 
        apt.patientName.toLowerCase().includes(searchLower) ||
        apt.appointmentNo.toString().includes(searchLower)
    );
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments found</div>';
        return;
    }
    
    const sorted = [...filtered].sort((a, b) => a.appointmentNo - b.appointmentNo);
    
    container.innerHTML = sorted.map((apt) => {
        const index = appointments[doctor].findIndex(a => a.id === apt.id);
        
        return `
            <div class="appointment-item">
                <div class="appointment-info">
                    <div class="patient-name">${apt.patientName}</div>
                    <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                </div>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="startEdit('${doctor}', ${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteAppointment('${doctor}', ${index})">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter Patient List
function filterPatientList(searchTerm) {
    const searchLower = searchTerm.toLowerCase().trim();
    const doctors = ['umar', 'samreen'];
    
    doctors.forEach(doctor => {
        const container = document.getElementById(`${doctor}-patient-list`);
        const doctorAppointments = appointments[doctor];
        const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);
        
        if (!searchLower) {
            renderPatientList(doctor);
            return;
        }
        
        const filtered = visibleAppointments.filter(apt => 
            apt.patientName.toLowerCase().includes(searchLower) ||
            apt.appointmentNo.toString().includes(searchLower)
        );
        
        if (filtered.length === 0) {
            container.innerHTML = '<div class="empty-state">No patients found</div>';
            return;
        }
        
        const sorted = [...filtered].sort((a, b) => a.appointmentNo - b.appointmentNo);
        
        container.innerHTML = sorted.map(apt => {
            const isAvailable = patientStatus[doctor][apt.patientName] || false;
            return `
                <div class="patient-list-item">
                    <div class="patient-info">
                        <div class="patient-name">${apt.patientName}</div>
                        <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                    </div>
                    <div class="status-box">
                        <label class="status-label">
                            <input type="checkbox" class="status-checkbox" ${isAvailable ? 'checked' : ''}
                                onchange="togglePatientStatus('${doctor}', '${apt.patientName.replace(/'/g, "\\'")}')" />
                            <span>Available</span>
                        </label>
                    </div>
                </div>
            `;
        }).join('');
    });
}

// ========== TODAY'S APPOINTMENT FUNCTIONS (Separate from Yesterday) ==========
// Get next available appointment number (TODAY ONLY)
function getNextAppointmentNumber(doctor) {
    const frozen = FROZEN_NUMBERS[doctor];
    const used = appointments[doctor].map(apt => apt.appointmentNo);
    
    let num = 1;
    while (true) {
        if (!frozen.includes(num) && !used.includes(num)) {
            return num;
        }
        num++;
    }
}

// Add new appointment (TODAY ONLY - separate from yesterday)
async function addAppointment(doctor) {
    const patientInput = document.getElementById(`${doctor}-patient`);
    const patientName = patientInput.value.trim();

    if (!patientName) {
        showToast('Please enter patient name', 'warning');
        return;
    }

    const appointmentNo = getNextAppointmentNumber(doctor);
    
    // Try API first, fallback to local storage
    try {
        if (API_AVAILABLE) {
            const result = await api.addAppointment(doctor, patientName, appointmentNo, false, 'today');
            
            if (result) {
                // Add to local array (API returns camelCase)
                appointments[doctor].push({
                    id: result.id,
                    patientName: result.patientName,
                    appointmentNo: result.appointmentNo,
                    frozen: result.frozen
                });
                
                // Initialize patient status
                patientStatus[doctor][patientName] = false;
                
                patientInput.value = '';
                renderAppointments(doctor);
                updateStatistics();
                showToast(`Appointment #${appointmentNo} added for ${patientName}`, 'success');
                
                if (document.getElementById('patient-list-modal').style.display === 'flex') {
                    renderPatientList(doctor);
                }
                
                document.getElementById(`${doctor}-search`).value = '';
                return;
            }
        }
    } catch (error) {
        console.error('API error, using local storage:', error);
        // Fall through to local storage
    }
    
    // Fallback to local storage (works offline)
    try {
        // Add to local array
        appointments[doctor].push({
            id: Date.now(), // Temporary ID
            patientName: patientName,
            appointmentNo: appointmentNo,
            frozen: false
        });
        
        // Initialize patient status
        patientStatus[doctor][patientName] = false;
        
        patientInput.value = '';
        renderAppointments(doctor);
        updateStatistics();
        showToast(`Appointment #${appointmentNo} added for ${patientName} (Local)`, 'success');
        
        if (document.getElementById('patient-list-modal').style.display === 'flex') {
            renderPatientList(doctor);
        }
        
        document.getElementById(`${doctor}-search`).value = '';
    } catch (error) {
        console.error('Error adding appointment:', error);
        showToast('Failed to add appointment: ' + error.message, 'error');
    }
}

// Start editing appointment (TODAY ONLY - separate from yesterday)
function startEdit(doctor, index) {
    editingAppointment[doctor] = index;
    renderAppointments(doctor);
}

// Save edited appointment (TODAY ONLY - separate from yesterday)
async function saveEdit(doctor, index) {
    const input = document.getElementById(`edit-input-${doctor}-${index}`);
    const newName = input.value.trim();
    const appointment = appointments[doctor][index];
    
    if (!newName) {
        showToast('Patient name cannot be empty', 'warning');
        return;
    }
    
    const oldName = appointment.patientName;
    
    // Try API first
    try {
        if (API_AVAILABLE && appointment.id && !appointment.id.toString().startsWith('frozen-') && !appointment.id.toString().startsWith('temp-')) {
            const result = await api.updateAppointment(appointment.id, newName, 'today');
            
            if (result) {
                appointment.patientName = newName;
                editingAppointment[doctor] = null;
                renderAppointments(doctor);
                showToast('Patient name updated successfully', 'success');
                
                if (document.getElementById('patient-list-modal').style.display === 'flex') {
                    renderPatientList(doctor);
                }
                return;
            }
        }
    } catch (error) {
        console.error('API error, using local storage:', error);
    }
    
    // Fallback to local storage
    appointment.patientName = newName;
    
    // Update patient status if name changed
    if (oldName !== newName) {
        if (patientStatus[doctor][oldName] !== undefined) {
            patientStatus[doctor][newName] = patientStatus[doctor][oldName];
            delete patientStatus[doctor][oldName];
        }
    }
    
    editingAppointment[doctor] = null;
    renderAppointments(doctor);
    showToast('Patient name updated successfully (Local)', 'success');
    
    if (document.getElementById('patient-list-modal').style.display === 'flex') {
        renderPatientList(doctor);
    }
}

// Cancel editing (TODAY ONLY - separate from yesterday)
function cancelEdit(doctor) {
    editingAppointment[doctor] = null;
    renderAppointments(doctor);
}

// Clear today appointments with password protection
async function clearTodayAppointments() {
    const password = prompt('Enter password to clear all today appointments:');
    
    if (password === 'admin123') {
        if (confirm('Are you sure you want to clear all today appointments? This action cannot be undone.')) {
            try {
                // Get all non-frozen appointments
                const allAppointments = [
                    ...appointments.umar.filter(apt => !apt.frozen),
                    ...appointments.samreen.filter(apt => !apt.frozen)
                ];
                
                // Delete each appointment
                for (const apt of allAppointments) {
                    await api.deleteAppointment(apt.id, 'today');
                }
                
                // Clear local arrays
                appointments.umar = appointments.umar.filter(apt => apt.frozen);
                appointments.samreen = appointments.samreen.filter(apt => apt.frozen);
                patientStatus.umar = {};
                patientStatus.samreen = {};
                
                renderAppointments('umar');
                renderAppointments('samreen');
                updateStatistics();
                showToast('All today appointments have been cleared', 'success');
                
                if (document.getElementById('patient-list-modal').style.display === 'flex') {
                    renderPatientList('umar');
                    renderPatientList('samreen');
                }
            } catch (error) {
                console.error('Error clearing appointments:', error);
                showToast('Failed to clear appointments', 'error');
            }
        }
    } else if (password !== null) {
        showToast('Incorrect password. Action cancelled', 'error');
    }
}

// Delete appointment (TODAY ONLY - separate from yesterday)
async function deleteAppointment(doctor, index) {
    const appointment = appointments[doctor][index];
    
    if (appointment.frozen) {
        return;
    }

    const patientName = appointment.patientName;
    
    // Try API first
    try {
        if (API_AVAILABLE && appointment.id && !appointment.id.toString().startsWith('frozen-') && !appointment.id.toString().startsWith('temp-')) {
            const success = await api.deleteAppointment(appointment.id, 'today');
            
            if (success) {
                appointments[doctor].splice(index, 1);
                delete patientStatus[doctor][patientName];
                renderAppointments(doctor);
                updateStatistics();
                showToast(`Appointment for ${patientName} deleted`, 'info');
                
                if (document.getElementById('patient-list-modal').style.display === 'flex') {
                    renderPatientList(doctor);
                }
                return;
            }
        }
    } catch (error) {
        console.error('API error, using local storage:', error);
    }
    
    // Fallback to local storage
    appointments[doctor].splice(index, 1);
    delete patientStatus[doctor][patientName];
    renderAppointments(doctor);
    updateStatistics();
    showToast(`Appointment for ${patientName} deleted (Local)`, 'info');
    
    if (document.getElementById('patient-list-modal').style.display === 'flex') {
        renderPatientList(doctor);
    }
}

// Render appointments list (TODAY ONLY - separate from yesterday)
function renderAppointments(doctor) {
    const container = document.getElementById(`${doctor}-appointments`);
    const doctorAppointments = appointments[doctor];
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);

    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments yet</div>';
        return;
    }

    const sorted = [...visibleAppointments].sort((a, b) => a.appointmentNo - b.appointmentNo);

    container.innerHTML = sorted.map((apt) => {
        const index = appointments[doctor].findIndex(a => a.id === apt.id);
        const isEditing = editingAppointment[doctor] === index;

        if (isEditing) {
            return `
                <div class="appointment-item">
                    <div class="appointment-info">
                        <input type="text" id="edit-input-${doctor}-${index}" class="edit-input"
                            value="${apt.patientName}" placeholder="Patient Name" />
                        <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                    </div>
                    <div class="action-buttons">
                        <button class="save-btn" onclick="saveEdit('${doctor}', ${index})">Save</button>
                        <button class="cancel-btn" onclick="cancelEdit('${doctor}')">Cancel</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="appointment-item">
                <div class="appointment-info">
                    <div class="patient-name">${apt.patientName}</div>
                    <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                </div>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="startEdit('${doctor}', ${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteAppointment('${doctor}', ${index})">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    if (editingAppointment[doctor] !== null) {
        const editInput = document.getElementById(`edit-input-${doctor}-${editingAppointment[doctor]}`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    
    // Enter key handlers
    document.getElementById('umar-patient').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addAppointment('umar');
    });

    document.getElementById('samreen-patient').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addAppointment('samreen');
    });

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
            const inputId = e.target.id;
            const parts = inputId.split('-');
            const doctor = parts[2];
            const index = parseInt(parts[3]);
            saveEdit(doctor, index);
        }
    });
});

// ========== YESTERDAY'S APPOINTMENT FUNCTIONS ==========
// Get next available appointment number for yesterday
function getNextYesterdayAppointmentNumber(doctor) {
    const frozen = FROZEN_NUMBERS[doctor];
    const used = yesterdayAppointments[doctor].map(apt => apt.appointmentNo);
    
    let num = 1;
    while (true) {
        if (!frozen.includes(num) && !used.includes(num)) {
            return num;
        }
        num++;
    }
}

// Open Yesterday Appointment Modal
function openYesterdayAppointments() {
    document.getElementById('yesterday-appointment-modal').style.display = 'flex';
    document.getElementById('yesterday-dashboard-view').style.display = 'grid';
    document.getElementById('yesterday-patient-list-view').style.display = 'none';
    renderYesterdayAppointments('umar');
    renderYesterdayAppointments('samreen');
    
    const umarInput = document.getElementById('yesterday-umar-patient');
    const samreenInput = document.getElementById('yesterday-samreen-patient');
    
    if (umarInput && !umarInput.hasAttribute('data-listener-added')) {
        umarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addYesterdayAppointment('umar');
        });
        umarInput.setAttribute('data-listener-added', 'true');
    }
    
    if (samreenInput && !samreenInput.hasAttribute('data-listener-added')) {
        samreenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addYesterdayAppointment('samreen');
        });
        samreenInput.setAttribute('data-listener-added', 'true');
    }
}

// Close Yesterday Appointment Modal
function closeYesterdayAppointments() {
    document.getElementById('yesterday-appointment-modal').style.display = 'none';
}

// Clear yesterday appointments with password protection
async function clearYesterdayAppointments() {
    const password = prompt('Enter password to clear all yesterday appointments:');
    
    if (password === 'admin123') {
        if (confirm('Are you sure you want to clear all yesterday appointments? This action cannot be undone.')) {
            try {
                const allAppointments = [
                    ...yesterdayAppointments.umar.filter(apt => !apt.frozen),
                    ...yesterdayAppointments.samreen.filter(apt => !apt.frozen)
                ];
                
                for (const apt of allAppointments) {
                    await api.deleteAppointment(apt.id, 'yesterday');
                }
                
                yesterdayAppointments.umar = yesterdayAppointments.umar.filter(apt => apt.frozen);
                yesterdayAppointments.samreen = yesterdayAppointments.samreen.filter(apt => apt.frozen);
                yesterdayPatientStatus.umar = {};
                yesterdayPatientStatus.samreen = {};
                
                renderYesterdayAppointments('umar');
                renderYesterdayAppointments('samreen');
                showToast('All yesterday appointments have been cleared', 'success');
                
                if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
                    renderYesterdayPatientList('umar');
                    renderYesterdayPatientList('samreen');
                }
            } catch (error) {
                console.error('Error clearing yesterday appointments:', error);
                showToast('Failed to clear appointments', 'error');
            }
        }
    } else if (password !== null) {
        showToast('Incorrect password. Action cancelled', 'error');
    }
}

// Add yesterday appointment
async function addYesterdayAppointment(doctor) {
    const patientInput = document.getElementById(`yesterday-${doctor}-patient`);
    const patientName = patientInput.value.trim();

    if (!patientName) {
        showToast('Please enter patient name', 'warning');
        return;
    }

    const appointmentNo = getNextYesterdayAppointmentNumber(doctor);
    
    // Try API first
    try {
        if (API_AVAILABLE) {
            const result = await api.addAppointment(doctor, patientName, appointmentNo, false, 'yesterday');
            
            if (result) {
                yesterdayAppointments[doctor].push({
                    id: result.id,
                    patientName: result.patientName,
                    appointmentNo: result.appointmentNo,
                    frozen: result.frozen
                });
                
                yesterdayPatientStatus[doctor][patientName] = false;
                patientInput.value = '';
                renderYesterdayAppointments(doctor);
                showToast(`Yesterday Appointment #${appointmentNo} added for ${patientName}`, 'success');
                
                if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
                    renderYesterdayPatientList(doctor);
                }
                return;
            }
        }
    } catch (error) {
        console.error('API error, using local storage:', error);
    }
    
    // Fallback to local storage
    yesterdayAppointments[doctor].push({
        id: Date.now(),
        patientName: patientName,
        appointmentNo: appointmentNo,
        frozen: false
    });
    
    yesterdayPatientStatus[doctor][patientName] = false;
    patientInput.value = '';
    renderYesterdayAppointments(doctor);
    showToast(`Yesterday Appointment #${appointmentNo} added for ${patientName} (Local)`, 'success');
    
    if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
        renderYesterdayPatientList(doctor);
    }
}

// Start editing yesterday appointment
function startEditYesterday(doctor, index) {
    editingYesterdayAppointment[doctor] = index;
    renderYesterdayAppointments(doctor);
}

// Save edited yesterday appointment
async function saveEditYesterday(doctor, index) {
    const input = document.getElementById(`yesterday-edit-input-${doctor}-${index}`);
    const newName = input.value.trim();
    const appointment = yesterdayAppointments[doctor][index];
    
    if (!newName) {
        showToast('Patient name cannot be empty', 'warning');
        return;
    }
    
    try {
        const result = await api.updateAppointment(appointment.id, newName, 'yesterday');
        
        if (result) {
            const oldName = appointment.patientName;
            appointment.patientName = newName;
            
            if (oldName !== newName) {
                if (yesterdayPatientStatus[doctor][oldName] !== undefined) {
                    yesterdayPatientStatus[doctor][newName] = yesterdayPatientStatus[doctor][oldName];
                    delete yesterdayPatientStatus[doctor][oldName];
                }
            }
            
            editingYesterdayAppointment[doctor] = null;
            renderYesterdayAppointments(doctor);
            showToast('Yesterday appointment updated successfully', 'success');
            
            if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
                renderYesterdayPatientList(doctor);
            }
        }
    } catch (error) {
        console.error('Error updating yesterday appointment:', error);
        showToast('Failed to update appointment', 'error');
    }
}

// Cancel editing yesterday appointment
function cancelEditYesterday(doctor) {
    editingYesterdayAppointment[doctor] = null;
    renderYesterdayAppointments(doctor);
}

// Delete yesterday appointment
async function deleteYesterdayAppointment(doctor, index) {
    const appointment = yesterdayAppointments[doctor][index];
    
    if (appointment.frozen) {
        return;
    }

    try {
        const success = await api.deleteAppointment(appointment.id, 'yesterday');
        
        if (success) {
            const patientName = appointment.patientName;
            yesterdayAppointments[doctor].splice(index, 1);
            delete yesterdayPatientStatus[doctor][patientName];
            renderYesterdayAppointments(doctor);
            showToast(`Yesterday appointment for ${patientName} deleted`, 'info');
            
            if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
                renderYesterdayPatientList(doctor);
            }
        }
    } catch (error) {
        console.error('Error deleting yesterday appointment:', error);
        showToast('Failed to delete appointment', 'error');
    }
}

// Render yesterday appointments list
function renderYesterdayAppointments(doctor) {
    const container = document.getElementById(`yesterday-${doctor}-appointments`);
    const doctorAppointments = yesterdayAppointments[doctor];
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);

    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments yet</div>';
        return;
    }

    const sorted = [...visibleAppointments].sort((a, b) => a.appointmentNo - b.appointmentNo);

    container.innerHTML = sorted.map((apt) => {
        const index = yesterdayAppointments[doctor].findIndex(a => a.id === apt.id);
        const isEditing = editingYesterdayAppointment[doctor] === index;

        if (isEditing) {
            return `
                <div class="appointment-item">
                    <div class="appointment-info">
                        <input type="text" id="yesterday-edit-input-${doctor}-${index}" class="edit-input"
                            value="${apt.patientName}" placeholder="Patient Name" />
                        <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                    </div>
                    <div class="action-buttons">
                        <button class="save-btn" onclick="saveEditYesterday('${doctor}', ${index})">Save</button>
                        <button class="cancel-btn" onclick="cancelEditYesterday('${doctor}')">Cancel</button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="appointment-item">
                <div class="appointment-info">
                    <div class="patient-name">${apt.patientName}</div>
                    <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                </div>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="startEditYesterday('${doctor}', ${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteYesterdayAppointment('${doctor}', ${index})">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    if (editingYesterdayAppointment[doctor] !== null) {
        const editInput = document.getElementById(`yesterday-edit-input-${doctor}-${editingYesterdayAppointment[doctor]}`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
}

// Toggle between dashboard and patient list view
function toggleYesterdayView() {
    const dashboardView = document.getElementById('yesterday-dashboard-view');
    const patientListView = document.getElementById('yesterday-patient-list-view');
    const toggleBtn = document.getElementById('yesterday-patient-list-toggle');
    
    if (dashboardView.style.display === 'none') {
        dashboardView.style.display = 'grid';
        patientListView.style.display = 'none';
        toggleBtn.textContent = 'Patient List';
    } else {
        dashboardView.style.display = 'none';
        patientListView.style.display = 'grid';
        toggleBtn.textContent = 'Dashboard';
        renderYesterdayPatientList('umar');
        renderYesterdayPatientList('samreen');
    }
}

// Toggle yesterday patient availability status
async function toggleYesterdayPatientStatus(doctor, patientName) {
    const currentStatus = yesterdayPatientStatus[doctor][patientName] || false;
    const newStatus = !currentStatus;
    
    // Try API first
    try {
        if (API_AVAILABLE) {
            await api.updatePatientStatus(doctor, patientName, newStatus, 'yesterday');
        }
    } catch (error) {
        console.error('API error, using local storage:', error);
    }
    
    // Update local (works with or without API)
    yesterdayPatientStatus[doctor][patientName] = newStatus;
    renderYesterdayPatientList(doctor);
}

// Render yesterday patient list for a doctor
function renderYesterdayPatientList(doctor) {
    const container = document.getElementById(`yesterday-${doctor}-patient-list`);
    const doctorAppointments = yesterdayAppointments[doctor];
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);
    
    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No patients yet</div>';
        return;
    }
    
    const sorted = [...visibleAppointments].sort((a, b) => a.appointmentNo - b.appointmentNo);
    
    container.innerHTML = sorted.map(apt => {
        const isAvailable = yesterdayPatientStatus[doctor][apt.patientName] || false;
        return `
            <div class="patient-list-item">
                <div class="patient-info">
                    <div class="patient-name">${apt.patientName}</div>
                    <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                </div>
                <div class="status-box">
                    <label class="status-label">
                        <input type="checkbox" class="status-checkbox" ${isAvailable ? 'checked' : ''}
                            onchange="toggleYesterdayPatientStatus('${doctor}', '${apt.patientName.replace(/'/g, "\\'")}')" />
                        <span>Available</span>
                    </label>
                </div>
            </div>
        `;
    }).join('');
}

// Open Patient List Modal
function openPatientList() {
    document.getElementById('patient-list-modal').style.display = 'flex';
    renderPatientList('umar');
    renderPatientList('samreen');
}

// Close Patient List Modal
function closePatientList() {
    document.getElementById('patient-list-modal').style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', () => {
    const patientListModal = document.getElementById('patient-list-modal');
    if (patientListModal) {
        patientListModal.addEventListener('click', (e) => {
            if (e.target === patientListModal) {
                closePatientList();
            }
        });
    }

    const yesterdayModal = document.getElementById('yesterday-appointment-modal');
    if (yesterdayModal) {
        yesterdayModal.addEventListener('click', (e) => {
            if (e.target === yesterdayModal) {
                closeYesterdayAppointments();
            }
        });
    }

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && e.target.id && e.target.id.startsWith('yesterday-edit-input-')) {
            const inputId = e.target.id;
            const parts = inputId.split('-');
            const doctor = parts[3];
            const index = parseInt(parts[4]);
            saveEditYesterday(doctor, index);
        }
    });
});

// Toggle patient availability status
async function togglePatientStatus(doctor, patientName) {
    const currentStatus = patientStatus[doctor][patientName] || false;
    const newStatus = !currentStatus;
    
    // Try API first
    try {
        if (API_AVAILABLE) {
            await api.updatePatientStatus(doctor, patientName, newStatus, 'today');
        }
    } catch (error) {
        console.error('API error, using local storage:', error);
    }
    
    // Update local (works with or without API)
    patientStatus[doctor][patientName] = newStatus;
    renderPatientList(doctor);
}

// Render patient list for a doctor
function renderPatientList(doctor) {
    const container = document.getElementById(`${doctor}-patient-list`);
    const doctorAppointments = appointments[doctor];
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);
    
    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No patients yet</div>';
        return;
    }
    
    const sorted = [...visibleAppointments].sort((a, b) => a.appointmentNo - b.appointmentNo);
    
    container.innerHTML = sorted.map(apt => {
        const isAvailable = patientStatus[doctor][apt.patientName] || false;
        return `
            <div class="patient-list-item">
                <div class="patient-info">
                    <div class="patient-name">${apt.patientName}</div>
                    <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                </div>
                <div class="status-box">
                    <label class="status-label">
                        <input type="checkbox" class="status-checkbox" ${isAvailable ? 'checked' : ''}
                            onchange="togglePatientStatus('${doctor}', '${apt.patientName.replace(/'/g, "\\'")}')" />
                        <span>Available</span>
                    </label>
                </div>
            </div>
        `;
    }).join('');
}

