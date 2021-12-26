import {createContext, ReactNode, useEffect, useState} from 'react';
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';

import { api } from '../services/api';

type LoginCredenciais = {
	email: string;
	senha: string;
}

type Usuario = {
	email: string;
	permissoes: string[];
	regras: string[];
}

type AuthContestData = {
	login(credenciais: LoginCredenciais): Promise<void>;
	usuario: Usuario
	seAutenticado
}

type AuthProviderProps = {
	children: ReactNode
}

export function logout() {
	destroyCookie(undefined, 'nextauth.token');
	destroyCookie(undefined, 'nextauth.refreshToken');
	
	Router.push('/')
}

export const AuthContext = createContext({} as AuthContestData);

export function AuthProvider({children}: AuthProviderProps) {
	
	useEffect(() => {
		const { 'nextauth.token': token} = parseCookies();
		
		if (token) {
			api.get('/me').then(response => {
				const { email, permissions: permissoes, rules: regras } = response.data;
				
				setUsuario({email, permissoes, regras});
			}).catch(() => {
				logout();
			});
		}
	}, []);
	
	const [usuario, setUsuario] = useState<Usuario>(null)
	
	const seAutenticado = !!usuario;
	
	async function login({email, senha}: LoginCredenciais) {
		try {
			
			const response = await api.post('sessions', {
				email,
				password: senha
			})
			
			const {permissions:permissoes, roles: regras, token, refreshToken} = response.data;
			
			setCookie(undefined, 'nextauth.token', token, {
				maxAge: 60 * 60 * 24 * 30,
				path: '/'
			});
			setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
				maxAge: 60 * 60 * 24 * 30,
				path: '/'
			});
			
			setUsuario({
				email,
				permissoes,
				regras
			})
			
			api.defaults.headers['Authorization'] = `Bearer ${token}`;
			
			Router.push('/dashboard')
			
		} catch (err) {
			console.log(err)
		}
	}
	return (
		<AuthContext.Provider value={{login, seAutenticado, usuario}}>
			{children}
		</AuthContext.Provider>
	)
}