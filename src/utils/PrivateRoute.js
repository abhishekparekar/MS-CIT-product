import React from "react";
import { Navigate } from "react-router-dom";

// This can be replaced with context, Redux, or Firebase Auth
const isAuthenticated = () => {
    return localStorage.getItem("token") ? true : false;
};

const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
