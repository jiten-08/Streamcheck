export interface UserProfile {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string
  avatar: string | null
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access: string
  refresh: string
  profile: UserProfile
}

export interface LoginPayload {
  username: string
  password: string
}

export interface SignupPayload {
  username: string
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
}

export interface ProfileUpdatePayload {
  username: string
  email: string
  first_name: string
  last_name: string
  bio: string
}

export interface ChangePasswordPayload {
  current_password: string
  new_password: string
  new_password_confirm: string
}
