import { readdir, readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

type GlobalDb = typeof globalThis & {
  __backofficePool?: pg.Pool;
  __backofficeLocal?: Promise<PGlite>;
  __backofficeSeeded?: boolean;
};

const g = globalThis as GlobalDb;

export async function sql<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  if (databaseUrl !== "") {
    g.__backofficePool ??= new pg.Pool({
      connectionString: databaseUrl,
      max: 5,
    });
    return (await g.__backofficePool.query(text, params)).rows as T[];
  }

  g.__backofficeLocal ??= startLocal().catch((error: unknown) => {
    g.__backofficeLocal = undefined;
    g.__backofficeSeeded = false;
    throw error;
  });
  return (await (await g.__backofficeLocal).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const db = new PGlite();
  const files = (await readdir("migrations").catch(() => []))
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    await db.exec(await readFile(`migrations/${file}`, "utf8"));
  }
  return db;
}

export async function ensureSeeded(): Promise<void> {
  if (g.__backofficeSeeded) return;
  const rows = await sql<{ count: string }>(
    "select count(*)::text as count from companies",
  );
  if (Number(rows[0]?.count ?? 0) > 0) {
    g.__backofficeSeeded = true;
    return;
  }
  const { seedDatabase } = await import("./seed");
  await seedDatabase();
  g.__backofficeSeeded = true;
}
