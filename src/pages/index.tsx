import {FormEvent, useContext, useState} from "react";

import {ContainerForm} from '../styles/home';
import {AuthContext} from "../contexts/AuthContexts";

export default function Home() {
  
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  const { login } = useContext(AuthContext)
  
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    
    const data = {
      email,
      senha
    }
    
    await login(data);
  }
  
  return (
    <ContainerForm onSubmit={handleSubmit}>
      <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)}/>
      <input type="password" name="senha" value={senha} onChange={e => setSenha(e.target.value)}/>
      <button type="submit">Entrar</button>
    </ContainerForm>
  )
}
