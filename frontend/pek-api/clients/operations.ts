export const operations = {
    "AppHome": {
        "path": "/",
        "method": "get"
    },
    "AppPing": {
        "path": "/ping",
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
    },
    "GroupCreate": {
        "path": "/api/v4/group",
        "method": "post"
    },
    "GroupFindAll": {
        "path": "/api/v4/group",
        "method": "get"
    },
    "GroupFindOne": {
        "path": "/api/v4/group/:id",
        "method": "get"
    },
    "GroupUpdate": {
        "path": "/api/v4/group/:id",
        "method": "put"
    },
    "GroupRemove": {
        "path": "/api/v4/group/:id",
        "method": "delete"
    }
} as const;