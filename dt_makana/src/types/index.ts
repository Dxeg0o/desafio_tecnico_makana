export interface BaseEvent {
  department: string;
  event_type: "license" | "accident" | "failure";
  start_date: string;
  uniqueness_flag: string;
  turn_type: string;
}
export interface LicenseEvent extends BaseEvent {
  license_type: string;
  collaborator_age?: number | null;
  collaborator_gender?: "male" | "female" | "other" | null;
  collaborator_seniority: string;
}
export interface AccidentEvent extends BaseEvent {
  date: string;
  hour: string;
  accident_type: string;
  activity: string;
  motive: string;
  severity: "No aplica" | "Baja" | "Media" | "Alta" | "Fatal";
  potential: string;
  collaborator_age?: number | null;
  collaborator_gender?: "male" | "female" | "other" | null;
  collaborator_seniority: string;
  description: string;
}
export interface FailureEvent extends BaseEvent {
  date: string;
  failure_type: string;
}
export type PersonnelEvent = LicenseEvent | AccidentEvent | FailureEvent;
