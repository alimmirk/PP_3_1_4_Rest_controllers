document.addEventListener('DOMContentLoaded', function() {
    // Constants
    const API_URL = '/api/admin';
    const AUTH_HEADER = 'Basic ' + btoa('admin:admin123'); // Replace with actual credentials

    // DOM Elements
    const usersTableBody = document.getElementById('usersTableBody');
    const addUserForm = document.getElementById('addUserForm');
    const editUserForm = document.getElementById('editUserForm');
    const rolesCheckboxes = document.getElementById('rolesCheckboxes');
    const editRolesCheckboxes = document.getElementById('editRolesCheckboxes');
    const currentUserSpan = document.getElementById('currentUser');
    const userRolesSpan = document.getElementById('userRoles');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminTabBtn = document.getElementById('adminTabBtn');
    const userTabBtn = document.getElementById('userTabBtn');

    // Modals
    const editUserModal = new bootstrap.Modal(document.getElementById('editUserModal'));
    const deleteUserModal = new bootstrap.Modal(document.getElementById('deleteUserModal'));

    // State
    let allUsers = [];
    let allRoles = [];
    let currentAdmin = null;

    // Initialize
    loadCurrentUser();
    loadAllUsers();
    loadAllRoles();

    // Event Listeners
    addUserForm.addEventListener('submit', handleAddUser);
    document.getElementById('saveUserBtn').addEventListener('click', handleEditUser);
    document.getElementById('confirmDeleteBtn').addEventListener('click', handleDeleteUser);
    logoutBtn.addEventListener('click', handleLogout);

    // Измененные обработчики для кнопок вкладок
    adminTabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Показываем вкладку управления пользователями
        const tab = new bootstrap.Tab(document.getElementById('users-tab'));
        tab.show();
    });

    userTabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Загружаем данные текущего пользователя
        loadCurrentUserDataForView();
    });

    // Functions
    async function loadCurrentUser() {
        try {
            const response = await fetch('/api/user', {
                headers: { 'Authorization': AUTH_HEADER }
            });

            if (!response.ok) throw new Error('Failed to load current user');

            currentAdmin = await response.json();
            currentUserSpan.textContent = currentAdmin.username;
            userRolesSpan.textContent = currentAdmin.roles.map(r => r.name.replace('ROLE_', '')).join(', ');
        } catch (error) {
            console.error('Error loading current user:', error);
            alert('Error loading user data. Please login again.');
            window.location.href = '/login';
        }
    }

    async function loadCurrentUserDataForView() {
        try {
            const response = await fetch('/api/user', {
                headers: { 'Authorization': AUTH_HEADER }
            });

            if (!response.ok) throw new Error('Failed to load user data');

            const userData = await response.json();
            // Можно открыть модальное окно с данными пользователя
            showUserDataModal(userData);
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Error loading user data: ' + error.message);
        }
    }

    function showUserDataModal(user) {
        // Создаем или находим модальное окно для показа данных пользователя
        let userModal = document.getElementById('userDataModal');

        if (!userModal) {
            // Создаем модальное окно, если его нет
            userModal = document.createElement('div');
            userModal.className = 'modal fade';
            userModal.id = 'userDataModal';
            userModal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">User Profile</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p><strong>Username:</strong> <span id="modalUsername"></span></p>
                            <p><strong>Email:</strong> <span id="modalEmail"></span></p>
                            <p><strong>Country:</strong> <span id="modalCountry"></span></p>
                            <p><strong>Roles:</strong> <span id="modalRoles"></span></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(userModal);
        }

        // Заполняем данные
        document.getElementById('modalUsername').textContent = user.username;
        document.getElementById('modalEmail').textContent = user.email;
        document.getElementById('modalCountry').textContent = user.country || '-';
        document.getElementById('modalRoles').textContent = user.roles.map(r => r.name.replace('ROLE_', '')).join(', ');

        // Показываем модальное окно
        const modal = new bootstrap.Modal(userModal);
        modal.show();
    }

    // Остальные функции остаются без изменений
    async function loadAllUsers() {
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': AUTH_HEADER }
            });

            if (!response.ok) throw new Error('Failed to load users');

            allUsers = await response.json();
            renderUsersTable(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            alert('Error loading users: ' + error.message);
        }
    }

    async function loadAllRoles() {
        try {
            const response = await fetch(`${API_URL}/roles`, {
                headers: { 'Authorization': AUTH_HEADER }
            });

            if (!response.ok) throw new Error('Failed to load roles');

            allRoles = await response.json();
            renderRolesCheckboxes(rolesCheckboxes);
            renderRolesCheckboxes(editRolesCheckboxes);
        } catch (error) {
            console.error('Error loading roles:', error);
            alert('Error loading roles: ' + error.message);
        }
    }

    function renderUsersTable(users) {
        usersTableBody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.country || '-'}</td>
                <td>${user.roles.map(r => r.name.replace('ROLE_', '')).join(', ')}</td>
                <td class="action-btns">
                    <button class="btn btn-sm btn-primary edit-btn" data-user-id="${user.id}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-btn" data-user-id="${user.id}">Delete</button>
                </td>
            `;

            usersTableBody.appendChild(row);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => openEditModal(btn.dataset.userId));
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => openDeleteModal(btn.dataset.userId));
        });
    }

    function renderRolesCheckboxes(container) {
        container.innerHTML = '';

        allRoles.forEach(role => {
            const div = document.createElement('div');
            div.className = 'form-check';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'form-check-input';
            checkbox.id = `role-${role.id}-${container.id}`;
            checkbox.value = role.id;

            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `role-${role.id}-${container.id}`;
            label.textContent = role.name.replace('ROLE_', '');

            div.appendChild(checkbox);
            div.appendChild(label);
            container.appendChild(div);
        });
    }

    function openEditModal(userId) {
        const user = allUsers.find(u => u.id == userId);
        if (!user) return;

        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editCountry').value = user.country || '';
        document.getElementById('editPassword').value = '';

        // Check the roles the user has
        const checkboxes = editRolesCheckboxes.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = user.roles.some(r => r.id == checkbox.value);
        });

        editUserModal.show();
    }

    function openDeleteModal(userId) {
        const user = allUsers.find(u => u.id == userId);
        if (!user) return;

        document.getElementById('deleteUserId').value = user.id;
        document.getElementById('deleteUserName').textContent = user.username;
        deleteUserModal.show();
    }

    async function handleAddUser(e) {
        e.preventDefault();

        const formData = {
            username: document.getElementById('newUsername').value,
            email: document.getElementById('newEmail').value,
            country: document.getElementById('newCountry').value,
            password: document.getElementById('newPassword').value,
            roleIds: getSelectedRoleIds(rolesCheckboxes)
        };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': AUTH_HEADER,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to add user');
            }

            alert('User added successfully!');
            addUserForm.reset();
            await loadAllUsers();

            // Switch to users tab
            const tab = new bootstrap.Tab(document.getElementById('users-tab'));
            tab.show();
        } catch (error) {
            console.error('Error adding user:', error);
            alert('Error adding user: ' + error.message);
        }
    }

    async function handleEditUser() {
        const userId = document.getElementById('editUserId').value;
        const formData = {
            username: document.getElementById('editUsername').value,
            email: document.getElementById('editEmail').value,
            country: document.getElementById('editCountry').value,
            password: document.getElementById('editPassword').value || undefined,
            roleIds: getSelectedRoleIds(editRolesCheckboxes)
        };

        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': AUTH_HEADER,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to update user');
            }

            alert('User updated successfully!');
            editUserModal.hide();
            await loadAllUsers();
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Error updating user: ' + error.message);
        }
    }

    async function handleDeleteUser() {
        const userId = document.getElementById('deleteUserId').value;

        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': AUTH_HEADER }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            alert('User deleted successfully!');
            deleteUserModal.hide();
            await loadAllUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user: ' + error.message);
        }
    }

    function handleLogout() {
        fetch('/logout', {
            method: 'POST',
            headers: { 'Authorization': AUTH_HEADER }
        }).then(() => {
            window.location.href = '/login';
        });
    }

    function getSelectedRoleIds(container) {
        const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.value));
    }
});