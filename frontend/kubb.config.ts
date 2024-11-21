import { defineConfig } from '@kubb/core';
import { pluginClient } from '@kubb/plugin-client';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';

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
    plugins: [pluginOas(), pluginTs(), pluginClient(), pluginReactQuery()],
  };
});
