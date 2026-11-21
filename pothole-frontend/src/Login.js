import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password, role);
    if (success) {
      navigate(role === 'authority' ? '/authority-dashboard' : '/dashboard');
    } else {
      alert('Login failed!');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} required />
        <select onChange={e => setRole(e.target.value)} value={role}>
          <option value="user">User</option>
          <option value="authority">Local Authority</option>
        </select>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
