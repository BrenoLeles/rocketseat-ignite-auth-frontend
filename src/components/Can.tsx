import {ReactNode} from "react";
import {useCan} from "../hooks/useCan";


interface CanProps {
	children: ReactNode;
	permissoes?: string[];
	regras?: string[];
}

export function Can({ children, permissoes, regras}: CanProps) {
	const usuarioPodeVerComponente = useCan({permissoes, regras});
	
	if(!usuarioPodeVerComponente) {
		return null;
	}
	
	return (
		<>
			{children}
		</>
	)
}