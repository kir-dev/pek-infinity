import { defineConfig } from '@kubb/core';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginClient } from '@kubb/swagger-client';
import { pluginTanstackQuery } from '@kubb/swagger-tanstack-query';
import { pluginTs } from '@kubb/swagger-ts';
import { AxiosError } from 'axios';

export default defineConfig(() => {
  return {
    root: '.',

    input: {
      path: '../openapi.yaml',
    },
    output: {
      clean: true,
      path: './pek-api',
    },
    plugins: [
      pluginOas(),
      pluginTs(),
      pluginClient(), // Consider adding `{ output: { path: 'axios' } }`
      pluginTanstackQuery({
        framework: 'react',
        queryOptions: {
          retry: (count: number, error: Error) => {
            if (error instanceof AxiosError && error.response?.status === 401) return false;
            return count <= 2;
          },
        },
      }),
    ],
  };
});
