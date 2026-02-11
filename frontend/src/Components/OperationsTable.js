import React, { useState } from 'react';

function OperationsTable({ operations, searchTerm, onDeleteOperation, onEditOperation }) {
  const [sortConfig, setSortConfig] = useState({ 
    key: 'date_operation', 
    direction: 'descending' 
  });

  // Filtrer les opérations
  const filteredOperations = operations.filter(op => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      (op.nom && op.nom.toLowerCase().includes(term)) ||
      (op.motif && op.motif.toLowerCase().includes(term)) ||
      (op.description && op.description.toLowerCase().includes(term)) ||
      (op.type && op.type.toLowerCase().includes(term)) ||
      (op.montant && op.montant.toString().includes(term))
    );
  });

  // Trier les opérations
  const sortedOperations = [...filteredOperations].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Gérer les dates
    if (sortConfig.key === 'date_operation') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }
    
    // Gérer les nombres
    if (sortConfig.key === 'montant') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }
    
    // Gérer les chaînes
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '⇅';
    return sortConfig.direction === 'ascending' ? '▲' : '▼';
  };

  // Calculer les totaux
  const totalEntrees = sortedOperations
    .filter(op => op.type === 'entree')
    .reduce((sum, op) => sum + (parseFloat(op.montant) || 0), 0);
    
  const totalSorties = sortedOperations
    .filter(op => op.type === 'sortie')
    .reduce((sum, op) => sum + (parseFloat(op.montant) || 0), 0);
    
  const montantTotal = totalEntrees - totalSorties;

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
      onDeleteOperation(id);
    }
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <div>
          <strong>Résultats: {sortedOperations.length} opération(s)</strong>
          {searchTerm && (
            <span className="search-term">
              Recherche: "{searchTerm}"
            </span>
          )}
        </div>
        <div className="sort-info">
          Tri: <strong>{sortConfig.key}</strong> ({sortConfig.direction === 'ascending' ? 'croissant' : 'décroissant'})
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th onClick={() => requestSort('nom')} className="sortable">
                Nom {getSortIcon('nom')}
              </th>
              <th onClick={() => requestSort('type')} className="sortable">
                Type {getSortIcon('type')}
              </th>
              <th onClick={() => requestSort('montant')} className="sortable">
                Montant {getSortIcon('montant')}
              </th>
              <th onClick={() => requestSort('motif')} className="sortable">
                Motif {getSortIcon('motif')}
              </th>
              <th onClick={() => requestSort('date_operation')} className="sortable">
                Date {getSortIcon('date_operation')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedOperations.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-table">
                  {searchTerm ? (
                    <>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>🔍</div>
                      <div>Aucune opération trouvée pour "{searchTerm}"</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '48px', marginBottom: '10px' }}>📋</div>
                      <div>Aucune opération enregistrée</div>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              sortedOperations.map((operation) => (
                <tr key={operation.id}>
                  <td className="operation-name">{operation.nom || 'N/A'}</td>
                  <td>
                    <span className={`type-badge type-${operation.type}`}>
                      {operation.type}
                    </span>
                  </td>
                  <td className={`amount ${operation.type}`}>
                    {operation.type === 'entree' ? '+' : '-'} {operation.montant?.toFixed(2)} MAD
                  </td>
                  <td>{operation.motif || 'N/A'}</td>
                  <td>
                    {operation.date_operation ? 
                      new Date(operation.date_operation).toLocaleDateString('fr-FR') : 
                      'N/A'
                    }
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => onEditOperation(operation)}
                      title="Modifier"
                    >
                      Modifier
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(operation.id)}
                      title="Supprimer"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="table-footer">
              <td colSpan="2">
                <div className="total-item">
                  <span>Total Entrées:</span>
                  <span className="total-entree">+{totalEntrees.toFixed(2)} MAD</span>
                </div>
              </td>
              <td colSpan="2">
                <div className="total-item">
                  <span>Total Sorties:</span>
                  <span className="total-sortie">-{totalSorties.toFixed(2)} MAD</span>
                </div>
              </td>
              <td colSpan="2">
                <div className="total-item">
                  <span>Montant Total:</span>
                  <span className={`total-amount ${montantTotal >= 0 ? 'positive' : 'negative'}`}>
                    {montantTotal >= 0 ? '+' : ''}{montantTotal.toFixed(2)} MAD
                  </span>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export default OperationsTable;