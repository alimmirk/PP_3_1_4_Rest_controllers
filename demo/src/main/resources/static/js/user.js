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
                headers: {
                    'Authorization': 'Basic ' + btoa('user:user123') // Замените на реальные данные
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load user data');
            }

            currentUser = await response.json();
            renderUserData(currentUser);
        } catch (error) {
            console.error('Error:', error);
            alert('Error loading user data: ' + error.message);
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

    // Сохранение изменений профиля
    saveProfileBtn.addEventListener('click', async () => {
        const updatedData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            country: document.getElementById('country').value,
            password: document.getElementById('password').value || undefined
        };

        try {
            const response = await fetch(API_URL, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('user:user123') // Замените на реальные данные
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

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
            headers: {
                'Authorization': 'Basic ' + btoa('user:user123') // Замените на реальные данные
            }
        }).then(() => {
            window.location.href = '/login';
        });
    });

    // Инициализация
    loadUserData();
});