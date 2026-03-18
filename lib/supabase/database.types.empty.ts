// Modulo vazio — substitui database.types.ts no bundle do Webpack.
// Tipos TypeScript sao apagados em tempo de compilacao e nao existem em runtime,
// portanto este arquivo vazio evita que o Webpack serialize 140kiB de tipos no cache.
export type Database = Record<string, unknown>
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]
