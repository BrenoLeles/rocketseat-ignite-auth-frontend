import {useContext, useEffect} from "react";

import { AuthContext } from "../contexts/AuthContexts";
import { setupAPIClient } from '../services/api';
import { api } from '../services/apiClient';
import {withSSRAuth} from "../utils/withSSRAuth";

export default function Dashboard() {
	
	const { usuario } = useContext(AuthContext)
	
	useEffect(() => {
		api.get('/me')
			.then(response => console.log(response))
			.catch(error => console.log(error))

	})
	
	return (
		<h1>Dashboard { usuario?.email }</h1>
	)
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
	const apiClient = setupAPIClient(ctx);
	
	const response = await apiClient.get('/me');
	
	return {
		props: {}
	}
})