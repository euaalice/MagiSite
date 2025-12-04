import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Main from './pages/Main/index';
import Inicial from './pages/Inicial/index';
//import Produto from './pages/produto/index';
//import Sobre from './pages/sobre';

const routes = () => (
    <Router>
        <Routes>
            <Route exact path="/" render={() => {
                return(
                    <Navigate exact to="/main/"/>
                )
            }}/>
            <Route exact path="/main/" element={<Main />}/>
            <Route exact path="/inicial/" element={<Inicial />}/>
    
        </Routes>
    </Router>
);

export default routes;