export type UserRole = "user" | "admin";

export type ProfileField = "first_name" | "last_name" | "phone";

export interface ProfileChange {
  id: string;
  user_id: string;
  field: ProfileField;
  old_value: string | null;
  new_value: string | null;
  changed_by: string | null;
  changed_at: string;
}

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: UserRole;
  is_blocked: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
}
