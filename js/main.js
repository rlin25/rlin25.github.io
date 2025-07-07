// Main application initialization
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the infrastructure visualization
    try {
        window.infrastructureViz = new InfrastructureVisualization(
            '#d3-container', 
            infrastructureData
        );
        
        console.log('Infrastructure visualization initialized successfully');
        
        // Force initial resize to ensure proper scaling
        setTimeout(() => {
            const container = document.getElementById('d3-container');
            if (container) {
                const containerRect = container.getBoundingClientRect();
                console.log('Initial container size:', containerRect.width, 'x', containerRect.height);
                window.infrastructureViz.updateDimensions(containerRect.width, containerRect.height);
            }
        }, 100);
        
        // Add performance tracking
        if (window.performance && window.performance.mark) {
            window.performance.mark('infrastructure-viz-loaded');
        }
        
    } catch (error) {
        console.error('Failed to initialize infrastructure visualization:', error);
        
        // Show fallback content
        const container = document.getElementById('d3-container');
        if (container) {
            container.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; text-align: center;">
                    <div>
                        <h3>Infrastructure Visualization</h3>
                        <p>FrizzlesRubric Distributed AI System</p>
                        <p style="font-size: 0.9rem; margin-top: 1rem;">
                            Interactive diagram showing 7 evaluation experts across secure VPC infrastructure
                        </p>
                    </div>
                </div>
            `;
        }
    }
    
    // Initialize responsive behavior
    setupResponsiveDesign();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
    
    // Track page load performance
    trackPerformanceMetrics();
});

function setupResponsiveDesign() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (window.infrastructureViz) {
                // Re-calculate positions for responsive design
                const container = document.getElementById('d3-container');
                if (container) {
                    const containerRect = container.getBoundingClientRect();
                    const containerWidth = containerRect.width;
                    
                    console.log('RESIZE EVENT - Container rect:', containerRect);
                    console.log('RESIZE EVENT - New width:', containerWidth, 'New height:', containerRect.height);
                    console.log('RESIZE EVENT - Calling updateDimensions...');
                    
                    // Update visualization dimensions
                    window.infrastructureViz.updateDimensions(containerWidth, containerRect.height);
                    
                    // Adjust visualization for mobile
                    if (containerWidth < 768) {
                        console.log('Adjusting for mobile viewport');
                    }
                }
            }
        }, 250);
    });
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        // ESC key to close detail panel
        if (event.key === 'Escape' && window.componentDetailPanel && window.componentDetailPanel.isVisible) {
            window.componentDetailPanel.hide();
            event.preventDefault();
        }
        
        // Number keys to focus on specific components
        const componentMap = {
            '1': 'bastion',
            '2': 'orchestrator', 
            '3': 'clarity',
            '4': 'grammar',
            '5': 'documentation',
            '6': 'structure',
            '7': 'granularity',
            '8': 'tooling',
            '9': 'repetition'
        };
        
        if (componentMap[event.key] && window.infrastructureViz) {
            window.infrastructureViz.focusComponent(componentMap[event.key]);
            event.preventDefault();
        }
        
        // 'A' key to show all connections
        if (event.key.toLowerCase() === 'a' && window.infrastructureViz) {
            window.infrastructureViz.showAllConnections();
            event.preventDefault();
        }
    });
}

function trackPerformanceMetrics() {
    // Track page load time
    window.addEventListener('load', function() {
        if (window.performance && window.performance.getEntriesByType) {
            const navigation = window.performance.getEntriesByType('navigation')[0];
            if (navigation) {
                const loadTime = navigation.loadEventEnd - navigation.fetchStart;
                console.log(`Page load time: ${loadTime.toFixed(2)}ms`);
                
                // Track D3.js initialization time
                if (window.performance.getEntriesByName) {
                    const d3Marks = window.performance.getEntriesByName('infrastructure-viz-loaded');
                    if (d3Marks.length > 0) {
                        const d3LoadTime = d3Marks[0].startTime - navigation.fetchStart;
                        console.log(`D3.js visualization load time: ${d3LoadTime.toFixed(2)}ms`);
                    }
                }
            }
        }
    });
}

// Analytics tracking for component interactions
function trackComponentInteraction(componentId, action) {
    // Simple analytics tracking (could be enhanced with Google Analytics)
    const timestamp = Date.now();
    const interaction = {
        component: componentId,
        action: action,
        timestamp: timestamp,
        userAgent: navigator.userAgent,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
    
    console.log('Component interaction:', interaction);
    
    // Could send to analytics service
    // if (typeof gtag !== 'undefined') {
    //     gtag('event', 'component_interaction', {
    //         component_id: componentId,
    //         action_type: action
    //     });
    // }
}

// Accessibility helpers
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-9999px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
    
    // Could report to error tracking service
    // reportError(event.error);
});

// Service worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/service-worker.js')
        //     .then(function(registration) {
        //         console.log('ServiceWorker registration successful');
        //     })
        //     .catch(function(err) {
        //         console.log('ServiceWorker registration failed');
        //     });
    });
}

// Export global functions for accessibility controls
window.focusComponent = function(componentId) {
    if (window.infrastructureViz) {
        window.infrastructureViz.focusComponent(componentId);
        trackComponentInteraction(componentId, 'keyboard_focus');
        announceToScreenReader(`Focused on ${componentId} component`);
    }
};

window.showAllConnections = function() {
    if (window.infrastructureViz) {
        window.infrastructureViz.showAllConnections();
        trackComponentInteraction('all', 'show_connections');
        announceToScreenReader('Showing all system connections');
    }
};