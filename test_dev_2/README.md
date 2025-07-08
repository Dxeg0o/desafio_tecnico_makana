# 💼 Desafío Técnico – Makana (React + IA)

Makana es una startup B2B de bienestar laboral, donde combinamos tecnología y espacios físicos para disminuir la fatiga, lesiones y malestar en colaboradores. Uno de nuestros procesos clave es convertir datos operativos en insights para RRHH y áreas de seguridad.

Cuando una empresa cliente se une a Makana, nos entrega datos relacionados con **accidentes, licencias médicas y fallas operativas**. Sin embargo, estos archivos pueden venir en cualquier formato: CSV o Excel, con nombres de columnas variados, filas desordenadas, etc.

---

## 🎯 Objetivo del desafío

Desarrollar un módulo frontend en **React + TypeScript** que permita cargar uno de estos archivos y procesarlo automáticamente utilizando **IA**.

---

## 📌 Especificaciones

### 1. Componente de carga

Crea un componente que permita al usuario subir un archivo `.csv` o `.xlsx`.

---

### 2. Limpieza e interpretación con IA

El archivo cargado debe ser:

- Parseado en el frontend (por lotes si es necesario)
- Enviado a una IA (como OpenAI o Claude) con un prompt personalizado
- Clasificado fila por fila en uno de los siguientes tipos de evento:
  - `license` (licencia médica)
  - `accident` (accidente laboral)
  - `failure` (falla operativa)

Cada fila procesada debe convertirse en un único objeto dentro de una lista `personnel_events`, con una estructura como esta (dependiendo del tipo, sin incluir IDs):

```
{
      "department": string,
      "event_type": un string de la siguiente lista[LM/L LM/C LM/M AC AC/STP FA/IN EM DV Otros Policlinico],
      "start_date": fecha,
      "end_date": fecha,
      "uniqueness_flag": rut,
      "turn_type": un string de la siguiente lista[08-H/D 12-H/D 10x10-A 10x10-B 10x10-C 10x10-D 4x3 5x2 PDP ART22 90x30 14x14 6x1 SinInfo]
      "date": fecha,
      "hour": hora,
      "accident_type": un string de la siguiente lista[STP NAT CuAc InAm CTP AC AC/STP],
      "severity": un string de la siguiente lista ['No aplica', 'Baja', 'Media', 'Alta', 'Fatal'],
      "activity": string,
      "motive": string,
      "potential": row['potential'],
      "collaborator_age": int,
      "collaborator_gender": un string de la siguiente lista [male female other],
      "collaborator_seniority": string,
      "description": string,
      "license_type": un string de la siguiente lista [LM/C LM/L LM/M S/I],
      "failure_type": un string de la siguiente lista [permiso falla],
}
```
Todos los eventos deben tener los campos:
  "department"
  "event_type"
  "start_date"
  "uniqueness_flag"
  "turn_type"

si el event_type es falla (FA), entonces debe tener los campos:
  "date"
  "failure_type"
si el event_type es licencia (LM), entonces debe tener los campos:
  "license_type"
  "collaborator_age"
  "collaborator_gender"
  "collaborator_seniority"
y si el event_type es accidente (AC), entonces debe tener los campos:
  "date"
  "hour"
  "accident_type"
  "activity"
  "motive"
  "severity"
  "potential"
  "collaborator_age"
  "collaborator_gender"
  "collaborator_seniority"
  "description"


  Los archivos de datos estan en formatos muy irregulares, algunos maracn las fallas con una simple F y las licencias con un L, otros usan nomenclaturas más completas. Si tienes didas sobre las siblas escribeme y yo te explico que es cada cosa.