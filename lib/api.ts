const BASE_URL = "https://hammad712-rohde-auth.hf.space"

export interface AuthResponse {
  access_token: string
  refresh_token: string
  token_type: string
  name?: string
  avatar?: string
}

export interface UserData {
  name: string
  email: string
  avatar: string
  role: string
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const formData = new URLSearchParams()
  formData.append("username", username)
  formData.append("password", password)
  formData.append("grant_type", "password")

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail?.[0]?.msg || "Login failed")
  }

  return response.json()
}

export async function signup(
  name: string,
  email: string,
  password: string,
  avatar?: File
): Promise<AuthResponse> {
  const formData = new FormData()
  formData.append("name", name)
  formData.append("email", email)
  formData.append("password", password)
  formData.append("role", "user")
  
  if (avatar) {
    formData.append("avatar", avatar)
  }

  const response = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail?.[0]?.msg || "Signup failed")
  }

  return response.json()
}

export async function getMe(accessToken: string): Promise<UserData> {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch user data")
  }

  return response.json()
}

export async function updateMe(
  accessToken: string,
  name?: string,
  email?: string,
  password?: string,
  avatar?: File
): Promise<UserData> {
  const formData = new FormData()
  
  if (name) formData.append("name", name)
  if (email) formData.append("email", email)
  if (password) formData.append("password", password)
  if (avatar) formData.append("avatar", avatar)

  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail?.[0]?.msg || "Update failed")
  }

  return response.json()
}

export async function getAvatar(fileId: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/auth/avatar/${fileId}`)

  if (!response.ok) {
    throw new Error("Failed to fetch avatar")
  }

  return response.blob()
}

export async function getAvatarImage(avatarPath: string): Promise<string | null> {
  try {
    if (!avatarPath) return null
    
    const fileId = avatarPath.split('/').pop()
    
    if (!fileId) return null
    
    const blob = await getAvatar(fileId)
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error("[v0] Error loading avatar image:", error)
    return null
  }
}
