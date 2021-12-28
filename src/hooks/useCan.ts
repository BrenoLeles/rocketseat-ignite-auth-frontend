import {useContext} from "react";
import {AuthContext} from "../contexts/AuthContexts";
import {validateUserPermissions} from "../utils/validateUserPermissions";


type UseCanParams = {
	permissoes?: string[];
	regras?: string[];
}

export function useCan({ permissoes, regras }: UseCanParams) {
	const { usuario, seAutenticado} = useContext(AuthContext);
	
	if(!seAutenticado) {
		return false;
	}
	
	const usuarioPossuiPermissoes = validateUserPermissions({
		usuario,
		permissoes,
		regras
	})
	
	return usuarioPossuiPermissoes;
}