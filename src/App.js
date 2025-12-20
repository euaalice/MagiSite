import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Main from './pages/Main';
import Inicial from './pages/Inicial';
import Ranking from './pages/Ranking';
import Apresentacao from './pages/Apresentação';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import ValidacaoCadastro from './pages/ValidacaoCadastro';
import Perfil from './pages/Perfil';
import NavBar from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
 
const App = () => {
   return (
      <AuthProvider>
         <Routes>
            <Route path="/" element={<Apresentacao />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/validacao-cadastro" element={<ValidacaoCadastro />} />
            
            {/* Rotas protegidas - requerem login */}
            <Route path="/main/" element={
               <ProtectedRoute>
                  <Main />
               </ProtectedRoute>
            } />
            <Route path="/inicial/" element={
               <ProtectedRoute>
                  <Inicial />
               </ProtectedRoute>
            } />
            <Route path="/perfil/:tipo/:id" element={
               <ProtectedRoute>
                  <Perfil />
               </ProtectedRoute>
            } />
            <Route path="/ranking/" element={<Ranking />} />
         </Routes>
      </AuthProvider>
   );
};
 
export default App;