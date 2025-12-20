import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Main from './pages/Main/index';
import Inicial from './pages/Inicial/index';
import Perfil from './pages/Perfil/index';
//import Produto from './pages/produto/index';
//import Sobre from './pages/sobre';

const routes = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Navigate to="/main/" replace />} />
            <Route path="/main/" element={<Main />} />
            <Route path="/inicial/" element={<Inicial />} />
            <Route path="/perfil/:tipo/:id" element={<Perfil />} />
        </Routes>
    </Router>
);

export default routes;