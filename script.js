// Frozen appointment numbers for each doctor
const FROZEN_NUMBERS = {
    umar: [1, 2, 3, 10, 15, 20],
    samreen: [1, 2, 3, 4, 5, 8, 9, 12, 13, 16, 17, 20, 21, 25, 26, 29, 30, 33, 34, 37, 38]
};

// ========== TODAY'S APPOINTMENTS (Separate from Yesterday) ==========
// Store appointments for each doctor (TODAY ONLY)
let appointments = {
    umar: [],
    samreen: []
};

// Store patient availability status (TODAY ONLY)
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
// Store yesterday's appointments for each doctor (YESTERDAY ONLY)
let yesterdayAppointments = {
    umar: [],
    samreen: []
};

// Store yesterday's patient availability status (YESTERDAY ONLY)
let yesterdayPatientStatus = {
    umar: {},
    samreen: {}
};

// Track which yesterday appointment is being edited (YESTERDAY ONLY)
let editingYesterdayAppointment = {
    umar: null,
    samreen: null
};

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

// Filter Appointments
let originalAppointments = {
    umar: [],
    samreen: []
};

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
        const index = appointments[doctor].findIndex(a => 
            a.appointmentNo === apt.appointmentNo && 
            a.patientName === apt.patientName &&
            a.frozen === apt.frozen
        );
        
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

