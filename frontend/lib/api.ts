import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!API_BASE_URL) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL environment variable is not set');
}

const buildUrl = (endpoint: string): string => {
    if (endpoint.startsWith('http')) {
        return endpoint;
    }
    const normalizedEndpoint = endpoint.startsWith('/')
        ? endpoint
        : `/${endpoint}`;
    return API_BASE_URL + normalizedEndpoint;
};

type ApiOptions = {
    body?: any;
    headers?: Record<string, string>;
};

const handleCartError = () => {
    Cookies.remove('cartid');

    if (globalThis.window !== undefined) {
        globalThis.window.location.href = '/';
    }
};

const baseRequest = async <T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    options: ApiOptions = {}
): Promise<{ status: number; data: T }> => {
    const { body, headers = {} } = options;
    const url = buildUrl(endpoint);

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include',
    });

    let data: T;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        const text = await response.text();
        data = text ? JSON.parse(text) : ({} as T);
    } else {
        data = {} as T;
    }

    if (response.status === 422 || response.status === 410) {
        handleCartError();
    }

    return { status: response.status, data };
};

export const apiRequest = {
    get: <T = any>(url: string, options?: ApiOptions) =>
        baseRequest<T>(url, 'GET', options),
    post: <T = any>(url: string, options?: ApiOptions) =>
        baseRequest<T>(url, 'POST', options),
    put: <T = any>(url: string, options?: ApiOptions) =>
        baseRequest<T>(url, 'PUT', options),
    patch: <T = any>(url: string, options?: ApiOptions) =>
        baseRequest<T>(url, 'PATCH', options),
    delete: <T = any>(url: string, options?: ApiOptions) =>
        baseRequest<T>(url, 'DELETE', options),
};

export const errorMessages: Record<number, string> = {
    400: 'Dados inválidos',
    401: 'Credenciais inválidas',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    409: 'Estoque insuficiente',
    422: 'Carrinho de compras inválido',
    410: 'Carrinho de compras expirado',
    500: 'Erro interno do servidor',
};
