document.addEventListener('DOMContentLoaded', function() {
    const API_URL = '/api/user';
    let currentUser = null;
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));

    // DOM элементы
    const userData = document.getElementById('userData');
    const currentUsername = document.getElementById('currentUsername');
    const userRoles = document.getElementById('userRoles');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const profileForm = document.getElementById('profileForm');

    // Загрузка данных пользователя
    async function loadUserData() {
        try {
            const response = await fetch(API_URL, {
                credentials: 'include', // Для работы с сессией
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(error || 'Failed to load user data');
            }

            currentUser = await response.json();
            renderUserData(currentUser);
        } catch (error) {
            console.error('Error:', error);
            alert('Error loading user data: ' + error.message);
            window.location.href = '/login';
        }
    }

    // Отображение данных пользователя
    function renderUserData(user) {
        userData.innerHTML = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.country || '-'}</td>
                <td>${user.roles.map(r => r.name.replace('ROLE_', '')).join(', ')}</td>
            </tr>
        `;

        currentUsername.textContent = user.username;
        userRoles.textContent = user.roles.map(r => r.name.replace('ROLE_', '')).join(', ');
    }

    // Открытие модального окна редактирования
    editProfileBtn.addEventListener('click', () => {
        if (!currentUser) return;

        document.getElementById('userId').value = currentUser.id;
        document.getElementById('username').value = currentUser.username;
        document.getElementById('email').value = currentUser.email;
        document.getElementById('country').value = currentUser.country || '';
        document.getElementById('password').value = '';

        editModal.show();
    });

    // Сохранение изменений профиля (исправленный обработчик)
    saveProfileBtn.addEventListener('click', async () => {
        const userId = document.getElementById('userId').value;
        const updatedData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            country: document.getElementById('country').value,
            password: document.getElementById('password').value || null
        };

        try {
            const response = await fetch(`${API_URL}/${userId}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            const result = await response.json();
            editModal.hide();
            await loadUserData();
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating profile: ' + error.message);
        }
    });

    // Выход из системы
    logoutBtn.addEventListener('click', () => {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(() => {
            window.location.href = '/login';
        }).catch(error => {
            console.error('Logout error:', error);
            window.location.href = '/login';
        });
    });

    // Инициализация
    loadUserData();
});