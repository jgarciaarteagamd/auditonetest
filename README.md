# Auditone Test

Audiometría tonal liminal por **vía aérea (125–8000 Hz)** e informes audiométricos, con la misma
filosofía que Vocalyzer y ENT Quest: el paciente escanea el **código QR** del médico y los
resultados llegan, de forma anónima, a su **bandeja**.

Dos modos (ver [`PLAN.md`](PLAN.md)):

- **Consulta (clínico):** MacBook + interfaz de audio + auriculares audiométricos calibrados
  (RadioEar DD45) + pulsador. Apegado a ISO 8253-1 / IEC 60645-1 y diseñado para poder tramitar
  en el futuro un marcado CE Clase IIa.
- **Paciente (informativo):** prueba con el dispositivo y los auriculares del paciente. Siempre se
  guarda como **NO CALIBRADO**; no es un diagnóstico.

> Aviso: Auditone Test no es, por ahora, un producto sanitario con marcado CE. Ver el apartado 2
> de `PLAN.md`.

## Estado

**Fase 1a (esqueleto):** autenticación del médico, panel con QR y hoja imprimible, bandeja
(etiquetas, leído/no leído, copiar, eliminar, tiempo real), configuración y esquema de Supabase
`audiometry_sessions` con RLS. La página del paciente, la audiometría en consulta y el informe
son marcadores de posición que se completan en las fases siguientes.

Pendiente en 1b–1c: motor de AudiometricReport (tipos, cálculos, gráficos, generador de informes)
y adaptación de los textos legales (aún heredados de Vocalyzer).

## Puesta en marcha

```bash
npm ci
cp .env.example .env   # VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

Base de datos: ejecutar en orden los ficheros de `supabase/migrations/` en el SQL Editor de
Supabase (son idempotentes). Despliegue en Netlify (`netlify.toml`, función `keepalive` para
evitar la pausa del proyecto gratuito).

## Comprobaciones

```bash
npm run build      # typecheck + build
npm test           # políticas RLS sobre Postgres en memoria (PGlite)
```
