//@ts-check
import { defineConfig } from '@kubb/core';
import { pluginClient } from '@kubb/plugin-client';
import { pluginFaker } from '@kubb/plugin-faker';
import { pluginOas } from '@kubb/plugin-oas';
import { pluginReactQuery } from '@kubb/plugin-react-query';
import { pluginTs } from '@kubb/plugin-ts';
import { pluginZod } from '@kubb/plugin-zod';

/**
 * remove "Controller" from the filesnames
 * @param {{ group: string }} ctx
 * @returns
 */
function trimController(ctx) {
  const s = ctx.group.replace(/Controller$/, '');
  return s.slice(0, 1).toLowerCase() + s.slice(1);
}

export default defineConfig({
  input: {
    path: './openapi.json',
  },
  output: {
    path: './generated/',
    clean: true,
  },
  plugins: [
    pluginOas({ group: { type: 'tag', name: trimController } }),
    pluginTs({
      group: { type: 'tag', name: trimController },
      dateType: 'date',
      enumType: 'enum',
    }),
    pluginClient({
      group: { type: 'tag', name: trimController },
      urlType: 'export',
    }),
    pluginZod({
      dateType: 'date',
      group: { type: 'tag', name: trimController },
      typed: true,
    }),
    pluginFaker({
      dateType: 'date',
      group: { type: 'tag', name: trimController },
      seed: 42,
    }),
    pluginReactQuery({
      group: { type: 'tag', name: trimController },
      suspense: {},
    }),
  ],
});
