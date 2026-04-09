import apiClient from "./api";

// ✅ Explicitly including /api/ in the paths
export const registerUser = async (data) => {
  const res = await apiClient.post("/api/users/register/", data);

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

export const loginUser = async (username, password) => {
  const res = await apiClient.post("/api/token/", {
    username,
    password,
  });

  localStorage.setItem("access", res.data.access);
  localStorage.setItem("refresh", res.data.refresh);

  return res.data;
};

export const getCurrentUser = async () => {
  const res = await apiClient.get("/api/users/me/");
  return res.data;
};

export const logoutUser = () => {
  localStorage.clear();
};