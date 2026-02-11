import React, { useState, useEffect } from 'react';
import SearchBar from '../Components/SearchBar';
import Buttons from '../Components/Buttons';
import OperationsTable from '../Components/OperationsTable';
import BalanceCard from '../Components/BalanceCard';
import EditOperationModal from '../Components/EditOperationModal';

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Charger les opérations
  const loadOperations = () => {
    try {
      const savedOperations = JSON.parse(localStorage.getItem('operations') || '[]');
      
      // Trier par date (plus récent d'abord)
      const sortedOperations = savedOperations.sort((a, b) => 
        new Date(b.date_operation || b.created_at) - new Date(a.date_operation || a.created_at)
      );
      
      setOperations(sortedOperations);
    } catch (err) {
      console.error('Error loading operations:', err);
      setOperations([]);
    }
  };

  useEffect(() => {
    loadOperations();
    
    // **CORRECTION ICI:** Écouter l'événement "operationsUpdated"
    const handleOperationsUpdated = () => {
      console.log('Événement reçu: operationsUpdated');
      loadOperations();
    };
    
    window.addEventListener('operationsUpdated', handleOperationsUpdated);
    
    // Écouter aussi les changements de localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'operations') {
        loadOperations();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('operationsUpdated', handleOperationsUpdated);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Supprimer une opération
  const handleDeleteOperation = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
      const updatedOperations = operations.filter(op => op.id !== id);
      setOperations(updatedOperations);
      localStorage.setItem('operations', JSON.stringify(updatedOperations));
      
      // Déclencher la mise à jour du solde
      window.dispatchEvent(new Event('operationChange'));
      
      alert('Opération supprimée avec succès');
    }
  };

  // Modifier une opération
  const handleEditOperation = (operation) => {
    setEditingOperation(operation);
    setShowEditModal(true);
  };

  const handleUpdateOperation = (updatedOperation) => {
    const updatedOperations = operations.map(op => 
      op.id === updatedOperation.id ? updatedOperation : op
    );
    
    setOperations(updatedOperations);
    localStorage.setItem('operations', JSON.stringify(updatedOperations));
    
    // Déclencher la mise à jour du solde
    window.dispatchEvent(new Event('operationChange'));
    
    setShowEditModal(false);
    setEditingOperation(null);
    alert('Opération modifiée avec succès');
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingOperation(null);
  };

  // **AJOUTER: Fonction pour tester manuellement**
  const testAddOperation = () => {
    const testOperation = {
      id: Date.now(),
      type: 'entree',
      nom: 'Test d\'opération',
      motif: 'Test de fonctionnement',
      montant: 100.50,
      description: 'Ceci est un test',
      date_operation: new Date().toISOString(),
      utilisateur_nom: 'Test User',
      created_at: new Date().toISOString()
    };
    
    const existing = JSON.parse(localStorage.getItem('operations') || '[]');
    const updated = [...existing, testOperation];
    localStorage.setItem('operations', JSON.stringify(updated));
    
    loadOperations();
    alert('Test opération ajoutée!');
  };

  return (
    <div className="container">
      <div className="header">
        <div>
          <h1> Gestion de Caisse</h1>
          <div style={{ 
            color: '#3498db', 
            fontSize: '14px',
            marginTop: '5px'
          }}>
            Total: {operations.length} opération(s)
          </div>
        </div>
        <div style={{ color: '#7f8c8d', fontSize: '14px' }}>
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

   

      <div className="content">
        <div className="main-content">
          <SearchBar 
            value={searchTerm} 
            onChange={setSearchTerm}
            placeholder="Rechercher par nom, motif, montant..."
          />
          
          <Buttons />
          
          <div style={{ position: 'relative', minHeight: '200px' }}>
            {loading ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
              }}>
                <div className="loading" style={{ width: '40px', height: '40px' }}></div>
              </div>
            ) : (
              <OperationsTable 
                operations={operations} 
                searchTerm={searchTerm}
                onDeleteOperation={handleDeleteOperation}
                onEditOperation={handleEditOperation}
              />
            )}
          </div>
        </div>

        <div>
          <BalanceCard />
          
          <div className="card" style={{ marginTop: '20px' }}>
            <h3> Statistiques</h3>
            <div style={{ marginTop: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Opérations aujourd'hui:</span>
                <strong>{operations.filter(op => 
                  new Date(op.date_operation).toDateString() === new Date().toDateString()
                ).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Total ce mois:</span>
                <strong>{operations.filter(op => 
                  new Date(op.date_operation).getMonth() === new Date().getMonth() &&
                  new Date(op.date_operation).getFullYear() === new Date().getFullYear()
                ).length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Total opérations:</span>
                <strong>{operations.length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de modification */}
      {showEditModal && (
        <EditOperationModal
          operation={editingOperation}
          onUpdate={handleUpdateOperation}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

export default HomePage;