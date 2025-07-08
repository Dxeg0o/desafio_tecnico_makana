const headerMap: Record<string, string[]> = {
  department: ["dept", "departamento", "area"],
  event_type: ["tipo_evento", "evento"],
  start_date: ["fecha_inicio", "inicio"],
  uniqueness_flag: ["rut", "id"],
  turn_type: ["turno", "tipo_turno"],
  date: ["fecha", "día"],
  hour: ["hora"],
  accident_type: ["tipo_accidente"],
  severity: ["severidad"],
  activity: ["actividad"],
  motive: ["motivo"],
  potential: ["potencial"],
  collaborator_age: ["edad"],
  collaborator_gender: ["género", "sexo"],
  collaborator_seniority: ["antigüedad", "seniority"],
  description: ["descripción", "desc"],
  license_type: ["tipo_licencia"],
  failure_type: ["tipo_falla", "falla"],
};

/**
 * Converts a header string to snake_case alphanumeric
 */
function slugify(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Map and normalize an array of header strings using headerMap,
 * falling back to slugified header if no alias matches
 */
export function normalizeHeaders(headers: string[]): string[] {
  return headers.map((h) => {
    const key = h
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    for (const [norm, aliases] of Object.entries(headerMap)) {
      if (norm === key || aliases.map((a) => a.toLowerCase()).includes(key)) {
        return norm;
      }
    }
    return slugify(h);
  });
}
