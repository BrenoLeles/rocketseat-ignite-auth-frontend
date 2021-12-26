import {useContext, useEffect} from "react";

import { AuthContext } from "../contexts/AuthContexts";
import { api } from '../services/api';

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