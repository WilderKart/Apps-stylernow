'use server';

import { Client } from 'pg';
import { revalidatePath } from 'next/cache';

function getClient() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  return new Client({ connectionString });
}

export async function getFeaturesAction() {
  const client = getClient();
  try {
    await client.connect();
    const res = await client.query("SELECT * FROM saas_features ORDER BY id ASC");
    return res.rows || [];
  } catch (error) {
    console.error("Error cargando features con PG:", error);
    return [];
  } finally {
    await client.end();
  }
}

export async function toggleFeatureAction(id: string, currentStatus: boolean) {
  const client = getClient();
  try {
    await client.connect();
    await client.query(
      "UPDATE saas_features SET active = $1, actualizado_en = NOW() WHERE id = $2",
      [!currentStatus, id]
    );
    revalidatePath('/admin/features');
    return { success: true };
  } catch (error: any) {
    console.error("Error al actualizar feature con PG:", error);
    return { success: false, error: error.message };
  } finally {
    await client.end();
  }
}
