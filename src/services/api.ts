import axios, {AxiosError} from 'axios';
import {parseCookies, setCookie} from "nookies";
import {logout} from "../contexts/AuthContexts";
import {AuthTokenError} from "./erros/AuthTokenError";

let seAtualizandoToken = false;
let filaRequisicoesFalhas = [];

export function setupAPIClient(ctx = undefined) {
	let cookies = parseCookies(ctx);
	
	const api = axios.create({
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
				cookies = parseCookies(ctx);
				
				const {'nextauth.refreshToken': refreshToken} = cookies;
				const originalConfig = error.config;
				
				if (!seAtualizandoToken) {
					seAtualizandoToken = true;
					
					api.post('/refresh', {
						refreshToken
					}).then(response => {
						const {token} = response.data;
						
						setCookie(ctx, 'nextauth.token', token, {
							maxAge: 60 * 60 * 24 * 30,
							path: '/'
						});
						setCookie(ctx, 'nextauth.refreshToken', response.data.refreshToken, {
							maxAge: 60 * 60 * 24 * 30,
							path: '/'
						});
						
						api.defaults.headers['Authorization'] = `Bearer ${token}`;
						
						filaRequisicoesFalhas.forEach(request => request.onSuccess(token));
						filaRequisicoesFalhas = [];
					}).catch(err => {
						filaRequisicoesFalhas.forEach(request => request.onFailure(err));
						filaRequisicoesFalhas = [];
						
						if(process.browser) {
							logout();
						}
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
				if(process.browser) {
					logout();
				} else {
					return Promise.reject(new AuthTokenError())
				}
			}
		}
		
		return Promise.reject(error);
	})
	
	return api;
}