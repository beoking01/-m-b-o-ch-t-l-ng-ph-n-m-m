import api from "./Api";

export async function getDashboardStats() {
    const response = await api.get(`/stats/admin/dashboard`);
    return response.data;
}
