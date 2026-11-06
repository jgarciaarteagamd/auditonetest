// Runs the Supabase migration on an in-memory Postgres (PGlite) with a minimal Supabase-like
// `auth` schema and checks the Row Level Security rules.
import { beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const D1 = "11111111-1111-1111-1111-111111111111";
const D2 = "22222222-2222-2222-2222-222222222222";
const UNKNOWN = "33333333-3333-3333-3333-333333333333";
let db: PGlite;

async function as(role: "anon" | "authenticated", sub: string | null, sql: string, params: unknown[] = []) {
  await db.exec(`RESET ROLE; SELECT set_config('request.jwt.claim.sub', '${sub ?? ""}', false); SET ROLE ${role};`);
  try {
    const r = await db.query<Record<string, unknown>>(sql, params);
    return { ok: true as const, rows: r.rows };
  } catch (e) {
    return { ok: false as const, error: (e as Error).message, rows: [] };
  } finally {
    await db.exec("RESET ROLE;");
  }
}

// $1 source, $2 seen, $3 label, $4 report, $5 calibrated
const insert = (doctor: string) =>
  `INSERT INTO public.audiometry_sessions (doctor_id, source, seen, label, report, calibrated, app_version, audiogram)
   VALUES ('${doctor}', $1, $2, $3, $4, $5, 'auditone-0.1.0', '{"right":{"1000":20}}')`;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    REVOKE ALL ON SCHEMA public FROM PUBLIC; -- no implicit access: the migration must grant it
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users (id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE
      AS $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO anon, authenticated;
    CREATE PUBLICATION supabase_realtime;
    INSERT INTO auth.users VALUES ('${D1}'), ('${D2}');
  `);
  const dir = join(__dirname, "..", "supabase", "migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  for (const f of files) {
    const sql = readFileSync(join(dir, f), "utf8");
    await db.exec(sql);
    await db.exec(sql); // every migration must be idempotent
  }
});

describe("audiometry_sessions RLS", () => {
  it("anonymous patient can submit a valid row for an existing doctor", async () => {
    expect((await as("anon", null, insert(D1), ["patient", false, null, null, false])).ok).toBe(true);
  });
  it("anonymous inserts with wrong doctor / label / source / seen / report / calibrated are rejected", async () => {
    expect((await as("anon", null, insert(UNKNOWN), ["patient", false, null, null, false])).ok).toBe(false);
    expect((await as("anon", null, insert(D1), ["patient", false, "JP", null, false])).ok).toBe(false);
    expect((await as("anon", null, insert(D1), ["doctor", false, null, null, false])).ok).toBe(false);
    expect((await as("anon", null, insert(D1), ["patient", true, null, null, false])).ok).toBe(false);
    expect((await as("anon", null, insert(D1), ["patient", false, null, '{"diagnosis":"x"}', false])).ok).toBe(false);
    expect((await as("anon", null, insert(D1), ["patient", false, null, null, true])).ok).toBe(false);
  });
  it("anonymous users cannot read results; oversized payloads are rejected", async () => {
    expect((await as("anon", null, "SELECT * FROM public.audiometry_sessions")).ok).toBe(false);
    const big = await as(
      "anon",
      null,
      `INSERT INTO public.audiometry_sessions (doctor_id, app_version, audiogram)
       VALUES ('${D1}', 'v', jsonb_build_object('x', repeat('a', 25000)))`,
    );
    expect(big.ok).toBe(false);
  });
  it("doctors insert/read only their own rows", async () => {
    expect((await as("authenticated", D1, insert(D1), ["doctor", true, "JP", '{"diagnosis":"normal"}', true])).ok).toBe(true);
    expect((await as("authenticated", D1, insert(D2), ["doctor", true, null, null, true])).ok).toBe(false);
    expect((await as("authenticated", D1, "SELECT id FROM public.audiometry_sessions")).rows).toHaveLength(2);
    expect((await as("authenticated", D2, "SELECT id FROM public.audiometry_sessions")).rows).toHaveLength(0);
  });
  it("doctors may update seen/label/report but never the measurements", async () => {
    expect(
      (await as("authenticated", D1, `UPDATE public.audiometry_sessions SET seen = true, label = 'AB', report = '{"impedance":{}}'`)).ok,
    ).toBe(true);
    expect((await as("authenticated", D1, "UPDATE public.audiometry_sessions SET audiogram = '{}'")).ok).toBe(false);
    expect((await as("authenticated", D1, "UPDATE public.audiometry_sessions SET calibrated = true")).ok).toBe(false);
    expect((await as("authenticated", D1, "UPDATE public.audiometry_sessions SET label = repeat('x', 61)")).ok).toBe(false);
    expect((await as("authenticated", D2, "UPDATE public.audiometry_sessions SET seen = false RETURNING id")).rows).toHaveLength(0);
  });
  it("doctors delete only their own rows", async () => {
    expect((await as("authenticated", D2, "DELETE FROM public.audiometry_sessions RETURNING id")).rows).toHaveLength(0);
    expect((await as("authenticated", D1, "DELETE FROM public.audiometry_sessions RETURNING id")).rows).toHaveLength(2);
  });
});

describe("keepalive", () => {
  it("anonymous clients can call keepalive() (used by the scheduled Netlify function)", async () => {
    const r = await as("anon", null, "SELECT public.keepalive() AS t");
    expect(r.ok).toBe(true);
    expect(r.rows).toHaveLength(1);
  });
});
