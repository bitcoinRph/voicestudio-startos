import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.5.7:0',
  releaseNotes: {
    en_US:
      'First StartOS release of VoiceStudio 0.5.7: web UI, REST and OpenAI-compatible API, and MCP server, protected by a generated API key that HyperFrames and other services can use.',
    es_ES:
      'Primera versión de VoiceStudio 0.5.7 para StartOS: interfaz web, API REST compatible con OpenAI y servidor MCP, protegidos por una clave de API generada que HyperFrames y otros servicios pueden usar.',
    de_DE:
      'Erste StartOS-Version von VoiceStudio 0.5.7: Weboberfläche, REST- und OpenAI-kompatible API sowie MCP-Server, geschützt durch einen generierten API-Schlüssel, den HyperFrames und andere Dienste nutzen können.',
    pl_PL:
      'Pierwsze wydanie VoiceStudio 0.5.7 dla StartOS: interfejs webowy, API REST zgodne z OpenAI i serwer MCP, chronione wygenerowanym kluczem API, którego mogą używać HyperFrames i inne usługi.',
    fr_FR:
      "Première version de VoiceStudio 0.5.7 pour StartOS : interface web, API REST compatible OpenAI et serveur MCP, protégés par une clé d'API générée que HyperFrames et d'autres services peuvent utiliser.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
