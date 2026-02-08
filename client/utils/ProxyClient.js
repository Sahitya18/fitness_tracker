import { API_BASE_URL } from './config';

/**
 * ProxyClient - Utility for making secure API calls through the proxy server
 * This ensures API keys are never exposed in client-side code or URLs
 */
class ProxyClient {
    constructor() {
        this.baseUrl = `${API_BASE_URL}/api/proxy`;
    }

    /**
     * Make a request to an external API through the proxy
     * @param {string} serviceName - The service name (e.g., 'fitness-api')
     * @param {string} endpoint - The API endpoint path
     * @param {Object} options - Request options
     * @param {string} options.method - HTTP method (GET, POST, PUT, DELETE)
     * @param {Object} options.body - Request body for POST/PUT
     * @param {Object} options.queryParams - Query parameters
     * @param {Object} options.headers - Additional headers
     */
    async request(serviceName, endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            queryParams = {},
            headers = {}
        } = options;

        const url = `${this.baseUrl}/${serviceName}/${endpoint}`;
        
        const requestOptions = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        // Add query parameters to URL
        if (Object.keys(queryParams).length > 0) {
            const urlParams = new URLSearchParams(queryParams);
            url += `?${urlParams.toString()}`;
        }

        // Add body for POST/PUT requests
        if (body && (method === 'POST' || method === 'PUT')) {
            requestOptions.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Proxy request failed:', error);
            throw error;
        }
    }

    /**
     * GET request through proxy
     */
    async get(serviceName, endpoint, queryParams = {}, headers = {}) {
        return this.request(serviceName, endpoint, {
            method: 'GET',
            queryParams,
            headers
        });
    }

    /**
     * POST request through proxy
     */
    async post(serviceName, endpoint, body = {}, headers = {}) {
        return this.request(serviceName, endpoint, {
            method: 'POST',
            body,
            headers
        });
    }

    /**
     * PUT request through proxy
     */
    async put(serviceName, endpoint, body = {}, headers = {}) {
        return this.request(serviceName, endpoint, {
            method: 'PUT',
            body,
            headers
        });
    }

    /**
     * DELETE request through proxy
     */
    async delete(serviceName, endpoint, headers = {}) {
        return this.request(serviceName, endpoint, {
            method: 'DELETE',
            headers
        });
    }

    /**
     * Health check for proxy service
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return response.ok;
        } catch (error) {
            console.error('Proxy health check failed:', error);
            return false;
        }
    }
}

// Export singleton instance
export default new ProxyClient();