// Initialize frozen appointments on page load
function initializeFrozenAppointments() {
    // Dr Umar Farooq frozen appointments
    FROZEN_NUMBERS.umar.forEach(num => {
        appointments.umar.push({
            patientName: `Frozen Appointment ${num}`,
            appointmentNo: num,
            frozen: true
        });
        yesterdayAppointments.umar.push({
            patientName: `Frozen Appointment ${num}`,
            appointmentNo: num,
            frozen: true
        });
    });

    // Dr Samreen Malik frozen appointments
    FROZEN_NUMBERS.samreen.forEach(num => {
        appointments.samreen.push({
            patientName: `Frozen Appointment ${num}`,
            appointmentNo: num,
            frozen: true
        });
        yesterdayAppointments.samreen.push({
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
}

// ========== TODAY'S APPOINTMENT FUNCTIONS (Separate from Yesterday) ==========
// Get next available appointment number (TODAY ONLY - uses appointments array)
function getNextAppointmentNumber(doctor) {
    const frozen = FROZEN_NUMBERS[doctor];
    const used = appointments[doctor].map(apt => apt.appointmentNo); // TODAY's appointments only
    
    let num = 1;
    while (true) {
        // Skip if frozen or already used in TODAY's appointments
        if (!frozen.includes(num) && !used.includes(num)) {
            return num;
        }
        num++;
    }
}

// ========== YESTERDAY'S APPOINTMENT FUNCTIONS (Separate from Today) ==========
// Get next available appointment number for yesterday (YESTERDAY ONLY - uses yesterdayAppointments array)
function getNextYesterdayAppointmentNumber(doctor) {
    const frozen = FROZEN_NUMBERS[doctor];
    const used = yesterdayAppointments[doctor].map(apt => apt.appointmentNo); // YESTERDAY's appointments only
    
    let num = 1;
    while (true) {
        // Skip if frozen or already used in YESTERDAY's appointments
        if (!frozen.includes(num) && !used.includes(num)) {
            return num;
        }
        num++;
    }
}

// Add new appointment (TODAY ONLY - separate from yesterday)
function addAppointment(doctor) {
    const patientInput = document.getElementById(`${doctor}-patient`);
    const patientName = patientInput.value.trim();

    // Check if patient name is provided
    if (!patientName) {
        showToast('Please enter patient name', 'warning');
        return;
    }

    // Get next available appointment number
    const appointmentNo = getNextAppointmentNumber(doctor);

    // Add appointment
    appointments[doctor].push({
        patientName: patientName,
        appointmentNo: appointmentNo,
        frozen: false
    });

    // Initialize patient status as not available
    patientStatus[doctor][patientName] = false;

    // Clear input
    patientInput.value = '';

    // Render appointments
    renderAppointments(doctor);
    updateStatistics();
    showToast(`Appointment #${appointmentNo} added for ${patientName}`, 'success');
    
    // Update patient list if modal is open
    if (document.getElementById('patient-list-modal').style.display === 'flex') {
        renderPatientList(doctor);
    }
    
    // Clear search if active
    document.getElementById(`${doctor}-search`).value = '';
}

// Start editing appointment (TODAY ONLY - separate from yesterday)
function startEdit(doctor, index) {
    editingAppointment[doctor] = index;
    renderAppointments(doctor);
}

// Save edited appointment (TODAY ONLY - separate from yesterday)
function saveEdit(doctor, index) {
    const input = document.getElementById(`edit-input-${doctor}-${index}`);
    const newName = input.value.trim();
    const oldName = appointments[doctor][index].patientName;
    
    if (!newName) {
        showToast('Patient name cannot be empty', 'warning');
        return;
    }
    
    // Update patient status if name changed
    if (oldName !== newName) {
        if (patientStatus[doctor][oldName] !== undefined) {
            patientStatus[doctor][newName] = patientStatus[doctor][oldName];
            delete patientStatus[doctor][oldName];
        }
    }
    
    appointments[doctor][index].patientName = newName;
    editingAppointment[doctor] = null;
    renderAppointments(doctor);
    showToast('Patient name updated successfully', 'success');
    
    // Update patient list if modal is open
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
function clearTodayAppointments() {
    // Prompt for password
    const password = prompt('Enter password to clear all today appointments:');
    
    // Check password (you can change this password)
    if (password === 'admin123') {
        // Confirm before clearing
        if (confirm('Are you sure you want to clear all today appointments? This action cannot be undone.')) {
            // Clear appointments but keep frozen ones
            appointments.umar = appointments.umar.filter(apt => apt.frozen);
            appointments.samreen = appointments.samreen.filter(apt => apt.frozen);
            
            // Clear patient status
            patientStatus.umar = {};
            patientStatus.samreen = {};
            
            // Re-render appointments
            renderAppointments('umar');
            renderAppointments('samreen');
            
            // Update patient list if modal is open
            if (document.getElementById('patient-list-modal').style.display === 'flex') {
                renderPatientList('umar');
                renderPatientList('samreen');
            }
            
            showToast('All today appointments have been cleared', 'success');
            updateStatistics();
        }
    } else if (password !== null) {
        // User entered password but it was wrong
        showToast('Incorrect password. Action cancelled', 'error');
    }
    // If password is null, user cancelled the prompt
}

// Delete appointment (TODAY ONLY - separate from yesterday)
function deleteAppointment(doctor, index) {
    const appointment = appointments[doctor][index];
    
    // Prevent deletion of frozen appointments
    if (appointment.frozen) {
        return;
    }

    const patientName = appointments[doctor][index].patientName;
    appointments[doctor].splice(index, 1);
    delete patientStatus[doctor][patientName];
    renderAppointments(doctor);
    updateStatistics();
    showToast(`Appointment for ${patientName} deleted`, 'info');
    
    // Update patient list if modal is open
    if (document.getElementById('patient-list-modal').style.display === 'flex') {
        renderPatientList(doctor);
    }
}

// Render appointments list (TODAY ONLY - separate from yesterday)
function renderAppointments(doctor) {
    const container = document.getElementById(`${doctor}-appointments`);
    const doctorAppointments = appointments[doctor];

    // Filter out frozen appointments for display
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);

    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments yet</div>';
        return;
    }

    // Sort appointments by appointment number
    const sorted = [...visibleAppointments].sort((a, b) => a.appointmentNo - b.appointmentNo);

    container.innerHTML = sorted.map((apt, originalIndex) => {
        // Find original index for deletion
        const index = appointments[doctor].findIndex(a => 
            a.appointmentNo === apt.appointmentNo && 
            a.patientName === apt.patientName &&
            a.frozen === apt.frozen
        );

        const isEditing = editingAppointment[doctor] === index;

        if (isEditing) {
            return `
                <div class="appointment-item ${apt.frozen ? 'frozen' : ''}">
                    <div class="appointment-info">
                        <input 
                            type="text" 
                            id="edit-input-${doctor}-${index}"
                            class="edit-input"
                            value="${apt.patientName}"
                            placeholder="Patient Name"
                        />
                        <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                    </div>
                    <div class="action-buttons">
                        <button 
                            class="save-btn" 
                            onclick="saveEdit('${doctor}', ${index})"
                        >
                            Save
                        </button>
                        <button 
                            class="cancel-btn" 
                            onclick="cancelEdit('${doctor}')"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="appointment-item ${apt.frozen ? 'frozen' : ''}">
                <div class="appointment-info">
                    <div class="patient-name">${apt.patientName}</div>
                    <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                </div>
                <div class="action-buttons">
                    <button 
                        class="edit-btn" 
                        onclick="startEdit('${doctor}', ${index})"
                        ${apt.frozen ? 'disabled' : ''}
                    >
                        Edit
                    </button>
                    <button 
                        class="delete-btn" 
                        onclick="deleteAppointment('${doctor}', ${index})"
                        ${apt.frozen ? 'disabled' : ''}
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Focus on input when editing starts
    if (editingAppointment[doctor] !== null) {
        const editInput = document.getElementById(`edit-input-${doctor}-${editingAppointment[doctor]}`);
        if (editInput) {
            editInput.focus();
            editInput.select();
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializeFrozenAppointments);

// Allow Enter key to add appointment
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('umar-patient').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addAppointment('umar');
        }
    });

    document.getElementById('samreen-patient').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addAppointment('samreen');
        }
    });

    // Allow Enter key to save when editing
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

// Open Yesterday Appointment Modal
function openYesterdayAppointments() {
    document.getElementById('yesterday-appointment-modal').style.display = 'flex';
    document.getElementById('yesterday-dashboard-view').style.display = 'grid';
    document.getElementById('yesterday-patient-list-view').style.display = 'none';
    renderYesterdayAppointments('umar');
    renderYesterdayAppointments('samreen');
    
    // Setup event listeners for yesterday appointment inputs
    const umarInput = document.getElementById('yesterday-umar-patient');
    const samreenInput = document.getElementById('yesterday-samreen-patient');
    
    if (umarInput && !umarInput.hasAttribute('data-listener-added')) {
        umarInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addYesterdayAppointment('umar');
            }
        });
        umarInput.setAttribute('data-listener-added', 'true');
    }
    
    if (samreenInput && !samreenInput.hasAttribute('data-listener-added')) {
        samreenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addYesterdayAppointment('samreen');
            }
        });
        samreenInput.setAttribute('data-listener-added', 'true');
    }
}

// Close Yesterday Appointment Modal
function closeYesterdayAppointments() {
    document.getElementById('yesterday-appointment-modal').style.display = 'none';
}

// Clear yesterday appointments with password protection
function clearYesterdayAppointments() {
    // Prompt for password
    const password = prompt('Enter password to clear all yesterday appointments:');
    
    // Check password (you can change this password)
    if (password === 'admin123') {
        // Confirm before clearing
        if (confirm('Are you sure you want to clear all yesterday appointments? This action cannot be undone.')) {
            // Clear appointments but keep frozen ones
            yesterdayAppointments.umar = yesterdayAppointments.umar.filter(apt => apt.frozen);
            yesterdayAppointments.samreen = yesterdayAppointments.samreen.filter(apt => apt.frozen);
            
            // Clear patient status
            yesterdayPatientStatus.umar = {};
            yesterdayPatientStatus.samreen = {};
            
            // Re-render appointments
            renderYesterdayAppointments('umar');
            renderYesterdayAppointments('samreen');
            
            // Update patient list if view is open
            if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
                renderYesterdayPatientList('umar');
                renderYesterdayPatientList('samreen');
            }
            
            showToast('All yesterday appointments have been cleared', 'success');
        }
    } else if (password !== null) {
        // User entered password but it was wrong
        showToast('Incorrect password. Action cancelled', 'error');
    }
    // If password is null, user cancelled the prompt
}

// Add yesterday appointment (YESTERDAY ONLY - separate from today)
function addYesterdayAppointment(doctor) {
    const patientInput = document.getElementById(`yesterday-${doctor}-patient`);
    const patientName = patientInput.value.trim();

    // Check if patient name is provided
    if (!patientName) {
        showToast('Please enter patient name', 'warning');
        return;
    }

    // Get next available appointment number
    const appointmentNo = getNextYesterdayAppointmentNumber(doctor);

    // Add appointment
    yesterdayAppointments[doctor].push({
        patientName: patientName,
        appointmentNo: appointmentNo,
        frozen: false
    });

    // Initialize patient status as not available
    yesterdayPatientStatus[doctor][patientName] = false;

    // Clear input
    patientInput.value = '';

    // Render appointments
    renderYesterdayAppointments(doctor);
    showToast(`Yesterday Appointment #${appointmentNo} added for ${patientName}`, 'success');
    
    // Update patient list if view is open
    if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
        renderYesterdayPatientList(doctor);
    }
}

// Start editing yesterday appointment (YESTERDAY ONLY - separate from today)
function startEditYesterday(doctor, index) {
    editingYesterdayAppointment[doctor] = index;
    renderYesterdayAppointments(doctor);
}

// Save edited yesterday appointment (YESTERDAY ONLY - separate from today)
function saveEditYesterday(doctor, index) {
    const input = document.getElementById(`yesterday-edit-input-${doctor}-${index}`);
    const newName = input.value.trim();
    const oldName = yesterdayAppointments[doctor][index].patientName;
    
    if (!newName) {
        showToast('Patient name cannot be empty', 'warning');
        return;
    }
    
    // Update patient status if name changed
    if (oldName !== newName) {
        if (yesterdayPatientStatus[doctor][oldName] !== undefined) {
            yesterdayPatientStatus[doctor][newName] = yesterdayPatientStatus[doctor][oldName];
            delete yesterdayPatientStatus[doctor][oldName];
        }
    }
    
    yesterdayAppointments[doctor][index].patientName = newName;
    editingYesterdayAppointment[doctor] = null;
    renderYesterdayAppointments(doctor);
    showToast('Yesterday appointment updated successfully', 'success');
    
    // Update patient list if view is open
    if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
        renderYesterdayPatientList(doctor);
    }
}

// Cancel editing yesterday appointment (YESTERDAY ONLY - separate from today)
function cancelEditYesterday(doctor) {
    editingYesterdayAppointment[doctor] = null;
    renderYesterdayAppointments(doctor);
}

// Delete yesterday appointment (YESTERDAY ONLY - separate from today)
function deleteYesterdayAppointment(doctor, index) {
    const appointment = yesterdayAppointments[doctor][index];
    
    // Prevent deletion of frozen appointments
    if (appointment.frozen) {
        return;
    }

    const patientName = yesterdayAppointments[doctor][index].patientName;
    yesterdayAppointments[doctor].splice(index, 1);
    delete yesterdayPatientStatus[doctor][patientName];
    renderYesterdayAppointments(doctor);
    showToast(`Yesterday appointment for ${patientName} deleted`, 'info');
    
    // Update patient list if view is open
    if (document.getElementById('yesterday-patient-list-view').style.display !== 'none') {
        renderYesterdayPatientList(doctor);
    }
}

// Render yesterday appointments list (YESTERDAY ONLY - separate from today)
function renderYesterdayAppointments(doctor) {
    const container = document.getElementById(`yesterday-${doctor}-appointments`);
    const doctorAppointments = yesterdayAppointments[doctor];

    // Filter out frozen appointments for display
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);

    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments yet</div>';
        return;
    }

    // Sort appointments by appointment number
    const sorted = [...visibleAppointments].sort((a, b) => a.appointmentNo - b.appointmentNo);

    container.innerHTML = sorted.map((apt, originalIndex) => {
        // Find original index for deletion
        const index = yesterdayAppointments[doctor].findIndex(a => 
            a.appointmentNo === apt.appointmentNo && 
            a.patientName === apt.patientName &&
            a.frozen === apt.frozen
        );

        const isEditing = editingYesterdayAppointment[doctor] === index;

        if (isEditing) {
            return `
                <div class="appointment-item ${apt.frozen ? 'frozen' : ''}">
                    <div class="appointment-info">
                        <input 
                            type="text" 
                            id="yesterday-edit-input-${doctor}-${index}"
                            class="edit-input"
                            value="${apt.patientName}"
                            placeholder="Patient Name"
                        />
                        <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                    </div>
                    <div class="action-buttons">
                        <button 
                            class="save-btn" 
                            onclick="saveEditYesterday('${doctor}', ${index})"
                        >
                            Save
                        </button>
                        <button 
                            class="cancel-btn" 
                            onclick="cancelEditYesterday('${doctor}')"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="appointment-item ${apt.frozen ? 'frozen' : ''}">
                <div class="appointment-info">
                    <div class="patient-name">${apt.patientName}</div>
                    <div class="appointment-number">Appointment No: <strong>${apt.appointmentNo}</strong></div>
                </div>
                <div class="action-buttons">
                    <button 
                        class="edit-btn" 
                        onclick="startEditYesterday('${doctor}', ${index})"
                        ${apt.frozen ? 'disabled' : ''}
                    >
                        Edit
                    </button>
                    <button 
                        class="delete-btn" 
                        onclick="deleteYesterdayAppointment('${doctor}', ${index})"
                        ${apt.frozen ? 'disabled' : ''}
                    >
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Focus on input when editing starts
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
        // Show dashboard
        dashboardView.style.display = 'grid';
        patientListView.style.display = 'none';
        toggleBtn.textContent = 'Patient List';
    } else {
        // Show patient list
        dashboardView.style.display = 'none';
        patientListView.style.display = 'grid';
        toggleBtn.textContent = 'Dashboard';
        renderYesterdayPatientList('umar');
        renderYesterdayPatientList('samreen');
    }
}

// Toggle yesterday patient availability status
function toggleYesterdayPatientStatus(doctor, patientName) {
    if (!yesterdayPatientStatus[doctor][patientName]) {
        yesterdayPatientStatus[doctor][patientName] = false;
    }
    yesterdayPatientStatus[doctor][patientName] = !yesterdayPatientStatus[doctor][patientName];
    renderYesterdayPatientList(doctor);
}

// Render yesterday patient list for a doctor
function renderYesterdayPatientList(doctor) {
    const container = document.getElementById(`yesterday-${doctor}-patient-list`);
    const doctorAppointments = yesterdayAppointments[doctor];
    
    // Filter out frozen appointments
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);
    
    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No patients yet</div>';
        return;
    }
    
    // Sort by appointment number
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
                        <input 
                            type="checkbox" 
                            class="status-checkbox"
                            ${isAvailable ? 'checked' : ''}
                            onchange="toggleYesterdayPatientStatus('${doctor}', '${apt.patientName.replace(/'/g, "\\'")}')"
                        />
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

    // Allow Enter key to save when editing yesterday appointment
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
function togglePatientStatus(doctor, patientName) {
    if (!patientStatus[doctor][patientName]) {
        patientStatus[doctor][patientName] = false;
    }
    patientStatus[doctor][patientName] = !patientStatus[doctor][patientName];
    renderPatientList(doctor);
}

// Render patient list for a doctor
function renderPatientList(doctor) {
    const container = document.getElementById(`${doctor}-patient-list`);
    const doctorAppointments = appointments[doctor];
    
    // Filter out frozen appointments
    const visibleAppointments = doctorAppointments.filter(apt => !apt.frozen);
    
    if (visibleAppointments.length === 0) {
        container.innerHTML = '<div class="empty-state">No patients yet</div>';
        return;
    }
    
    // Sort by appointment number
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
                        <input 
                            type="checkbox" 
                            class="status-checkbox"
                            ${isAvailable ? 'checked' : ''}
                            onchange="togglePatientStatus('${doctor}', '${apt.patientName.replace(/'/g, "\\'")}')"
                        />
                        <span>Available</span>
                    </label>
                </div>
            </div>
        `;
    }).join('');
}
