import { QueryClient, QueryFunction } from "@tanstack/react-query";

// API base URL - will be overridden by environment variable if available
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
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
  
  // Setup AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

  try {
    console.log(`Making API request to: ${url}`);
    
    // Create headers object properly
    const headers: HeadersInit = body ? { "Content-Type": "application/json" } : {};
    
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
