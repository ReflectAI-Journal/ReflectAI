import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    
    // Handle trial expiration specifically
    if (res.status === 403 && text.includes('Trial expired')) {
      // Emit a custom event that the trial expiration context can listen to
      window.dispatchEvent(new CustomEvent('trialExpired'));
    }
    
    // Handle subscription required errors
    if (res.status === 403 && text.includes('Subscription required')) {
      try {
        const errorData = JSON.parse(text);
        if (errorData.feature && errorData.requiredPlans) {
          // Emit upgrade required event with feature details
          window.dispatchEvent(new CustomEvent('upgradeRequired', {
            detail: {
              featureName: errorData.feature,
              requiredPlan: errorData.requiredPlans[0], // Use first required plan
              message: errorData.message
            }
          }));
        }
      } catch (parseError) {
        // If parsing fails, still throw the original error
      }
    }
    
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
  
  // Get JWT token from localStorage if available
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = body ? { "Content-Type": "application/json" } : {};
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body,
    credentials: "include", // Keep for backward compatibility
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get JWT token from localStorage if available
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {};
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(queryKey[0] as string, {
      credentials: "include", // Keep for backward compatibility
      headers,
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
