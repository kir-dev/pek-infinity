export const operations = {
    "PingSend": {
        "path": "/api/v4/ping",
        "method": "get"
    },
    "AuthLogin": {
        "path": "/api/v4/auth/login",
        "method": "get"
    },
    "AuthOauthRedirect": {
        "path": "/api/v4/auth/callback",
        "method": "get"
    },
    "AuthLogout": {
        "path": "/api/v4/auth/logout",
        "method": "get"
    },
    "AuthMe": {
        "path": "/api/v4/auth/me",
        "method": "get"
    }
} as const;