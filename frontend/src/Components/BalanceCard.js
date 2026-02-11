import React, { useState, useEffect } from 'react';

function BalanceCard() {
  const [montantTotal, setMontantTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Calculer le total depuis localStorage
  const calculateTotal = () => {
    try {
      const operations = JSON.parse(localStorage.getItem('operations') || '[]');
      const totalEntrees = operations
        .filter(op => op.type === 'entree')
        .reduce((sum, op) => sum + (op.montant || 0), 0);
      const totalSorties = operations
        .filter(op => op.type === 'sortie')
        .reduce((sum, op) => sum + (op.montant || 0), 0);
      return totalEntrees - totalSorties;
    } catch (err) {
      console.error('Error calculating total:', err);
      return 0;
    }
  };

  const fetchMontantTotal = () => {
    setLoading(true);
    // Simuler appel API
    setTimeout(() => {
      const total = calculateTotal();
      setMontantTotal(total);
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    fetchMontantTotal();
    
    // Écouter les changements
    const handleStorageChange = () => {
      fetchMontantTotal();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('operationChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('operationChange', handleStorageChange);
    };
  }, []);

  // Actualiser toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(fetchMontantTotal, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <h3> Montant Total</h3>
      <div className={`balance ${montantTotal >= 0 ? 'positive' : 'negative'}`}>
        {loading ? (
          <div className="loading"></div>
        ) : (
          `${montantTotal.toFixed(2)} MAD`
        )}
      </div>
      <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '0' }}>
        {montantTotal >= 0 ? 'Solde positif' : 'Solde négatif'}
        <span style={{ 
          display: 'block', 
          marginTop: '5px',
          fontSize: '12px'
        }}>
          Dernière mise à jour: {new Date().toLocaleTimeString()}
        </span>
      </p>
      <button 
        className="btn btn-secondary" 
        onClick={fetchMontantTotal}
        style={{ marginTop: '15px', width: '100%' }}
        disabled={loading}
      >
        {loading ? 'Chargement...' : 'Actualiser Montant Total'}
      </button>
    </div>
  );
}

export default BalanceCard;