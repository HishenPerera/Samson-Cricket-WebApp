import React from 'react';
import { BrowserRouter as Router, Route, Routes as RouterRoutes, Navigate } from 'react-router-dom';
import Home from '../Pages/Home';
import SignIn from '../Pages/SignIn';
import SignUp from '../Pages/SignUp';

import Shop from '../Pages/Shop/Shop';
import ViewBats from '../Pages/Shop/ViewBats/ViewBats';
import ViewProtectionGear from '../Pages/Shop/ViewProtectionGear/ViewProtectionGear';
import ViewMerchandise from '../Pages/Shop/ViewMerchandise/ViewMerchandise';
import ViewShoes from '../Pages/Shop/ViewShoes/ViewShoes';

import PaymentForm from '../Pages/Payment/Checkout/PaymentForm';

import Coaching from '../Pages/Coaching/Coaching';
import Services from '../Pages/Services/Service';
import Consulting from '../Pages/Consulting/Consulting';

import AdminDashboard from '../Pages/Admin/AdminDashboard';
import ManageOrders from '../Pages/Admin/ManageOrders/ManageOrders';
import ManageUsers from '../Pages/Admin/ManageUsers/ManageUsers';
import ManageInventory from '../Pages/Admin/ManageInventory/ManageInventory';
import CustomerUsers from '../Pages/Admin/ManageUsers/CustomerUsers/CustomerUsers';
import AdminUsers from '../Pages/Admin/ManageUsers/AdminUsers/AdminUsers';
import ServiceUsers from '../Pages/Admin/ManageUsers/ServiceUsers/ServiceUsers';
import ManageBats from '../Pages/Admin/ManageInventory/ManageBats/ManageBats';
import ManageProtectionGear from '../Pages/Admin/ManageInventory/ManageProtection/ManageProtectionGear';
import ManageMerch from '../Pages/Admin/ManageInventory/ManageMerch/ManageMerch';
import ManageShoes from '../Pages/Admin/ManageInventory/ManageShoes/ManageShoes';

import ServiceManagerDashboard from '../Pages/ServiceManager/ServiceManagerDashboard';
import ManageRepairs from '../Pages/ServiceManager/ManageRepair/ManageRepairs';

import UserDashboard from '../Pages/UserDashboard/UserDashboard';

import ConsultantDashboard from '../Pages/Consulting/ConsultantDashboard';

import CoachingDashboard from '../Pages/Coaching/CoachingDashbaord/CoachingDashboard';
import ViewCoaches from '../Pages/Coaching/ViewCoaches/ViewCoaches';
import ManageCoaches from '../Pages/Coaching/CoachingDashbaord/ManageCoaches/ManageCoaches';


import { CartProvider } from '../context/CartContext'; // Import CartProvider
import Cart from '../Components/Cart/Cart'; // Import Cart component

import CoachDetails from '../Pages/Coaching/ViewCoaches/CoachDetails';
import AdminSessions from '../Pages/Coaching/CoachingDashbaord/ManageSessions/AdminSessions';
import UserBookings from '../Pages/Coaching/ViewCoaches/UserBookings';
import SessionReport from '../Pages/Coaching/CoachingReports/SessionReports';
import FeedbackForm from '../Pages/Coaching/CoachingDashbaord/CoachFeedbacks/FeedbackForm';
import FeedbackList from '../Pages/Coaching/CoachingDashbaord/CoachFeedbacks/FeedbackList';

