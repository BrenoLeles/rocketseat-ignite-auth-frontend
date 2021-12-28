type Usuario = {
	permissoes: string[];
	regras: string[];
}

type ValidateUserPermissionsParams = {
	usuario?: Usuario;
	permissoes?: string[];
	regras?: string[];
}

export function validateUserPermissions({ usuario, permissoes, regras }: ValidateUserPermissionsParams) {
	console.log(usuario);
	if (permissoes?.length > 0) {
		const possuiTodasPermissoes = permissoes.some(permissao => {
			return usuario.permissoes.includes(permissao);
		});
		
		if(!possuiTodasPermissoes) {
			return false;
		}
	}
	
	if (regras?.length > 0) {
		const possuiTodasRegras = regras.every(regra => {
			return usuario.regras.includes(regra);
		});
		
		if(!possuiTodasRegras) {
			return false;
		}
	}
	
	return true;
}