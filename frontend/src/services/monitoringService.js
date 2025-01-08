class MonitoringService {
    constructor() {
        this.errors = [];
        this.maxErrors = 50;
    }

    init() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError({
                type: 'javascript',
                message,
                source,
                lineno,
                colno,
                stack: error?.stack
            });
        };

        window.addEventListener('unhandledrejection', (event) => {
            this.logError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled Promise Rejection',
                stack: event.reason?.stack
            });
        });
    }

    logError(error) {
        const errorData = {
            ...error,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.errors.push(errorData);
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Enviar erro para o backend
        this.sendErrorToServer(errorData);

        // Se estiver usando Sentry
        if (window.Sentry) {
            window.Sentry.captureException(error);
        }
    }

    async sendErrorToServer(error) {
        try {
            await fetch('/api/monitoring/error/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(error)
            });
        } catch (e) {
            console.error('Failed to send error to server:', e);
        }
    }

    getPerformanceMetrics() {
        if (!window.performance) return null;

        const timing = window.performance.timing;
        const navigation = window.performance.navigation;

        return {
            pageLoadTime: timing.loadEventEnd - timing.navigationStart,
            dnsLookupTime: timing.domainLookupEnd - timing.domainLookupStart,
            tcpConnectTime: timing.connectEnd - timing.connectStart,
            serverResponseTime: timing.responseEnd - timing.requestStart,
            domLoadTime: timing.domComplete - timing.domLoading,
            resourceLoadTime: timing.loadEventEnd - timing.responseEnd,
            navigationType: navigation.type
        };
    }
}

export default new MonitoringService(); 