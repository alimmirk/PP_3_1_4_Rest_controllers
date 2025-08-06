const API_URL = '/api/admin';
const AUTH_HEADER = 'Basic ' + btoa('admin:admin123');

// DOM элементы
const usersTable = document.getElementById('usersTable').querySelector('tbody');
const userModal = document.getElementById('userModal');
const userForm = document.getElementById('userForm');
let allRoles = [];

// Загрузка данных при старте
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    loadRoles();
});

// Загрузка списка пользователей
async function loadUsers() {
    try {
        const response = await fetch(API_URL, {
            headers: { 'Authorization': AUTH_HEADER }
        });
        const users = await response.json();
        renderUsers(users);
    } catch (error) {
        alert('Error loading users: ' + error.message);
    }
}

// Загрузка списка ролей
async function loadRoles() {
    try {
        const response = await fetch(`${API_URL}/roles`, {
            headers: { 'Authorization': AUTH_HEADER }
        });
        allRoles = await response.json();
    } catch (error) {
        console.error('Error loading roles:', error);
    }
}

// Отображение пользователей в таблице
function renderUsers(users) {
    usersTable.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${user.roles.map(r => r.name).join(', ')}</td>
            <td>
                <button onclick="openEditModal(${user.id})">Edit</button>
                <button onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
        usersTable.appendChild(row);
    });
}

// Открытие модального окна для создания
function openCreateModal() {
    document.getElementById('modalTitle').textContent = 'Create User';
    document.getElementById('userId').value = '';
    userForm.reset();
    renderRoleCheckboxes([]);
    userModal.style.display = 'block';
}

// Открытие модального окна для редактирования
async function openEditModal(userId) {
    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            headers: { 'Authorization': AUTH_HEADER }
        });
        const user = await response.json();

        document.getElementById('modalTitle').textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('country').value = user.country;

        renderRoleCheckboxes(user.roles.map(r => r.id));
        userModal.style.display = 'block';
    } catch (error) {
        alert('Error loading user: ' + error.message);
    }
}

// Закрытие модального окна
function closeModal() {
    userModal.style.display = 'none';
}

// Отображение чекбоксов для ролей
function renderRoleCheckboxes(selectedRoleIds) {
    const container = document.getElementById('rolesContainer');
    container.innerHTML = '<h3>Roles:</h3>';

    allRoles.forEach(role => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `role_${role.id}`;
        checkbox.value = role.id;
        checkbox.checked = selectedRoleIds.includes(role.id);

        const label = document.createElement('label');
        label.htmlFor = `role_${role.id}`;
        label.textContent = role.name;

        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
    });
}

// Обработка формы
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const isEdit = !!userId;

    const userData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        country: document.getElementById('country').value,
        password: document.getElementById('password').value
    };

    // Собираем выбранные роли
    const roleIds = Array.from(document.querySelectorAll('#rolesContainer input[type="checkbox"]:checked'))
        .map(checkbox => parseInt(checkbox.value));

    try {
        if (isEdit) {
            await updateUser(userId, userData, roleIds);
        } else {
            await createUser(userData, roleIds);
        }
        closeModal();
        loadUsers();
    } catch (error) {
        alert('Error saving user: ' + error.message);
    }
});

// Создание пользователя
async function createUser(userData, roleIds) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...userData, roleIds })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
}

// Обновление пользователя
async function updateUser(userId, userData, roleIds) {
    const response = await fetch(`${API_URL}/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': AUTH_HEADER,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...userData, roleIds })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }
}

// Удаление пользователя
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
        const response = await fetch(`${API_URL}/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': AUTH_HEADER }
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        loadUsers();
    } catch (error) {
        alert('Error deleting user: ' + error.message);
    }
}