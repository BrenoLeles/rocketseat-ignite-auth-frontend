import axios, {AxiosError} from 'axios';
import {parseCookies, setCookie} from "nookies";
import {logout} from "../contexts/AuthContexts";

let cookies = parseCookies();
let seAtualizandoToken = false;
let filaRequisicoesFalhas = [];

export const api = axios.create({
	baseURL: 'http://localhost:3333',
	headers: {
		Authorization: `Bearer ${cookies['nextauth.token']}`
	}
})

api.interceptors.response.use(response => {
	return response;
	}, (error: AxiosError) => {
	if (error.response.status === 401) {
		if (error.response.data?.code === 'token.expired') {
			cookies = parseCookies();
			
			const {'nextauth.refreshToken': refreshToken} = cookies;
			const originalConfig = error.config;
			
			if (!seAtualizandoToken) {
				seAtualizandoToken = true;
				
				api.post('/refresh', {
					refreshToken
				}).then(response => {
					const {token} = response.data;
					
					setCookie(undefined, 'nextauth.token', token, {
						maxAge: 60 * 60 * 24 * 30,
						path: '/'
					});
					setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
						maxAge: 60 * 60 * 24 * 30,
						path: '/'
					});
					
					api.defaults.headers['Authorization'] = `Bearer ${token}`;
					
					filaRequisicoesFalhas.forEach(request => request.onSuccess(token));
					filaRequisicoesFalhas = [];
				}).catch(err => {
						filaRequisicoesFalhas.forEach(request => request.onFailure(err));
						filaRequisicoesFalhas = [];
					}).finally(() => {
						seAtualizandoToken = false;
					});
			}
			
			return new Promise((resolve, reject) => {
				filaRequisicoesFalhas.push({
					onSuccess: (token: string) => {
						originalConfig.headers['Authorization'] = `Bearer ${token}`;
						resolve(api(originalConfig));
					},
					onFailure: (err: AxiosError) => {
						reject(err);
					}
				})
			})
		} else {
			logout();
		}
	}
	
	return Promise.reject(error);
})