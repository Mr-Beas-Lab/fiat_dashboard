import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Users, UserPlus, List, ChevronRight, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/button';
import AdminList from '../components/superAdmin/AdminList';
import AdminForm from '../components/superAdmin/AdminForm';
import { useAuth } from '../context/AuthContext';
import AdminDetails from '../components/superAdmin/AdminDetails';

const SuperAdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <div className="w-64 shadow-md bg-black border-r border-gray-800 p-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Super Admin</h2>
          <p className="text-sm text-gray-400">{currentUser?.email}</p>
        </div>
        
        <nav className="space-y-2">
          <Link to="/superadmin-dashboard">
            <Button 
              variant={location.pathname === '/superadmin-dashboard' ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </Link>
          <Link to="/superadmin-dashboard/admins">
            <Button 
              variant={location.pathname.includes('/superadmin-dashboard/admins') && !location.pathname.includes('/admins/new') ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Admins
            </Button>
          </Link>
          <Link to="/superadmin-dashboard/admins/new">
            <Button 
              variant={location.pathname === '/superadmin-dashboard/admins/new' ? 'default' : 'ghost'} 
              className="w-full justify-start text-white hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Admin
            </Button>
          </Link>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-950">
        <Routes>
          <Route index element={<SuperAdminHome />} />
          <Route path="admins" element={<AdminList />} />
          <Route path="admins/new" element={<AdminForm />} />
          <Route path="admins/:adminId" element={<AdminDetails />} />
          <Route path="admins/edit/:adminId" element={<EditAdminWrapper />} />
        </Routes>
      </div>
    </div>
  );
};

// Home component for the dashboard
const SuperAdminHome: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Super Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Admin Management</h2>
              <p className="text-sm text-gray-400">Manage admin users</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-700 text-white hover:bg-gray-800"
            onClick={() => navigate('/superadmin-dashboard/admins')}
          >
            View All Admins
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="bg-black border border-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Create New Admin</h2>
              <p className="text-sm text-gray-400">Add a new admin user</p>
            </div>
            <UserPlus className="h-8 w-8 text-green-500" />
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-between border-gray-700 text-white hover:bg-gray-800"
            onClick={() => navigate('/superadmin-dashboard/admins/new')}
          >
            Add Admin
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Wrapper for the Edit Admin component
const EditAdminWrapper: React.FC = () => {
  const { adminId } = useParams();
  return <AdminForm adminId={adminId} />;
};

export default SuperAdminDashboard;