import {destroyCookie, parseCookies} from "nookies";
import {GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult} from "next";
import {AuthTokenError} from "../services/erros/AuthTokenError";
import decode from 'jwt-decode';
import {validateUserPermissions} from "./validateUserPermissions";

type WithSSRAuthOptions = {
	permissoes?: string[];
	regras?: string[];
}

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions):GetServerSideProps {
	return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
		
		const cookies = parseCookies(ctx);
		const token = cookies['nextauth.token'];
		
		if (!token) {
			return {
				redirect: {
					destination: '/',
					permanent: false
				}
			}
		}
		
		if(options) {
			
			const usuario = decode<{permissions: string[], permissoes: string[], roles: string[], regras: string[]}>(token);
			usuario.permissoes = usuario.permissions;
			usuario.regras = usuario.roles;
			const { permissoes, regras } = options;
			
			const usuarioPossuiPermissoes = validateUserPermissions({
				usuario,
				permissoes,
				regras
			});
			
			if(!usuarioPossuiPermissoes) {
				return {
					redirect: {
						destination: '/dashboard',
						permanent: false
					}
				}
			}
		}
		
		try {
			return await fn(ctx);
		} catch (err) {
			if ( err instanceof AuthTokenError) {
				destroyCookie(ctx, 'nextauth.token');
				destroyCookie(ctx, 'nextauth.refreshToken');
				
				return {
					redirect: {
						destination: '/',
						permanent: false
					}
				}
			}
		}
	}
}