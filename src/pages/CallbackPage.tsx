import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/ui/Loading';

const CallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Autorisation refusée. Veuillez réessayer.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    if (!code) {
      setError('Code d\'autorisation manquant.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    const authenticate = async () => {
      try {
        await handleCallback(code);
        navigate('/', { replace: true });
      } catch (err) {
        setError('Échec de l\'authentification. Veuillez réessayer.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    authenticate();
  }, [searchParams, handleCallback, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-500">{error}</p>
          <p className="text-sm text-gray-400 mt-2">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  return <Loading message="Connexion en cours..." fullScreen />;
};

export default CallbackPage;
