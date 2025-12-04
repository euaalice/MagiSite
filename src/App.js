import { Routes, Route } from 'react-router-dom';
import Main from './pages/Main';
import Inicial from './pages/Inicial';
import Ranking from './pages/Ranking';
import Apresentacao from './pages/Apresentação';
import NavBar from './components/Header'
 
const App = () => {
   return (
      <>
        <NavBar />

         <Routes>
            <Route path="/" element={<Apresentacao />} />
            <Route path="/main/" element={<Main />} />
            <Route path="/inicial/" element={<Inicial />} />
            <Route path="/ranking/" element={<Ranking />} />
         </Routes>
      </>
   );
};
 
export default App;