import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Por favor completa todos los campos');
            return;
        }

        setIsLoading(true);
        try {
            const success = await login(email, password);
            if (success) {
                navigate('/admin/inventory');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <div className="icon-wrapper">
                        <Lock size={32} />
                    </div>
                    <h1>Admin Portal</h1>
                    <p>Bienvenido de nuevo al centro de control</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                id="email"
                                type="email"
                                placeholder="admin@elishop.ec"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Verificando...
                            </>
                        ) : (
                            'Entrar al Sistema'
                        )}
                    </button>
                </form>
            </div>

            <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0f1115;
          background-image: 
            radial-gradient(at 0% 0%, rgba(236, 72, 153, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0px, transparent 50%);
          padding: 1rem;
        }

        .login-card {
          background: #181b21;
          padding: 3rem;
          border-radius: 1.5rem;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid #2d323b;
          width: 100%;
          max-width: 440px;
          backdrop-filter: blur(10px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .icon-wrapper {
          width: 70px;
          height: 70px;
          background: rgba(236, 72, 153, 0.1);
          color: #ec4899;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.2);
        }

        .login-header h1 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .login-header p {
          color: #94a3b8;
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #cbd5e1;
          margin-left: 0.25rem;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          transition: color 0.2s;
        }

        .input-wrapper input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: #0f1115;
          border: 1px solid #2d323b;
          border-radius: 0.75rem;
          font-size: 0.95rem;
          color: #f8fafc;
          transition: all 0.2s ease;
        }

        .input-wrapper input:focus {
          outline: none;
          border-color: #ec4899;
          box-shadow: 0 0 0 2px rgba(236, 72, 153, 0.2);
        }

        .input-wrapper input:focus + .input-icon,
        .input-wrapper:focus-within .input-icon {
          color: #ec4899;
        }

        .login-btn {
          background: linear-gradient(135deg, #ec4899 0%, #be185d 100%);
          color: white;
          padding: 0.875rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(236, 72, 153, 0.3);
          margin-top: 0.5rem;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(236, 72, 153, 0.4);
        }
        
        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default AdminLogin;
