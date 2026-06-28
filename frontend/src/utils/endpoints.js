export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/api/auth/login",
    ME: "/api/auth/me",
  },
  CATEGORIES: {
    LIST: "/api/categories",
  },
  PRODUCTS: {
    LIST: "/api/products",
    DETAIL: (slug) => `/api/products/${slug}`,
  },
  DELIVERY_AREAS: {
    LIST: "/api/delivery-areas",
    KECAMATAN: "/api/delivery-areas/kecamatan",
  },
  ORDERS: {
    CREATE: "/api/orders",
  },
  SETTINGS: {
    GET: "/api/settings",
  },
  ADMIN: {
    PRODUCTS: {
      LIST: "/api/admin/products",
      CREATE: "/api/admin/products",
      UPDATE: (id) => `/api/admin/products/${id}`,
      DELETE: (id) => `/api/admin/products/${id}`,
    },
    CATEGORIES: {
      LIST: "/api/admin/categories",
      CREATE: "/api/admin/categories",
      UPDATE: (id) => `/api/admin/categories/${id}`,
      DELETE: (id) => `/api/admin/categories/${id}`,
    },
    DELIVERY_AREAS: {
      LIST: "/api/admin/delivery-areas",
      CREATE: "/api/admin/delivery-areas",
      UPDATE: (id) => `/api/admin/delivery-areas/${id}`,
      DELETE: (id) => `/api/admin/delivery-areas/${id}`,
    },
    ORDERS: {
      LIST: "/api/admin/orders",
      UPDATE_STATUS: (id) => `/api/admin/orders/${id}/status`,
      DELETE: (id) => `/api/admin/orders/${id}`,
    },
    DASHBOARD: "/api/admin/dashboard",
    SALES_REPORT: "/api/admin/sales-report",
    SETTINGS: "/api/admin/settings",
  },
};
