import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { Capacitor } from '@capacitor/core';
import { Http } from '../capacitor-plugins';

// API base URL - will be overridden by environment variable if available
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://reflectai-n3f0.onrender.com";

// Check if we're running on a native platform
const isNative = Capacitor.isNativePlatform();

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse as JSON first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        throw new Error(errorData.message || `${res.status}: ${res.statusText}`);
      } else {
        // Fall back to text
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      // If JSON parsing fails, just use the status
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  methodOrOptions: string | {
    method: string;
    url: string;
    body?: string | object;
  },
  urlOrData?: string | object,
  data?: object
): Promise<Response> {
  // Handle different call patterns:
  // 1. apiRequest(options)
  // 2. apiRequest(url)
  // 3. apiRequest(method, url, data)
  
  let method: string = 'GET';
  let url: string = '';
  let body: string | undefined = undefined;
  
  if (typeof methodOrOptions === 'object') {
    // Pattern 1: apiRequest({ method, url, body })
    method = methodOrOptions.method;
    url = methodOrOptions.url;
    
    if (methodOrOptions.body) {
      body = typeof methodOrOptions.body === 'string' 
        ? methodOrOptions.body 
        : JSON.stringify(methodOrOptions.body);
    }
  } else if (typeof methodOrOptions === 'string' && typeof urlOrData === 'string') {
    // Pattern 3: apiRequest(method, url, data)
    method = methodOrOptions;
    url = urlOrData;
    
    if (data) {
      body = JSON.stringify(data);
    }
  } else if (typeof methodOrOptions === 'string') {
    // Pattern 2: apiRequest(url)
    url = methodOrOptions;
    
    if (typeof urlOrData === 'object' && urlOrData !== null) {
      // Actually using pattern 3 with default GET: apiRequest('url', data)
      method = 'GET';
      body = JSON.stringify(urlOrData);
    }
  }
  
  // Add the base URL to relative paths
  if (url.startsWith('/')) {
    url = `${API_BASE_URL}${url}`;
  }
  
  console.log(`Making API request to: ${url}`);
  
  // For native platforms, use the Capacitor HTTP plugin
  if (isNative && Http) {
    try {
      console.log(`Using Capacitor HTTP plugin for: ${url}`);
      
      const headers: Record<string, string> = body ? { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      } : {
        "Accept": "application/json"
      };
      
      const result = await Http.request({
        method: method as any,
        url: url,
        headers: headers,
        data: body ? JSON.parse(body) : undefined,
        connectTimeout: 30000,
        webFetchExtra: {
          credentials: 'include'
        }
      });
      
      console.log(`Capacitor HTTP response status: ${result.status}`);
      
      // Create a Response-like object
      const responseInit: ResponseInit = {
        status: result.status,
        headers: new Headers(result.headers)
      };
      
      // Convert the response data to the right format
      let responseData: string | Blob;
      if (typeof result.data === 'string') {
        responseData = result.data;
      } else {
        // Convert object to string
        responseData = JSON.stringify(result.data);
      }
      
      const response = new Response(responseData, responseInit);
      
      // Add custom json method that returns the parsed result.data
      const originalJson = response.json;
      response.json = async () => {
        if (typeof result.data === 'object') {
          return result.data;
        }
        return originalJson.call(response);
      };
      
      if (!response.ok) {
        throw new Error(`HTTP error ${result.status}: ${result.data || 'Unknown error'}`);
      }
      
      return response;
    } catch (error: any) {
      console.error('Capacitor HTTP error:', error);
      
      // Create error response
      const errorResponse = new Response(
        JSON.stringify({ message: error.message || 'Network request failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
      
      throw error;
    }
  }
  
  // For web platform, use the fetch API
  // Setup AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

  try {
    console.log(`Making fetch API request to: ${url}`);
    
    // Create headers object properly
    const headers: HeadersInit = body ? { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    } : {
      "Accept": "application/json"
    };
    
    const fetchOptions = {
      method,
      headers,
      body,
      credentials: "include" as RequestCredentials,
      signal: controller.signal,
      mode: 'cors' as RequestMode,
      cache: 'no-cache' as RequestCache
    };
    
    console.log("Fetch options:", { 
      method: fetchOptions.method,
      credentials: fetchOptions.credentials,
      mode: fetchOptions.mode,
      cache: fetchOptions.cache,
      hasBody: !!fetchOptions.body 
    });

    const res = await fetch(url, fetchOptions);

    // Log response status and headers
    console.log(`Response status: ${res.status} ${res.statusText}`);
    
    // Log headers in a way compatible with older JS versions
    const headerObj: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headerObj[key] = value;
    });
    console.log("Response headers:", headerObj);
    
    console.log("Has response cookies:", document.cookie.length > 0);

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle timeout errors
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    
    // Handle network/connection errors
    if (error instanceof TypeError && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed')
    )) {
      console.error('Network error during API request:', error);
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }
    
    // Handle CORS errors
    if (error.message.includes('CORS')) {
      console.error('CORS error during API request:', error);
      throw new Error('Cross-origin request blocked. Please try again later.');
    }
    
    // Re-throw other errors
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    
    // Add the base URL to relative paths
    if (url.startsWith('/')) {
      url = `${API_BASE_URL}${url}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Helper function for testing APIs with bypassed authentication (only for development)
export async function testApiRequest(
  methodOrOptions: string | {
    method: string;
    url: string;
    body?: string | object;
  },
  urlOrData?: string | object,
  data?: object
): Promise<Response> {
  // Use the same parsing logic as apiRequest
  let method: string = 'GET';
  let url: string = '';
  let body: string | undefined = undefined;
  
  if (typeof methodOrOptions === 'object') {
    method = methodOrOptions.method;
    url = methodOrOptions.url;
    
    if (methodOrOptions.body) {
      body = typeof methodOrOptions.body === 'string' 
        ? methodOrOptions.body 
        : JSON.stringify(methodOrOptions.body);
    }
  } else if (typeof methodOrOptions === 'string' && typeof urlOrData === 'string') {
    method = methodOrOptions;
    url = urlOrData;
    
    if (data) {
      body = JSON.stringify(data);
    }
  } else if (typeof methodOrOptions === 'string') {
    url = methodOrOptions;
    
    if (typeof urlOrData === 'object' && urlOrData !== null) {
      method = 'GET';
      body = JSON.stringify(urlOrData);
    }
  }
  
  // Add the base URL to relative paths
  if (url.startsWith('/')) {
    url = `${API_BASE_URL}${url}`;
  }
  
  console.log(`Making TEST API request to: ${url}`);
  
  // Setup AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    // Add development testing header to bypass authentication
    const headers: HeadersInit = body ? { 
      "Content-Type": "application/json",
      "X-ReflectAI-Dev-Auth": "bypass-auth-for-testing"
    } : {
      "X-ReflectAI-Dev-Auth": "bypass-auth-for-testing"
    };
    
    const res = await fetch(url, {
      method,
      headers,
      body,
      credentials: "include",
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again later.');
    }
    
    if (error instanceof TypeError && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('NetworkError') ||
      error.message.includes('Network request failed')
    )) {
      console.error('Network error during TEST API request:', error);
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }
    
    if (error.message.includes('CORS')) {
      console.error('CORS error during TEST API request:', error);
      throw new Error('Cross-origin request blocked. Please try again later.');
    }
    
    throw error;
  }
}
