import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Main from './pages/Main';
import Inicial from './pages/Inicial';
import Ranking from './pages/Ranking';
import Apresentacao from './pages/Apresentação';
import Login from './pages/Login';
import AuthCallback from './pages/AuthCallback';
import NavBar from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
 
const App = () => {
   return (
      <AuthProvider>
         <NavBar />

         <Routes>
            <Route path="/" element={<Apresentacao />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            
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
            <Route path="/ranking/" element={<Ranking />} />
         </Routes>
      </AuthProvider>
   );
};
 
export default App;