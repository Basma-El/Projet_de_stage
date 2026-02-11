import React, { useState } from 'react';
import LoginForm from '../Components/LoginForm';

function LoginPage({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError('');
    
    try {
      // Vérifier les identifiants
      const validUsers = [
        { username: 'basma', password: 'Hjbh454byh6', nom_complet: 'Administrateur Basma' },
        { username: 'admin', password: 'admin123', nom_complet: 'Administrateur' },
      ];
      
      const user = validUsers.find(u => 
        u.username === credentials.username && 
        u.password === credentials.password
      );
      
      if (user) {
        // Simuler délai API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Stocker les infos utilisateur
        localStorage.setItem('user', JSON.stringify({
          id: user.username === 'basma' ? 1 : 2,
          username: user.username,
          nom_complet: user.nom_complet,
          isAuthenticated: true
        }));
        
        // Appeler le handler parent
        onLogin(user);
      } else {
        throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1> Gestion de Caisse</h1>
          <p>Veuillez vous connecter pour accéder au système</p>
        </div>
        
        <LoginForm 
          onSubmit={handleLogin} 
          loading={loading} 
          error={error}
        />
        
      
      </div>
    </div>
  );
}

export default LoginPage;