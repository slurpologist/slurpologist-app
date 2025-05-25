
    // Global variables
    let currentUser = null;
    let editingTargetId = null;
    let editingUserId = null;
    let outputChart, lossesChart, trendChart;
    let pricePerKg = 8000;

    // DOM Elements
    const loginPage = document.getElementById('loginPage');
    const appContainer = document.getElementById('appContainer');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    const logoutLink = document.getElementById('logoutLink');
    const adminPanelLink = document.getElementById('adminPanelLink');
    const dashboardLink = document.getElementById('dashboardLink');
    const inputDataLink = document.getElementById('inputDataLink');
    const adminPanelLinkNav = document.getElementById('adminPanelLink');
    const dashboardPage = document.getElementById('dashboardPage');
    const inputDataPage = document.getElementById('inputDataPage');
    const adminPanelPage = document.getElementById('adminPanelPage');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.querySelector('.sidebar');
    const currentDateTime = document.getElementById('currentDateTime');
    const targetDate = document.getElementById('targetDate');
    const inputDataForm = document.getElementById('inputDataForm');
    const inputError = document.getElementById('inputError');
    const inputSuccess = document.getElementById('inputSuccess');
    const submitDataBtn = document.getElementById('submitDataBtn');
    const recentDataTable = document.getElementById('recentDataTable');
    const targetsTable = document.getElementById('targetsTable');
    const usersTable = document.getElementById('usersTable');
    const targetForm = document.getElementById('targetForm');
    const userForm = document.getElementById('userForm');
    const setTargetBtn = document.getElementById('setTargetBtn');
    const updateTargetBtn = document.getElementById('updateTargetBtn');
    const cancelTargetBtn = document.getElementById('cancelTargetBtn');
    const addUserBtn = document.getElementById('addUserBtn');
    const updateUserBtn = document.getElementById('updateUserBtn');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const kpiCards = document.getElementById('kpiCards');
    const dateRange = document.getElementById('dateRange');
    const selectedDate = document.getElementById('selectedDate');
    const shiftFilter = document.getElementById('shiftFilter');
    const pricePerKgInput = document.getElementById('pricePerKg');
    const savePriceBtn = document.getElementById('savePriceBtn');

    const variantInput = document.getElementById('variantName');
    const addVariantBtn = document.getElementById('addVariantBtn');
    const targetVariantSelect = document.getElementById('targetVariant');
    const variantSelect = document.getElementById('variantSelect');

    // Initialize date picker with today's date
    const today = new Date().toISOString().split('T')[0];
    selectedDate.value = today;
    document.getElementById('targetDate').value = today;
    document.getElementById('exportStartDate').value = today;
    document.getElementById('exportEndDate').value = today;

    // Update current date time display
    // function updateCurrentDateTime() {
    //     const now = new Date();
    //     currentDateTime.value = now.toLocaleString();
    // }
    // function updateTargetDate() {
    //     const now = new Date();
    //     targetDate.value = now.toLocaleString();
    // }

    // function setShiftByCurrentTime() {
    //     const now = new Date();
    //     const hour = now.getHours();
    //     let shift = 'A';
    //     if (hour >= 6 && hour < 14) {
    //         shift = 'A';
    //     } else if (hour >= 14 && hour < 22) {
    //         shift = 'B';
    //     } else {
    //         shift = 'C';
    //     }
    //     const shiftSelect = document.getElementById('shiftSelect');
    //     if (shiftSelect) {
    //         shiftSelect.value = shift;
    //         fillVariantSelects();
    //     }
    //     const targetShift = document.getElementById('targetShift');
    //     if (targetShift) {
    //         targetShift.value = shift;
    //     }
    // }

    // Initialize the app
    function initApp() {
        // updateCurrentDateTime();
        // updateTargetDate()
        // setShiftByCurrentTime(); 
        // setInterval(() => {
        //     updateCurrentDateTime();
        //     // updateTargetDate()
        //     // setShiftByCurrentTime();
        // }, 1000);

        // Check auth state
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                loginPage.classList.add('hidden');
                appContainer.classList.remove('hidden');
                
                // Reset nav visibility
                dashboardLink.classList.remove('hidden');
                inputDataLink.classList.remove('hidden');
                adminPanelLink.classList.remove('hidden');

                // Check user role
                db.collection('users').doc(user.uid).get().then(doc => {
                    if (doc.exists) {
                        const role = doc.data().role;
                        if (role === 'viewer') {
                            // Hanya dashboard & logout
                            dashboardLink.classList.remove('hidden');
                            inputDataLink.classList.add('hidden');
                            adminPanelLink.classList.add('hidden');
                        } else if (role === 'operator') {
                            // Dashboard, input data & logout
                            dashboardLink.classList.remove('hidden');
                            inputDataLink.classList.remove('hidden');
                            adminPanelLink.classList.add('hidden');
                        } else if (role === 'admin') {
                            // Semua akses
                            dashboardLink.classList.remove('hidden');
                            inputDataLink.classList.remove('hidden');
                            adminPanelLink.classList.remove('hidden');
                            loadPriceConfig();
                        }
                    }
                });

                loadDashboardData();
                loadRecentData();
                loadTargets();
                loadUsers();
            } else {
                currentUser = null;
                loginPage.classList.remove('hidden');
                appContainer.classList.add('hidden');
            }
        });
    }

    // Load price configuration
    function loadPriceConfig() {
        db.collection('config').doc('pricePerKg').get().then(doc => {
            if (doc.exists) {
                pricePerKg = doc.data().value;
                pricePerKgInput.value = pricePerKg;
            }
        });
    }

    let recentProductionData = [];
    function loadRecentDataAdmin() {
        recentDataTable.innerHTML = '<tr><td colspan="5" class="text-center py-4">Loading data...</td></tr>';

        db.collection('production')
            .orderBy('date', 'desc')
            .limit(100)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    recentDataTable.innerHTML = '<tr><td colspan="5" class="text-center py-4">No production data found</td></tr>';
                    recentProductionData = [];
                    return;
                }

                recentProductionData = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    recentProductionData.push({
                        id: doc.id,
                        ...data,
                        date: data.date.toDate()
                    });
                });

                renderRecentDataTable(recentProductionData);
            })
            .catch(error => {
                console.error("Error loading recent data:", error);
                recentDataTable.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading data</td></tr>';
            });
    }

    function renderRecentDataTable(data) {
        recentDataTable.innerHTML = '';
        if (data.length === 0) {
            recentDataTable.innerHTML = '<tr><td colspan="5" class="text-center py-4">No production data found</td></tr>';
            return;
        }
        data.forEach(item => {
            const operatorName = item.operatorName || 'Unknown';
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">${formatDate(item.date)}</td>
                <td class="px-6 py-4 whitespace-nowrap">Shift ${item.shift}</td>
                <td class="px-6 py-4 whitespace-nowrap">${item.variant || '-'}</td> <!-- Tambahkan ini -->
                <td class="px-6 py-4 whitespace-nowrap">${item.weight.toLocaleString()} kg</td>
                <td class="px-6 py-4 whitespace-nowrap">${operatorName}</td>
                <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button class="edit-production text-blue-600 hover:text-blue-800 mr-2" data-id="${item.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-production text-red-600 hover:text-red-800" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            recentDataTable.appendChild(row);
        });

        // Event listeners for edit/delete
        document.querySelectorAll('.edit-production').forEach(button => {
            button.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                editProductionData(id);
            });
        });
        document.querySelectorAll('.delete-production').forEach(button => {
            button.addEventListener('click', e => {
                const id = e.currentTarget.getAttribute('data-id');
                deleteProductionData(id);
            });
        });
    }

    async function showCurrentTargetInfo() {
        const dateStr = document.getElementById('currentDateTime').value || today;
        const infoDiv = document.getElementById('currentTargetInfo');
        infoDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="inline-block loading-spinner"></div>
                <span>Loading target...</span>
            </div>
        `;
        infoDiv.classList.remove('hidden');

        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

        try {
            const snapshot = await db.collection('targets')
                .where('date', '>=', firebase.firestore.Timestamp.fromDate(date))
                .where('date', '<=', firebase.firestore.Timestamp.fromDate(endOfDay))
                .get();

            if (snapshot.empty) {
                infoDiv.innerHTML = '<span class="text-red-600">Belum ada target untuk hari ini.</span>';
                return;
            }

            let html = `
            <div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shift</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variant</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target (kg)</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
            `;
            snapshot.forEach(doc => {
                const data = doc.data();
                const tgl = data.date && data.date.toDate ? data.date.toDate() : date;
                html += `
                    <tr>
                        <td class="px-6 py-4 whitespace-nowrap">${tgl.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                        <td class="px-6 py-4 whitespace-nowrap">Shift ${data.shift}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${data.variant}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${data.targetKg.toLocaleString()} kg</td>
                    </tr>
                `;
            });
            html += `
                        </tbody>
                    </table>
                </div>
            </div>
            `;
            infoDiv.innerHTML = html;
        } catch (err) {
            infoDiv.innerHTML = '<span class="text-red-600">Gagal mengambil target.</span>';
        }
    }

    function fillVariantSelects() {
        const shift = document.getElementById('shiftSelect').value;
        const dateStr = document.getElementById('currentDateTime').value || today;
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);

        variantSelect.innerHTML = `<option value="">Loading...</option>`;
        variantSelect.classList.add('input-highlight');

        db.collection('targets')
        .where('date', '>=', firebase.firestore.Timestamp.fromDate(date))
        .where('date', '<=', firebase.firestore.Timestamp.fromDate(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)))
        .get()
        .then(snapshot => {
            const variants = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (!variants.includes(data.variant)) {
                    variants.push(data.variant);
                }
            });
          
            if (variants.length > 0) {
                variantSelect.innerHTML = variants.map(v => `<option value="${v}">${v}</option>`).join('');
                variantSelect.classList.remove('input-highlight');
            } else {
                variantSelect.innerHTML = `<option value="">No variant available for today</option>`;
                variantSelect.classList.remove('input-highlight');
            }
        })
        .catch(err => {
            console.error('Error fetching target variant:', err);
            variantSelect.innerHTML = `<option value="">Error loading variant</option>`;
            variantSelect.classList.remove('input-highlight');
        });
    }

    // only load variants for target select in admin panel
    function loadVariantConfig() {
        if (targetVariantSelect) targetVariantSelect.innerHTML = '';

        db.collection('config').doc('variant').get().then(doc => {
            if (doc.exists && Array.isArray(doc.data().variants)) {
                doc.data().variants.forEach(variant => {
                    if (targetVariantSelect) {
                        const option = document.createElement('option');
                        option.value = variant;
                        option.textContent = variant;
                        targetVariantSelect.appendChild(option);
                    }
                });
            }
        }).catch(err => {
            console.error('Error loading variants:', err);
        });
    }

    function setActiveNav(linkId) {
    // All link elements
        [dashboardLink, inputDataLink, adminPanelLink].forEach(link => {
            link.classList.remove('bg-gradient-to-r', 'from-gray-800', 'to-green-300');
        });
        // Active link
        document.getElementById(linkId).classList.add('bg-gradient-to-r', 'from-gray-800', 'to-green-300');
    }

    // after login, load dashboard data
    if (addVariantBtn && variantInput) {
        addVariantBtn.addEventListener('click', () => {
            const newVariant = variantInput.value.trim();
            if (!newVariant) {
                alert('Please enter a valid variant name');
                return;
            }
            db.collection('config').doc('variant').get().then(doc => {
                let variants = [];
                if (doc.exists && Array.isArray(doc.data().variants)) {
                    variants = doc.data().variants;
                }
                if (!variants.includes(newVariant)) {
                    variants.push(newVariant);
                }
                return db.collection('config').doc('variant').set(
                    { variants: variants },
                    { merge: true }
                );
            }).then(() => {
                variantInput.value = '';
                alert('Variant added successfully!');
                fillVariantSelects();
                loadVariantConfig();
            }).catch(error => {
                alert('Error adding variant: ' + error.message);
            });
        });
    }

    // Save price configuration
    savePriceBtn.addEventListener('click', () => {
        const newPrice = parseFloat(pricePerKgInput.value);
        if (!isNaN(newPrice) && newPrice >= 0) {
            pricePerKg = newPrice;
            db.collection('config').doc('pricePerKg').set({
                value: pricePerKg
            }).then(() => {
                alert('Price per kg saved successfully!');
                loadDashboardData();
            }).catch(error => {
                alert('Error saving price: ' + error.message);
            });
        } else {
            alert('Please enter a valid price');
        }
    });

    // Event Listeners
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        loginBtn.innerHTML = '<div class="inline-block loading-spinner"></div> Signing in...';
        loginBtn.disabled = true;
        
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                loginError.classList.add('hidden');
                loginBtn.innerHTML = 'Sign in';
                loginBtn.disabled = false;
            })
            .catch(error => {
                loginError.textContent = error.message;
                loginError.classList.remove('hidden');
                loginBtn.innerHTML = 'Sign in';
                loginBtn.disabled = false;
            });
    });

    logoutLink.addEventListener('click', e => {
        e.preventDefault();
        auth.signOut().then(() => {
            // Reset forms and clear data
            loginForm.reset();
            inputDataForm.reset();
            targetForm.reset();
            userForm.reset();
            
            // Hide admin panel link
            adminPanelLink.classList.add('hidden');
            
            // Reset editing states
            editingTargetId = null;
            editingUserId = null;
            
            // Destroy charts if they exist
            if (outputChart) outputChart.destroy();
            if (lossesChart) lossesChart.destroy();
            if (trendChart) trendChart.destroy();
        });
    });

    // Navigation
    dashboardLink.addEventListener('click', e => {
        e.preventDefault();
        dashboardPage.classList.remove('hidden');
        inputDataPage.classList.add('hidden');
        adminPanelPage.classList.add('hidden');
        loadDashboardData();
        setActiveNav('dashboardLink');
    });

    inputDataLink.addEventListener('click', e => {
        e.preventDefault();
        dashboardPage.classList.add('hidden');
        inputDataPage.classList.remove('hidden');
        adminPanelPage.classList.add('hidden');
        setActiveNav('inputDataLink');
        fillVariantSelects();
        showCurrentTargetInfo();
    });

    adminPanelLink.addEventListener('click', e => {
        e.preventDefault();
        dashboardPage.classList.add('hidden');
        inputDataPage.classList.add('hidden');
        adminPanelPage.classList.remove('hidden');
        loadVariantConfig();
        fillVariantSelects();
        loadRecentDataAdmin();
        loadTargets();
        setActiveNav('adminPanelLink');
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Input Data Form
    inputDataForm.addEventListener('submit', async e => {
        e.preventDefault();

        const shift = document.getElementById('shiftSelect').value;
        const variant = document.getElementById('variantSelect').value;
        const weight = parseFloat(document.getElementById('inputWeight').value);
        const dateStr = document.getElementById('currentDateTime').value || today;

        if (!weight || isNaN(weight)) {
            inputError.textContent = 'Please enter a valid weight';
            inputError.classList.remove('hidden');
            return;
        }

        // check if date is valid 
        const inputDate = new Date(dateStr);
        inputDate.setHours(0, 0, 0, 0);
        const endOfDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 23, 59, 59, 999);

        try {
            const inputDate = new Date(dateStr);
            inputDate.setHours(0, 0, 0, 0);
            const endOfDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate(), 23, 59, 59, 999);

            try {
                let targetSnapshot = await db.collection('targets')
                    .where('date', '>=', firebase.firestore.Timestamp.fromDate(inputDate))
                    .where('date', '<=', firebase.firestore.Timestamp.fromDate(endOfDay))
                    .where('variant', '==', variant)
                    .limit(1)
                    .get();

                if (targetSnapshot.empty) {
                    inputError.textContent = 'Target belum di-set untuk tanggal, shift, dan variant ini. Silakan hubungi admin.';
                    inputError.classList.remove('hidden');
                    return;
                }
                inputError.classList.add('hidden');
                inputSuccess.classList.add('hidden');
            } catch (err) {
                inputError.textContent = 'Gagal cek target: ' + err.message;
                inputError.classList.remove('hidden');
                return;
            }
            inputError.classList.add('hidden');
            inputSuccess.classList.add('hidden');
        } catch (err) {
            inputError.textContent = 'Gagal cek target: ' + err.message;
            inputError.classList.remove('hidden');
            return;
        }

        submitDataBtn.innerHTML = '<div class="inline-block loading-spinner"></div> Submitting...';
        submitDataBtn.disabled = true;

        const productionData = {
            date: firebase.firestore.Timestamp.fromDate(new Date(dateStr)),
            shift: shift,
            variant: variant,
            weight: weight,
            operatorId: currentUser.uid,
            operatorName: currentUser.displayName || currentUser.email.split('@')[0]
        };

        db.collection('production').add(productionData)
            .then(() => {
                inputError.classList.add('hidden');
                inputSuccess.classList.remove('hidden');
                inputDataForm.reset();
                submitDataBtn.innerHTML = 'Submit Data';
                submitDataBtn.disabled = false;

                // Reload recent data
                loadRecentData();
                loadDashboardData();

                // Hide success message after 3 seconds
                setTimeout(() => {
                    inputSuccess.classList.add('hidden');
                }, 3000);
            })
            .catch(error => {
                inputError.textContent = error.message;
                inputError.classList.remove('hidden');
                submitDataBtn.innerHTML = 'Submit Data';
                submitDataBtn.disabled = false;
            });
    });

    // Target Form
    targetForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const date = document.getElementById('targetDate').value;
        const shift = document.getElementById('targetShift').value;
        const variant = document.getElementById('targetVariant').value;
        const targetKg = parseFloat(document.getElementById('targetKg').value);
        
        if (!date || !shift || !variant || !targetKg || isNaN(targetKg)) {
            alert('Please fill all fields with valid values');
            return;
        }
        
        setTargetBtn.innerHTML = '<div class="inline-block loading-spinner"></div> Saving...';
        setTargetBtn.disabled = true;
        
        const targetData = {
            date: firebase.firestore.Timestamp.fromDate(new Date(date)),
            shift: shift,
            variant: variant,
            targetKg: targetKg
        };
        
        if (editingTargetId) {
            // Update existing target
            db.collection('targets').doc(editingTargetId).update(targetData)
                .then(() => {
                    resetTargetForm();
                    loadTargets();
                    setTargetBtn.innerHTML = 'Set Target';
                    setTargetBtn.disabled = false;
                })
                .catch(error => {
                    alert(error.message);
                    setTargetBtn.innerHTML = 'Set Target';
                    setTargetBtn.disabled = false;
                });
        } else {
            // Add new target
            db.collection('targets').add(targetData)
                .then(() => {
                    resetTargetForm();
                    loadTargets();
                    setTargetBtn.innerHTML = 'Set Target';
                    setTargetBtn.disabled = false;
                })
                .catch(error => {
                    alert(error.message);
                    setTargetBtn.innerHTML = 'Set Target';
                    setTargetBtn.disabled = false;
                });
        }
    });

    // User Form
    userForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const name = document.getElementById('userName').value;
        const email = document.getElementById('userEmail').value;
        const password = document.getElementById('userPassword').value;
        const role = document.getElementById('userRole').value;
        
        if (!name || !email || !role || (!editingUserId && !password)) {
            alert('Please fill all required fields');
            return;
        }
        
        addUserBtn.innerHTML = '<div class="inline-block loading-spinner"></div> Saving...';
        addUserBtn.disabled = true;
        
        const userData = {
            name: name,
            email: email,
            role: role
        };
        
        if (editingUserId) {
            // Update existing user
            if (password) {
                // Update password if provided
                auth.currentUser.updatePassword(password)
                    .then(() => {
                        return db.collection('users').doc(editingUserId).update(userData);
                    })
                    .then(() => {
                        resetUserForm();
                        loadUsers();
                        addUserBtn.innerHTML = 'Add User';
                        addUserBtn.disabled = false;
                    })
                    .catch(error => {
                        alert(error.message);
                        addUserBtn.innerHTML = 'Add User';
                        addUserBtn.disabled = false;
                    });
            } else {
                // Just update user data without changing password
                db.collection('users').doc(editingUserId).update(userData)
                    .then(() => {
                        resetUserForm();
                        loadUsers();
                        addUserBtn.innerHTML = 'Add User';
                        addUserBtn.disabled = false;
                    })
                    .catch(error => {
                        alert(error.message);
                        addUserBtn.innerHTML = 'Add User';
                        addUserBtn.disabled = false;
                    });
            }
        } else {
            // Create new user
            auth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    return db.collection('users').doc(userCredential.user.uid).set({
                        name: name,
                        email: email,
                        role: role
                    });
                })
                .then(() => {
                    resetUserForm();
                    loadUsers();
                    addUserBtn.innerHTML = 'Add User';
                    addUserBtn.disabled = false;
                })
                .catch(error => {
                    alert(error.message);
                    addUserBtn.innerHTML = 'Add User';
                    addUserBtn.disabled = false;
                });
        }
    });

    // Cancel Target Edit
    cancelTargetBtn.addEventListener('click', () => {
        resetTargetForm();
    });

    // Cancel User Edit
    cancelUserBtn.addEventListener('click', () => {
        resetUserForm();
    });

    // Date range filter change
    dateRange.addEventListener('change', loadDashboardData);
    selectedDate.addEventListener('change', loadDashboardData);
    shiftFilter.addEventListener('change', loadDashboardData);

    // Helper Functions
    function resetTargetForm() {
        targetForm.reset();
        document.getElementById('targetDate').value = today;
        editingTargetId = null;
        setTargetBtn.classList.remove('hidden');
        updateTargetBtn.classList.add('hidden');
        cancelTargetBtn.classList.add('hidden');
    }

    function resetUserForm() {
        userForm.reset();
        editingUserId = null;
        addUserBtn.classList.remove('hidden');
        updateUserBtn.classList.add('hidden');
        cancelUserBtn.classList.add('hidden');
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function formatDateOnly(date) {
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    }

    let productionUnsub = null;
    let targetsUnsub = null;

    // Data Loading Functions
    function loadDashboardData() {
        const range = dateRange.value;
        const date = new Date(selectedDate.value);
        const shift = shiftFilter.value;

        // Show loading state
        kpiCards.innerHTML = `
            <div class="col-span-4 text-center py-10">
                <div class="inline-block loading-spinner"></div>
                <span class="ml-2">Loading data...</span>
            </div>
        `;

        // Calculate date range based on selection
        let startDate, endDate;

        if (range === 'daily') {
            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
        } else if (range === 'weekly') {
            startDate = new Date(date);
            startDate.setDate(date.getDate() - date.getDay());
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        } else { // monthly
            startDate = new Date(date.getFullYear(), date.getMonth(), 1);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        // Unsubscribe previous listeners if any
        if (productionUnsub) productionUnsub();
        if (targetsUnsub) targetsUnsub();

        // Query production data
        let productionQuery = db.collection('production')
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('date', '<=', firebase.firestore.Timestamp.fromDate(endDate));
        if (shift !== 'all') {
            productionQuery = productionQuery.where('shift', '==', shift);
        }

        // Query targets data
        let targetsQuery = db.collection('targets')
            .where('date', '>=', firebase.firestore.Timestamp.fromDate(startDate))
            .where('date', '<=', firebase.firestore.Timestamp.fromDate(endDate));
        if (shift !== 'all') {
            targetsQuery = targetsQuery.where('shift', '==', shift);
        }

        // Listen for realtime updates
        productionUnsub = productionQuery.onSnapshot(productionSnapshot => {
            targetsUnsub = targetsQuery.onSnapshot(targetsSnapshot => {
                // Process production data
                const productionData = [];
                let totalOutput = 0;

                productionSnapshot.forEach(doc => {
                    const data = doc.data();
                    productionData.push({
                        id: doc.id,
                        ...data,
                        date: data.date.toDate()
                    });
                    totalOutput += data.weight || 0;
                });

                // Process targets data
                const targetsData = [];
                let totalTarget = 0;

                targetsSnapshot.forEach(doc => {
                    const data = doc.data();
                    targetsData.push({
                        id: doc.id,
                        ...data,
                        date: data.date.toDate()
                    });
                    totalTarget += data.targetKg || 0;
                });

                // ...rest of KPI and chart update code...
                const totalLosses = totalTarget > 0 ? totalTarget - totalOutput : 0;
                const lossesPercentage = totalTarget > 0 ? (totalLosses / totalTarget * 100) : 0;
                const efficiency = totalTarget > 0 ? (totalOutput / totalTarget * 100) : 0;
                const lossesInRupiah = totalLosses * pricePerKg;

                kpiCards.innerHTML = `
                    <!-- Target Mixing -->
                    <div class="bg-gray-800 p-4 rounded-lg shadow">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-100">Target Mixing</p>
                                <h3 class="text-2xl font-bold text-gray-100">${totalTarget.toLocaleString()} kg</h3>
                            </div>
                            <div class="bg-gray-800 p-2 rounded-full">
                                <i class="fas fa-bullseye text-blue-500"></i>
                            </div>
                        </div>
                        <div class="mt-2">
                            <div class="h-2 bg-gray-200 rounded-full">
                                <div class="h-2 bg-blue-500 rounded-full" style="width: ${efficiency}%"></div>
                            </div>
                        </div>
                    </div>
                    <!-- Total Output -->
                    <div class="bg-gray-800 p-4 rounded-lg shadow">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-100">Total Output</p>
                                <h3 class="text-2xl font-bold text-gray-100">${totalOutput.toLocaleString()} kg</h3>
                            </div>
                            <div class="bg-gray-800 p-2 rounded-full">
                                <i class="fas fa-boxes text-green-500"></i>
                            </div>
                        </div>
                        <div class="mt-2 text-sm text-gray-100">
                            <span class="text-green-500">${efficiency.toFixed(1)}%</span> efficiency
                        </div>
                    </div>
                    <!-- Total Losses -->
                    <div class="bg-gray-800 p-4 rounded-lg shadow">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-100">Total Losses</p>
                                <h3 class="text-2xl font-bold text-gray-100">${totalLosses.toLocaleString()} kg <span class="text-sm">(${lossesPercentage.toFixed(1)}%)</span></h3>
                            </div>
                            <div class="bg-gray-800 p-2 rounded-full">
                                <i class="fas fa-exclamation-triangle text-red-500"></i>
                            </div>
                        </div>
                        <div class="mt-2 text-sm text-gray-100">
                            <span class="text-red-500">${lossesPercentage.toFixed(1)}%</span> of target
                        </div>
                    </div>
                    <!-- Losses in Rupiah & Efficiency -->
                    <div class="bg-gray-800 p-4 rounded-lg shadow">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-gray-100">Losses (Rupiah)</p>
                                <h3 class="text-xl font-bold text-red-300">Rp ${lossesInRupiah.toLocaleString()}</h3>
                                <p class="text-sm text-gray-400 mt-2">Efficiency: <span class="text-green-400">${efficiency.toFixed(1)}%</span></p>
                            </div>
                            <div class="bg-gray-800 p-2 rounded-full">
                                <i class="fas fa-coins text-yellow-400"></i>
                            </div>
                        </div>
                    </div>
                `;

                createCharts(productionData, targetsData, range);

                document.getElementById('trendOutput').textContent =
                    `Showing ${range} data from ${formatDateOnly(startDate)} to ${formatDateOnly(endDate)}`;
            });
        }, error => {
            kpiCards.innerHTML = `
                <div class="col-span-4 text-center py-10 text-red-500">
                    Error loading data. Please try again.
                </div>
            `;
        });
    }
    function createCharts(productionData, targetsData, range) {
        // Group data by date for the trend chart
        const groupedData = {};
        
        productionData.forEach(item => {
            const dateKey = item.date.toDateString();
            if (!groupedData[dateKey]) {
                groupedData[dateKey] = {
                    date: item.date,
                    output: 0,
                    target: 0
                };
            }
            groupedData[dateKey].output += item.weight;
        });
        
        targetsData.forEach(item => {
            const dateKey = item.date.toDateString();
            if (!groupedData[dateKey]) {
                groupedData[dateKey] = {
                    date: item.date,
                    output: 0,
                    target: 0
                };
            }
            groupedData[dateKey].target += item.targetKg;
        });
        
        // Convert to array and sort by date
        const sortedData = Object.values(groupedData).sort((a, b) => a.date - b.date);
        
        // Prepare chart data
        const labels = sortedData.map(item => formatDateOnly(item.date));
        const outputData = sortedData.map(item => item.output);
        const targetData = sortedData.map(item => item.target);
        
        // Output vs Target Chart - grouped by shift
        const outputCtx = document.getElementById('outputChart').getContext('2d');
        
        if (outputChart) outputChart.destroy();
        
        // Group data by shift for comparison
        const shiftData = {
            A: { output: 0, target: 0 },
            B: { output: 0, target: 0 },
            C: { output: 0, target: 0 }
        };
        
        productionData.forEach(item => {
            shiftData[item.shift].output += item.weight || 0;
        });
        
        targetsData.forEach(item => {
            shiftData[item.shift].target += item.targetKg || 0;
        });
        
        outputChart = new Chart(outputCtx, {
            type: 'bar',
            data: {
                labels: ['Shift A', 'Shift B', 'Shift C'],
                datasets: [
                    {
                        label: 'Output',
                        data: [shiftData.A.output, shiftData.B.output, shiftData.C.output],
                        backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(54, 162, 235, 0.7)'],
                        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 1)'],
                        borderWidth: 1
                    },
                    {
                        label: 'Target',
                        data: [shiftData.A.target, shiftData.B.target, shiftData.C.target],
                        type: 'line',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                }
            }
        });
        
        // Losses Percentage Chart - donut chart
        const totalLosses = sortedData.reduce((sum, item) => {
            return sum + (item.target > 0 ? item.target - item.output : 0);
        }, 0);
        
        const totalTarget = sortedData.reduce((sum, item) => sum + item.target, 0);
        const totalOutput = sortedData.reduce((sum, item) => sum + item.output, 0);
        
        const lossesCtx = document.getElementById('lossesChart').getContext('2d');
        
        if (lossesChart) lossesChart.destroy();
        
        lossesChart = new Chart(lossesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Losses', 'Output'],
                datasets: [{
                    data: [totalLosses, totalOutput],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = Math.round((value / (totalLosses + totalOutput)) * 100);
                                return `${label}: ${value.toLocaleString()} kg (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Daily Trend Chart
        const trendCtx = document.getElementById('trendChart').getContext('2d');
        
        if (trendChart) trendChart.destroy();
        
        trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Output',
                        data: outputData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.1)',
                        borderWidth: 2,
                        fill: true
                    },
                    {
                        label: 'Target',
                        data: targetData,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        backgroundColor: 'rgba(255, 99, 132, 0.1)',
                        borderWidth: 2,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Weight (kg)'
                        }
                    }
                }
            }
        });
    }

    function loadRecentData() {
        // load recent production data
        recentDataTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="inline-block loading-spinner"></div>
                    <span class="ml-2">Loading data...</span>
                </td>
            </tr>
        `;

        db.collection('production')
            .orderBy('date', 'desc')
            .limit(10)
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    recentDataTable.innerHTML = '<tr><td colspan="4" class="text-center py-4">No production data found</td></tr>';
                    return;
                }

                recentDataTable.innerHTML = '';

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.date.toDate();
                    const operatorName = data.operatorName || 'Unknown';

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">${formatDate(date)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">Shift ${data.shift}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${data.weight.toLocaleString()} kg</td>
                        <td class="px-6 py-4 whitespace-nowrap">${operatorName}</td>
                    `;
                    recentDataTable.appendChild(row);
                });
            })
            .catch(error => {
                recentDataTable.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading data</td></tr>';
            });
    }

    function loadTargets() {
        // load targets data
        targetsTable.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-4">
                    <div class="inline-block loading-spinner"></div>
                    <span class="ml-2">Loading targets...</span>
                </td>
            </tr>
        `;

        db.collection('targets')
            .orderBy('date', 'desc')
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    targetsTable.innerHTML = '<tr><td colspan="5" class="text-center py-4">No targets found</td></tr>';
                    return;
                }

                targetsTable.innerHTML = '';

                snapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.date.toDate();

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">${formatDateOnly(date)}</td>
                        <td class="px-6 py-4 whitespace-nowrap">Shift ${data.shift}</td>
                        <td class="px-6 py-4 whitespace-nowrap">Variant ${data.variant}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${data.targetKg.toLocaleString()} kg</td>
                        <td class="px-6 py-4 whitespace-nowrap flex gap-2">
                            ${data.status === 'done' 
                                ? `<span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Selesai</span>`
                                : `<button class="done-target text-green-600 hover:text-green-800 mr-2" data-id="${doc.id}">
                                    <i class="fas fa-check"></i> Selesai
                                </button>`
                            }
                            <button class="delete-target text-red-600 hover:text-red-800" data-id="${doc.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    targetsTable.appendChild(row);
                });
                
                // Add event listeners to done buttons
                document.querySelectorAll('.done-target').forEach(button => {
                    button.addEventListener('click', e => {
                        const targetId = e.currentTarget.getAttribute('data-id');
                        db.collection('targets').doc(targetId).update({ status: 'done' })
                            .then(() => loadTargets());
                    });
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-target').forEach(button => {
                    button.addEventListener('click', e => {
                        const targetId = e.currentTarget.getAttribute('data-id');
                        deleteTarget(targetId);
                    });
                });
            })
            .catch(error => {
            targetsTable.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-red-500">Error loading targets</td></tr>';
            });
    }

    function loadUsers() {
        usersTable.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="inline-block loading-spinner"></div>
                    <span class="ml-2">Loading users...</span>
                </td>
            </tr>
        `;
        
        db.collection('users')
            .get()
            .then(snapshot => {
                if (snapshot.empty) {
                    usersTable.innerHTML = '<tr><td colspan="4" class="text-center py-4">No users found</td></tr>';
                    return;
                }
                
                usersTable.innerHTML = '';
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="px-6 py-4 whitespace-nowrap">${data.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap">${data.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap capitalize">${data.role}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <button class="edit-user text-blue-600 hover:text-blue-800 mr-2" data-id="${doc.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-user text-red-600 hover:text-red-800" data-id="${doc.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    usersTable.appendChild(row);
                });
                
                // Add event listeners to edit buttons
                document.querySelectorAll('.edit-user').forEach(button => {
                    button.addEventListener('click', e => {
                        const userId = e.currentTarget.getAttribute('data-id');
                        editUser(userId);
                    });
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-user').forEach(button => {
                    button.addEventListener('click', e => {
                        const userId = e.currentTarget.getAttribute('data-id');
                        deleteUser(userId);
                    });
                });
            })
            .catch(error => {
            usersTable.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-red-500">Error loading users</td></tr>';
            });
    }

    function editTarget(targetId) {
        db.collection('targets').doc(targetId).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const date = data.date.toDate();
                    
                    document.getElementById('targetDate').value = date.toISOString().split('T')[0];
                    document.getElementById('targetShift').value = data.shift;
                    document.getElementById('targetVariant').value = data.variant;
                    document.getElementById('targetKg').value = data.targetKg;
                    
                    editingTargetId = targetId;
                    setTargetBtn.classList.add('hidden');
                    updateTargetBtn.classList.remove('hidden');
                    cancelTargetBtn.classList.remove('hidden');
                }
            })
            .catch(error => {
                alert("Error loading target: " + error.message);
            });
    }

    function deleteTarget(targetId) {
        if (confirm('Are you sure you want to delete this target?')) {
            db.collection('targets').doc(targetId).delete()
                .then(() => {
                    loadTargets();
                })
                .catch(error => {
                    alert("Error deleting target: " + error.message);
                });
        }
    }

    function editUser(userId) {
        db.collection('users').doc(userId).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    
                    document.getElementById('userName').value = data.name;
                    document.getElementById('userEmail').value = data.email;
                    document.getElementById('userRole').value = data.role;
                    
                    document.getElementById('userPassword').value = '';
                    
                    editingUserId = userId;
                    addUserBtn.classList.add('hidden');
                    updateUserBtn.classList.remove('hidden');
                    cancelUserBtn.classList.remove('hidden');
                }
            })
            .catch(error => {
                alert("Error loading user: " + error.message);
            });
    }

    function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            // First delete the user document
            db.collection('users').doc(userId).delete()
                .then(() => {
                    // Then delete the auth user
                    return auth.getUser(userId).then(userRecord => {
                        return auth.deleteUser(userId);
                    });
                })
                .then(() => {
                    loadUsers();
                })
                .catch(error => {
                    alert("Error deleting user: " + error.message);
                });
        }
    }

    // Initialize the app when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        loadVariantConfig();
        fillVariantSelects();

        if (document.getElementById('shiftSelect')) {
            document.getElementById('shiftSelect').addEventListener('change', fillVariantSelects);
        }
        if (document.getElementById('currentDateTime')) {
            document.getElementById('currentDateTime').addEventListener('change', fillVariantSelects);
        }
        if (document.getElementById('variantSelect')) {
            document.getElementById('variantSelect').addEventListener('change', () => {
            });
        }
        if (document.getElementById('shiftSelect')) {
    document.getElementById('shiftSelect').addEventListener('change', showCurrentTargetInfo);
    }
    if (document.getElementById('currentDateTime')) {
        document.getElementById('currentDateTime').addEventListener('change', showCurrentTargetInfo);
    }
    if (document.getElementById('variantSelect')) {
        document.getElementById('variantSelect').addEventListener('change', showCurrentTargetInfo);
    }

    const searchInput = document.getElementById('recentSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const keyword = this.value.trim().toLowerCase();
            const filtered = recentProductionData.filter(item =>
                (item.operatorName || '').toLowerCase().includes(keyword) ||
                (item.shift || '').toLowerCase().includes(keyword) ||
                (item.variant || '').toLowerCase().includes(keyword)
            );
            renderRecentDataTable(filtered);
        });
    }
        loadDashboardData();
        loadRecentData();
        loadTargets();
        loadUsers();
    });