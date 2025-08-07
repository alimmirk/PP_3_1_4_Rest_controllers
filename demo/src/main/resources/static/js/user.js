document.addEventListener('DOMContentLoaded', function() {
    const API_URL = '/api/user';
    let currentUser = null;

    // DOM элементы
    const userData = document.getElementById('userData');
    const currentUsername = document.getElementById('currentUsername');
    const userRoles = document.getElementById('userRoles');
    const logoutBtn = document.getElementById('logoutBtn');

    // Загрузка данных пользователя
    async function loadUserData() {
        try {
            const response = await fetch(API_URL, {
                credentials: 'include',
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