// navigation.js - Навигация и общие функции UI
(function() {
    window.Navigation = {
        getHistory() {
            const hist = sessionStorage.getItem('nav_history');
            return hist ? JSON.parse(hist) : [];
        },
        
        pushHistory(url) {
            const hist = this.getHistory();
            hist.push(url);
            sessionStorage.setItem('nav_history', JSON.stringify(hist));
        },
        
        popHistory() {
            const hist = this.getHistory();
            hist.pop();
            sessionStorage.setItem('nav_history', JSON.stringify(hist));
        },
        
        getPreviousPage() {
            const hist = this.getHistory();
            if (hist.length >= 2) {
                return hist[hist.length - 2];
            }
            return null;
        },
        
        navigateTo(page) {
            this.pushHistory(window.location.href);
            window.location.href = page;
        },
        
        goBack() {
            const hist = this.getHistory();
            if (hist.length >= 2) {
                // Убираем текущую страницу
                hist.pop();
                const prevPage = hist[hist.length - 1];
                sessionStorage.setItem('nav_history', JSON.stringify(hist));
                window.location.href = prevPage;
            } else {
                // Если истории нет, идём на главную
                window.location.href = 'clubs.html';
            }
        },
        
        logout() {
            window.AppData.activeUserEmail = null;
            localStorage.removeItem('football_tracker_pro_v4_active_email');
            sessionStorage.removeItem('nav_history');
            window.location.href = 'index.html';
        },
        
        updateProfileWidget() {
            const widget = document.getElementById('profile-widget');
            if (!widget || !window.AppData.activeUserEmail) return;
            
            const user = window.AppData.usersDatabase[window.AppData.activeUserEmail];
            if (!user) return;
            
            const avatar = document.getElementById('widget-avatar');
            const name = document.getElementById('widget-name');
            
            if (avatar) {
                avatar.innerHTML = user.profile.photo 
                    ? `<img src="${user.profile.photo}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` 
                    : '👤';
            }
            if (name) name.innerText = user.profile.name;
            
            widget.style.display = 'flex';
        },
        
        updateMsgBadge() {
            const badge = document.getElementById('msg-badge');
            if (!badge || !window.AppData.activeUserEmail) return;
            
            const count = window.AppData.getUnreadCount(window.AppData.activeUserEmail);
            if (count > 0) {
                badge.style.display = 'flex';
                badge.innerText = count;
            } else {
                badge.style.display = 'none';
            }
        },
        
        showAlert(title, message) {
            document.getElementById('alert-title').innerText = title;
            document.getElementById('alert-message').innerText = message;
            document.getElementById('modal-alert').style.display = 'flex';
        },
        
        openModal(modalId) {
            document.getElementById(modalId).style.display = 'flex';
        },
        
        closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        },
        
        adjustColor(hex, amount) {
            let r = parseInt(hex.slice(1,3), 16) + amount;
            let g = parseInt(hex.slice(3,5), 16) + amount;
            let b = parseInt(hex.slice(5,7), 16) + amount;
            r = Math.max(0, Math.min(255, r));
            g = Math.max(0, Math.min(255, g));
            b = Math.max(0, Math.min(255, b));
            return `rgb(${r},${g},${b})`;
        },
        
        init() {
            // Проверяем авторизацию на всех страницах кроме login.html
            const currentPage = window.location.pathname.split('/').pop();
            if (currentPage !== 'login.html' && currentPage !== '') {
                const activeEmail = window.AppData.activeUserEmail;
                if (!activeEmail || !window.AppData.usersDatabase[activeEmail]) {
                    window.location.href = 'login.html';
                    return;
                }
            }
            
            // Добавляем текущую страницу в историю если её там нет
            const hist = this.getHistory();
            const currentUrl = window.location.href;
            if (hist.length === 0 || hist[hist.length - 1] !== currentUrl) {
                hist.push(currentUrl);
                sessionStorage.setItem('nav_history', JSON.stringify(hist));
            }
            
            this.updateProfileWidget();
            this.updateMsgBadge();
        }
    };
    
    // Инициализация при загрузке страницы
    document.addEventListener('DOMContentLoaded', () => {
        window.Navigation.init();
    });
})();