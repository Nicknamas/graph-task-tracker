import { createClient } from '@hey-api/openapi-ts';

const api = process.env.VITE_API

const URI_TO_SCHEMA = '/openapi/v1.json'
const apiFullPath = api + URI_TO_SCHEMA

createClient([
  {
    input: [apiFullPath],
    output: ["src/generated/api"],
    plugins: [
      {
        name: '@hey-api/client-fetch',
        throwOnError: true,
      },
      '@hey-api/typescript',
      '@tanstack/vue-query',
    ],
  },
])
