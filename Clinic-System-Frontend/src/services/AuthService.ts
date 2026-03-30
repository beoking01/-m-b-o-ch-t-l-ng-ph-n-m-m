import api from "./Api";

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  dob: string;
  gender?: string;
  address?: string;
}

/** Đăng ký tài khoản mới */
export const registerUser = async (data: RegisterData) => {
  const response = await api.post("accounts/register", data);
  return response.data;
};

/** Đăng nhập và trả về thông tin user */
export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await api.post<LoginResponse>("accounts/login", {
    email,
    password,
  });

  if (response.data.message === 'Đăng nhập thành công!') {
    const { user } = response.data;

    if (!user || !user.id || !user.email) {
      throw new Error('Đăng nhập thành công nhưng API không trả về dữ liệu user.');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role
    };
  } else {
    throw new Error(response.data.message || 'Đăng nhập thất bại');
  }
};

/** Đăng xuất khỏi hệ thống */
export const logoutUser = async (): Promise<void> => {
  await api.get("accounts/logout");
};
