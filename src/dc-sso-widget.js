// DC SSO Widget - Single Sign-On across all Distributed Creatives sites
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        authUrl: 'https://signup.distributedcreatives.org',
        apiUrl: 'https://signup.distributedcreatives.org/api',
        version: '1.0.0',
        cookieDomain: '.distributedcreatives.org', // Works across all subdomains
        storageKey: 'dc_user_session'
    };
    
    // SSO Widget Class
    class DCSSOnWidget {
        constructor(containerId, options = {}) {
            this.container = document.getElementById(containerId);
            this.options = {
                showAvatar: options.showAvatar !== false,
                showName: options.showName !== false,
                showCreatorBadge: options.showCreatorBadge !== false,
                compact: options.compact || false,
                theme: options.theme || 'default',
                onLogin: options.onLogin || null,
                onLogout: options.onLogout || null,
                ...options
            };
            
            this.user = null;
            this.init();
        }
        
        async init() {
            try {
                // Check for existing session
                await this.checkSession();
                this.render();
                
                // Listen for auth changes across tabs
                window.addEventListener('storage', (e) => {
                    if (e.key === CONFIG.storageKey) {
                        this.checkSession();
                        this.render();
                    }
                });
                
                // Check session periodically
                setInterval(() => this.checkSession(), 30000); // Every 30 seconds
                
            } catch (error) {
                console.error('DC SSO Widget initialization error:', error);
                this.renderError();
            }
        }
        
        async checkSession() {
            try {
                // Check localStorage first
                const stored = localStorage.getItem(CONFIG.storageKey);
                if (stored) {
                    const session = JSON.parse(stored);
                    if (session.expires > Date.now()) {
                        this.user = session.user;
                        return;
                    }
                }
                
                // Check with server
                const response = await this.apiCall('/auth/session');
                if (response.success && response.user) {
                    this.user = response.user;
                    // Store session
                    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
                        user: response.user,
                        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
                    }));
                } else {
                    this.user = null;
                    localStorage.removeItem(CONFIG.storageKey);
                }
            } catch (error) {
                console.error('Session check error:', error);
                this.user = null;
            }
        }
        
        async apiCall(endpoint, options = {}) {
            const response = await fetch(CONFIG.apiUrl + endpoint, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API call failed: ${response.status}`);
            }
            
            return response.json();
        }
        
        render() {
            if (!this.container) return;
            
            if (this.user) {
                this.renderLoggedIn();
            } else {
                this.renderLoggedOut();
            }
        }
        
        renderLoggedIn() {
            const { user } = this;
            const { showAvatar, showName, showCreatorBadge, compact } = this.options;
            
            const creatorTypes = user.creator_types || [];
            const isCreator = creatorTypes.length > 0;
            
            this.container.innerHTML = `
                <div class="dc-sso-widget logged-in ${compact ? 'compact' : ''}" data-theme="${this.options.theme}">
                    <div class="dc-user-info">
                        ${showAvatar ? `
                            <div class="dc-avatar">
                                ${user.avatar_url ? 
                                    `<img src="${user.avatar_url}" alt="${user.name}" />` :
                                    `<div class="dc-avatar-placeholder">${user.name.charAt(0).toUpperCase()}</div>`
                                }
                            </div>
                        ` : ''}
                        
                        <div class="dc-user-details">
                            ${showName ? `<div class="dc-user-name">${user.name}</div>` : ''}
                            ${showCreatorBadge && isCreator ? `
                                <div class="dc-creator-badge">
                                    <span class="dc-badge-icon">✨</span>
                                    Creator
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="dc-user-actions">
                        <button class="dc-btn dc-btn-secondary" onclick="dcSSOWidget.showProfile()">
                            Profile
                        </button>
                        <button class="dc-btn dc-btn-secondary" onclick="dcSSOWidget.logout()">
                            Logout
                        </button>
                    </div>
                </div>
            `;
            
            this.injectStyles();
        }
        
        renderLoggedOut() {
            this.container.innerHTML = `
                <div class="dc-sso-widget logged-out" data-theme="${this.options.theme}">
                    <button class="dc-btn dc-btn-primary" onclick="dcSSOWidget.login()">
                        Join DC Community
                    </button>
                    <button class="dc-btn dc-btn-secondary" onclick="dcSSOWidget.showLogin()">
                        Sign In
                    </button>
                </div>
            `;
            
            this.injectStyles();
        }
        
        renderError() {
            this.container.innerHTML = `
                <div class="dc-sso-widget error" data-theme="${this.options.theme}">
                    <span class="dc-error-text">Authentication unavailable</span>
                    <button class="dc-btn dc-btn-secondary" onclick="dcSSOWidget.retry()">
                        Retry
                    </button>
                </div>
            `;
            
            this.injectStyles();
        }
        
        login() {
            this.openAuthModal('signup');
        }
        
        showLogin() {
            this.openAuthModal('login');
        }
        
        showProfile() {
            this.openAuthModal('profile');
        }
        
        openAuthModal(mode = 'signup') {
            const modal = document.createElement('div');
            modal.className = 'dc-auth-modal-overlay';
            modal.innerHTML = `
                <div class="dc-auth-modal">
                    <div class="dc-auth-modal-header">
                        <h3>${mode === 'signup' ? 'Join Distributed Creatives' : 
                               mode === 'login' ? 'Sign In' : 'Profile'}</h3>
                        <button class="dc-auth-close" onclick="this.closest('.dc-auth-modal-overlay').remove()">×</button>
                    </div>
                    <div class="dc-auth-modal-content">
                        <iframe src="${CONFIG.authUrl}/${mode}?embedded=true&origin=${encodeURIComponent(window.location.origin)}" 
                                frameborder="0" 
                                style="width: 100%; height: 500px; border: none;"></iframe>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
            
            // Listen for auth success
            window.addEventListener('message', (event) => {
                if (event.origin !== CONFIG.authUrl) return;
                
                if (event.data.type === 'dcAuthSuccess') {
                    modal.remove();
                    this.user = event.data.user;
                    
                    // Update session
                    localStorage.setItem(CONFIG.storageKey, JSON.stringify({
                        user: event.data.user,
                        expires: Date.now() + (24 * 60 * 60 * 1000)
                    }));
                    
                    this.render();
                    
                    if (this.options.onLogin) {
                        this.options.onLogin(event.data.user);
                    }
                }
            });
        }
        
        async logout() {
            try {
                await this.apiCall('/auth/logout', { method: 'POST' });
                this.user = null;
                localStorage.removeItem(CONFIG.storageKey);
                this.render();
                
                if (this.options.onLogout) {
                    this.options.onLogout();
                }
                
                // Notify other tabs
                window.dispatchEvent(new StorageEvent('storage', {
                    key: CONFIG.storageKey,
                    newValue: null
                }));
                
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        
        retry() {
            this.init();
        }
        
        injectStyles() {
            if (document.getElementById('dc-sso-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'dc-sso-styles';
            styles.textContent = `
                .dc-sso-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 12px;
                    border-radius: 8px;
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                }
                
                .dc-sso-widget.compact {
                    padding: 4px 8px;
                    gap: 8px;
                }
                
                .dc-sso-widget.logged-in {
                    justify-content: space-between;
                }
                
                .dc-user-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .dc-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    overflow: hidden;
                }
                
                .dc-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .dc-avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                }
                
                .dc-user-name {
                    font-weight: 600;
                    color: #333;
                    font-size: 14px;
                }
                
                .dc-creator-badge {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .dc-badge-icon {
                    font-size: 10px;
                }
                
                .dc-user-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .dc-btn {
                    padding: 6px 12px;
                    border-radius: 4px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .dc-btn-primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .dc-btn-secondary {
                    background: #f8f9fa;
                    color: #666;
                    border: 1px solid #e9ecef;
                }
                
                .dc-btn:hover {
                    opacity: 0.9;
                    transform: translateY(-1px);
                }
                
                .dc-auth-modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    padding: 20px;
                }
                
                .dc-auth-modal {
                    background: white;
                    border-radius: 12px;
                    width: 100%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                }
                
                .dc-auth-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e9ecef;
                }
                
                .dc-auth-modal-header h3 {
                    margin: 0;
                    color: #333;
                }
                
                .dc-auth-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .dc-auth-modal-content {
                    padding: 0;
                }
                
                .dc-error-text {
                    color: #dc3545;
                    font-size: 12px;
                }
                
                /* Dark theme */
                .dc-sso-widget[data-theme="dark"] {
                    background: #2d3748;
                    border-color: #4a5568;
                    color: white;
                }
                
                .dc-sso-widget[data-theme="dark"] .dc-user-name {
                    color: white;
                }
                
                .dc-sso-widget[data-theme="dark"] .dc-btn-secondary {
                    background: #4a5568;
                    color: white;
                    border-color: #718096;
                }
            `;
            
            document.head.appendChild(styles);
        }
    }
    
    // Global instance
    window.dcSSOWidget = null;
    
    // Initialize function
    window.initDCSSO = function(containerId, options = {}) {
        window.dcSSOWidget = new DCSSOnWidget(containerId, options);
        return window.dcSSOWidget;
    };
    
    // Auto-initialize
    document.addEventListener('DOMContentLoaded', function() {
        const containers = document.querySelectorAll('[data-dc-sso]');
        containers.forEach(function(container) {
            const options = {
                showAvatar: container.dataset.showAvatar !== 'false',
                showName: container.dataset.showName !== 'false',
                showCreatorBadge: container.dataset.showCreatorBadge !== 'false',
                compact: container.dataset.compact === 'true',
                theme: container.dataset.theme || 'default'
            };
            
            window.dcSSOWidget = new DCSSOnWidget(container.id, options);
        });
    });
    
})();