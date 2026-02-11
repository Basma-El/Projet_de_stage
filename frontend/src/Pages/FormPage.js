import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function FormPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    montant: '',
    motif: '',
    description: '',
    nom: '',
    date_operation: new Date().toISOString().split('T')[0],
    document: null,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      document: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.montant || parseFloat(formData.montant) <= 0) {
        throw new Error('Montant invalide');
      }
      if (!formData.motif.trim()) {
        throw new Error('Veuillez saisir un motif');
      }
      if (!formData.nom.trim()) {
        throw new Error('Veuillez saisir un nom');
      }

      // Récupérer l'utilisateur actuel
      const currentUser = JSON.parse(localStorage.getItem('user')) || {};
      
      // Créer la nouvelle opération
      const newOperation = {
        id: Date.now(), // ID unique
        type: type,
        montant: parseFloat(formData.montant),
        motif: formData.motif,
        nom: formData.nom,
        description: formData.description,
        date_operation: formData.date_operation + 'T' + new Date().toTimeString().split(' ')[0],
        utilisateur_nom: currentUser.nom_complet || 'Utilisateur',
        utilisateur_id: currentUser.id || 1,
        created_at: new Date().toISOString()
      };

      // Simuler délai API
      await new Promise(resolve => setTimeout(resolve, 500));

      // **CORRECTION ICI:** Sauvegarder directement dans localStorage
      const existingOperations = JSON.parse(localStorage.getItem('operations') || '[]');
      const updatedOperations = [...existingOperations, newOperation];
      localStorage.setItem('operations', JSON.stringify(updatedOperations));

      // **CORRECTION ICI:** Déclencher l'événement pour rafraîchir HomePage
      window.dispatchEvent(new CustomEvent('operationsUpdated', {
        detail: { operation: newOperation }
      }));

      setSuccess('✅ Opération enregistrée avec succès!');
      
      // Réinitialiser le formulaire
      setFormData({
        montant: '',
        motif: '',
        description: '',
        nom: '',
        date_operation: new Date().toISOString().split('T')[0],
        document: null,
      });

      // Redirection après 1.5 secondes
      setTimeout(() => {
        navigate('/');
      }, 1500);

    } catch (err) {
      setError('❌ ' + (err.message || 'Une erreur est survenue'));
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>{type === 'entree' ? 'Nouvelle Entrée' : 'Nouvelle Sortie'}</h1>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
          style={{ fontSize: '14px' }}
        >
          ← Retour à l'accueil
        </button>
      </div>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              <strong>Erreur:</strong> {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success">
              <strong>Succès:</strong> {success}
              <div style={{ marginTop: '10px', fontSize: '14px' }}>
                Redirection vers l'accueil...
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="date_operation">Date de l'opération:</label>
            <input
              type="date"
              id="date_operation"
              name="date_operation"
              value={formData.date_operation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nom">Nom :*</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Saise votre nom"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="motif">Motif:*</label>
            <input
              type="text"
              id="motif"
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              placeholder="Saisissez le motif de l'opération..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="montant">
              Montant (MAD):* <span style={{ color: type === 'entree' ? '#27ae60' : '#e74c3c' }}>
                {type === 'entree' ? '+' : '-'}
              </span>
            </label>
            <input
              type="number"
              id="montant"
              name="montant"
              value={formData.montant}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optionnel):</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Ajouter une description détaillée..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="document">Document (optionnel):</label>
            <input
              type="file"
              id="document"
              name="document"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <small style={{ color: '#7f8c8d', display: 'block', marginTop: '5px' }}>
              Formats acceptés: PDF, JPG, PNG (max 10MB)
            </small>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button
              type="submit"
              className={`btn ${type === 'entree' ? 'btn-success' : 'btn-danger'}`}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? (
                <>
                  <div className="loading" style={{ width: '16px', height: '16px' }}></div>
                  Enregistrement...
                </>
              ) : (
                `Enregistrer ${type === 'entree' ? 'Entrée' : 'Sortie'}`
              )}
            </button>
            
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              style={{ flex: 1 }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default FormPage;