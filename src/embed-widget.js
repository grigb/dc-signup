// DC Signup Widget - Embeddable JavaScript Widget
(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        baseUrl: 'https://signup.distributedcreatives.org',
        version: '1.0.0'
    };
    
    // Create the widget
    function createDCSignupWidget(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('DC Signup Widget: Container not found:', containerId);
            return;
        }
        
        // Default options
        const settings = {
            width: options.width || '100%',
            height: options.height || '600px',
            theme: options.theme || 'default',
            showHeader: options.showHeader !== false,
            onComplete: options.onComplete || null,
            ...options
        };
        
        // Create iframe
        const iframe = document.createElement('iframe');
        iframe.src = `${CONFIG.baseUrl}?embedded=true&theme=${settings.theme}&header=${settings.showHeader}`;
        iframe.style.width = settings.width;
        iframe.style.height = settings.height;
        iframe.style.border = 'none';
        iframe.style.borderRadius = '8px';
        iframe.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('scrolling', 'auto');
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: ${settings.height}; 
                background: #f5f5f5; 
                border-radius: 8px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                color: #666;
            ">
                <div style="text-align: center;">
                    <div style="
                        width: 40px; 
                        height: 40px; 
                        border: 3px solid #667eea; 
                        border-top: 3px solid transparent; 
                        border-radius: 50%; 
                        animation: spin 1s linear infinite; 
                        margin: 0 auto 16px;
                    "></div>
                    <div>Loading Distributed Creatives signup...</div>
                </div>
            </div>
        `;
        
        // Add CSS for loading animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        container.appendChild(loadingDiv);
        
        // Replace loading with iframe when loaded
        iframe.onload = function() {
            container.removeChild(loadingDiv);
            container.appendChild(iframe);
        };
        
        // Listen for messages from iframe
        window.addEventListener('message', function(event) {
            if (event.origin !== CONFIG.baseUrl) return;
            
            if (event.data.type === 'dcSignupComplete') {
                if (settings.onComplete) {
                    settings.onComplete(event.data.memberData);
                }
                
                // Optional: Show success message
                if (settings.showSuccessMessage !== false) {
                    const successDiv = document.createElement('div');
                    successDiv.innerHTML = `
                        <div style="
                            background: #d4edda; 
                            color: #155724; 
                            padding: 20px; 
                            border-radius: 8px; 
                            text-align: center;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        ">
                            <h3 style="margin: 0 0 8px 0;">Welcome to Distributed Creatives!</h3>
                            <p style="margin: 0;">Thank you for joining our community. Check your email for verification.</p>
                        </div>
                    `;
                    container.innerHTML = '';
                    container.appendChild(successDiv);
                }
            }
            
            if (event.data.type === 'dcSignupResize') {
                iframe.style.height = event.data.height + 'px';
            }
        });
        
        // Start loading
        iframe.src = iframe.src; // Trigger load
    }
    
    // Expose globally
    window.DCSignupWidget = createDCSignupWidget;
    
    // Auto-initialize if data attributes are found
    document.addEventListener('DOMContentLoaded', function() {
        const containers = document.querySelectorAll('[data-dc-signup]');
        containers.forEach(function(container) {
            const options = {
                width: container.dataset.width,
                height: container.dataset.height,
                theme: container.dataset.theme,
                showHeader: container.dataset.showHeader !== 'false'
            };
            createDCSignupWidget(container.id, options);
        });
    });
})();