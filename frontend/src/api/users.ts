import http from './http';
export interface UserLite { id: number; name: string; email: string }
export const listUsers = async () => {
	try {
		const r = await http.get<UserLite[]>('/users');
		return r.data;
	} catch (err: any) {
		console.error('Error in listUsers:', err?.response?.data || err.message || err);
		throw err;
	}
};