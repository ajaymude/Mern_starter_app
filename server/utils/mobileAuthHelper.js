/**
 * Helper functions for mobile authentication
 * These can be used by React Native apps
 */

/**
 * Get authentication headers for mobile requests
 */
export const getAuthHeaders = (token) => {
  return {
    Authorization: `Bearer ${token}`,
    "X-Client-Type": "mobile",
    "Content-Type": "application/json",
  };
};

/**
 * Example usage in React Native:
 * 
 * import { getAuthHeaders } from './utils/mobileAuthHelper';
 * 
 * const response = await fetch('http://your-api.com/api/users/profile', {
 *   headers: getAuthHeaders(userToken)
 * });
 */

