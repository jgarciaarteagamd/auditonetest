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
`audiometry_sessions` con RLS.

**Fase 1b (motor de informes, de AudiometricReport):** en `src/audiometric/` están los tipos,
cálculos (PTA y % de pérdida AAO-HNS / AMA / AAOO, control de calidad de datos), gráficos
(audiograma, timpanograma, logoaudiometría) e informe A4. «Audiometría en consulta» abre el editor
completo (antecedentes, estudios auditivos, diagnóstico y firma) y guarda en la bandeja; desde la
bandeja, «Informe» reabre el editor para completar impedanciometría, logoaudiometría y diagnóstico.

- Los datos identificativos (nombre, apellidos, documento, fecha de nacimiento) **no se guardan**:
  solo viven en la memoria de la pestaña para imprimir. Se guardan la edad y los datos clínicos.
- Los audiogramas **introducidos a mano** pueden corregirse; los registrados por el sistema
  (prueba del paciente o audiómetro calibrado) son inmutables (trigger en la base de datos).

**Fase 1c (textos legales):** Términos de uso y Política de privacidad propios (ES/EN): sin
marcado CE, prueba del paciente solo informativa, limitaciones del generador de informes y de la
audiometría en consulta, encargo del tratamiento (art. 28 RGPD) y datos que no se guardan. Pantalla
de consentimiento del paciente, hoja del QR, declaración profesional del registro y aviso impreso
al pie del informe («NO CALIBRADO» en pruebas del paciente; «sin marcado CE» en sesiones del
audiómetro Auditone).

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
