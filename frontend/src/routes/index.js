import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import Dashboard from '../components/dashboard/Dashboard';
import RecordsList from '../components/records/RecordsList';
import RecordDetails from '../components/records/RecordDetails';
import RecordForm from '../components/records/RecordForm';
import FileUpload from '../components/files/FileUpload';
import Settings from '../components/settings/Settings';
import UserProfile from '../components/users/UserProfile';
import UsersList from '../components/users/UsersList';
import PrivateRoute from '../components/auth/PrivateRoute';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginForm />} />
            
            <Route path="/" element={
                <PrivateRoute>
                    <Dashboard />
                </PrivateRoute>
            } />
            
            <Route path="/records" element={
                <PrivateRoute>
                    <RecordsList />
                </PrivateRoute>
            } />
            
            <Route path="/records/:id" element={
                <PrivateRoute>
                    <RecordDetails />
                </PrivateRoute>
            } />
            
            <Route path="/records/new" element={
                <PrivateRoute>
                    <RecordForm />
                </PrivateRoute>
            } />
            
            <Route path="/upload" element={
                <PrivateRoute>
                    <FileUpload />
                </PrivateRoute>
            } />
            
            <Route path="/settings" element={
                <PrivateRoute requireAdmin>
                    <Settings />
                </PrivateRoute>
            } />
            
            <Route path="/users" element={
                <PrivateRoute requireAdmin>
                    <UsersList />
                </PrivateRoute>
            } />
            
            <Route path="/profile" element={
                <PrivateRoute>
                    <UserProfile />
                </PrivateRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes; 