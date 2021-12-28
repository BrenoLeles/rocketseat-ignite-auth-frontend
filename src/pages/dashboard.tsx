import {useContext, useEffect} from "react";

import { AuthContext, logout } from "../contexts/AuthContexts";
import { setupAPIClient } from '../services/api';
import { api } from '../services/apiClient';
import {withSSRAuth} from "../utils/withSSRAuth";
import {useCan} from "../hooks/useCan";
import {Can} from "../components/Can";

export default function Dashboard() {
	
	const { usuario } = useContext(AuthContext)
	
	const usuarioPodeVerMetricas = useCan({
		permissoes: ['metrics.list']
	})
	
	useEffect(() => {
		api.get('/me')
			.then(response => console.log(response))
			.catch(error => console.log(error))

	})
	
	return (
		<>
			<h1>Dashboard { usuario?.email }</h1>
			
			<button onClick={logout}>Logout</button>
			
			<Can permissoes={['metrics.list']}>
				<h3>Métricas</h3>
			</Can>
		</>
	)
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
	const apiClient = setupAPIClient(ctx);
	
	const response = await apiClient.get('/me');
	
	return {
		props: {}
	}
})