const AppRoutes = () => {
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    const getUserRole = () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.role;
            } catch (error) {
                console.error('Error decoding token:', error);
                return null;
            }
        }
        return null;
    };

    const ProtectedRoute = ({ children, roles }) => {
        if (!isAuthenticated()) {
            return <Navigate to="/signIn" />;
        }
        const userRole = getUserRole();
        if (roles && !roles.includes(userRole)) {
            return <Navigate to="/" />;
        }
        return children;
    };

    return (
        <CartProvider>
            <Router>
                <RouterRoutes>
                    {/* Homepage */}
                    <Route path="/" element={<Home />} />
                    {/* Navbar */}
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/shop/bats" element={<ViewBats />} />
                    <Route path="/shop/protection-gears" element={<ViewProtectionGear />} />
                    <Route path='/shop/merchandise' element={<ViewMerchandise/>}/>
                    <Route path='/shop/shoes' element={<ViewShoes/>}/>

                    <Route path="/cart" element={<Cart />} /> {/* Cart route */}
                    <Route path="/services" element={<Services />} />
                    <Route path="/coaching" element={<Coaching />} />
                    <Route path="/ViewCoaches" element={<ViewCoaches />} />
                    <Route path="/consulting" element={<Consulting />} />
                    {/* Sign In & Sign Up */}
                    <Route path="/signIn" element={<SignIn />} />
                    <Route path="/signUp" element={<SignUp />} />
                    {/* Consulting Home Side */}
                    {/* <Route path="/batting-consulting" element={<BattingConsulting />} />
                    <Route path="/bawling-consulting" element={<BawlingConsulting />} />
                    <Route path="/fielding-consulting" element={<FieldingConsulting />} />
                    <Route path="/physical-consulting" element={<PhysicalConsulting />} /> */}

                    {/* Coaching User side */}
                    <Route path="/viewCoaches" element={<ViewCoaches />} />
                    <Route path="/coach/:id" element={<CoachDetails/>} />
                    <Route path="/mySessions" element={<UserBookings />} />
                    <Route path='/coachFeedbacks' element={<FeedbackForm/>} />
                   

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute roles={['Normal']}>
                                <PaymentForm />
                            </ProtectedRoute>
                        }
                    />

                    {/* User Dashboard */}
                    <Route
                        path="/userdashboard"
                        element={
                            <ProtectedRoute roles={['Normal']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* Admin Dashboard */}
                    <Route
                        path="/admindashboard"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-users"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ManageUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-users/customer-users"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <CustomerUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-users/admin-users"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <AdminUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-users/service-users"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ServiceUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-inventory"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ManageInventory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-inventory/manage-bats"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ManageBats />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-inventory/manage-protections"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ManageProtectionGear />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-inventory/manage-merchandise"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ManageMerch />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-inventory/manage-shoes"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ManageShoes />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admindashboard/manage-orders"
                        element={
                            <ProtectedRoute roles={['Admin']}>
                                <ManageOrders />
                            </ProtectedRoute>
                        }
                    />
                    {/* Service Manager Dashboard */}
                    <Route
                        path="/servicedashboard"
                        element={
                            <ProtectedRoute roles={['ServiceManager']}>
                                <ServiceManagerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/servicedashboard/manage-repairs"
                        element={
                            <ProtectedRoute roles={['ServiceManager']}>
                                <ManageRepairs />
                            </ProtectedRoute>
                        }
                    />
                    {/* Consulting Dashboard */}
                    <Route
                        path="/consultantdashboard"
                        element={
                            <ProtectedRoute roles={['Consultant']}>
                                <ConsultantDashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* Coaching Dashboard */}
                    <Route
                        path="/coachingdashboard"
                        element={
                            <ProtectedRoute roles={['Coach']}>
                                <CoachingDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/coachingdashboard/manage-users"
                        element={
                            <ProtectedRoute roles={['Coach']}>
                                <ManageCoaches /> {/* Add ManageCoaches here */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/coachingdashboard/manage-reports"
                        element={
                            <ProtectedRoute roles={['Coach']}>
                                <SessionReport /> {/* Add ManageCoaches here */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/coachingdashboard/manage-sessions"
                        element={
                            <ProtectedRoute roles={['Coach']}>
                                <AdminSessions/> {/* Add ManageCoaches here */}
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/coachingdashboard/manage-Feedbacks"
                        element={
                            <ProtectedRoute roles={['Coach']}>
                                <FeedbackList/> {/* Add ManageCoaches here */}
                            </ProtectedRoute>
                        }
                    />
                    {/* <Route
                        path="/mySessions"
                        element={
                            <ProtectedRoute roles={['Normal']}>
                                <UserBookings />
                            </ProtectedRoute>
                        }
                    /> */}
                </RouterRoutes>
            </Router>
        </CartProvider>
    );
};

export default AppRoutes;