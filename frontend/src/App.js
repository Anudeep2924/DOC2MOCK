import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes, 
  Route,
  useNavigate,
  useLocation
} from 'react-router-dom';
import Home from './components/Home';
import Signup from './components/Signup';
import Login from './components/Login';
import Layout from './components/Layout';
import './App.css';
import TeacherDash from './components/TeacherDash';
import MockTest from './components/MockTest';
import PdfReader from './components/PdfReader';
import CreateTest from './components/CreateTest';
import OCRComponent from './components/OCRComponent';
import WordReader from './components/WordReader';
import Keyword from './components/Keyword-1';
import TestFinal from './components/TestFinal';
import EnterCode from './components/EnterCode';
import MyTest from './components/MyTest';
import Analytics from './components/Analytics';
import NotFoundPage from './components/NotFoundPage';

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userType = localStorage.getItem("userType");
        setUserRole(userType);
      } catch (error) {
        console.error("Error decoding token:", error);
        setUserRole(null);
      }
    } else {
      setUserRole(null);
    }
    setLoading(false); // Set loading to false once userRole is determined
  }, [location.pathname]);

  useEffect(() => {
    if (loading) return; // Wait until loading is false

    const publicRoutes = ['/', '/login', '/signup'];
    const teacherRoutes = ['/teacher', '/createtest', '/keyword', '/testfinal', '/analytics', '/pdfreader', '/imagereader', '/wordreader'];
    const studentRoutes = ['/mocktest', '/enterCode', '/mytests'];

    const isPublicRoute = publicRoutes.includes(location.pathname);
    const isTeacherRoute = teacherRoutes.some(route => location.pathname.startsWith(route));
    const isStudentRoute = studentRoutes.some(route => location.pathname.startsWith(route));

    if (userRole === null && !isPublicRoute) {
      navigate('/');
    } else if (userRole === 'teacher' && isStudentRoute) {
      navigate('/');
    } else if (userRole === 'student' && isTeacherRoute) {
      navigate('/');
    }
  }, [userRole, location.pathname, navigate, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
      </Route>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      {userRole === 'teacher' && (
        <>
          <Route element={<Layout />}>
            <Route path='/teacher' element={<TeacherDash />} />
            <Route path='/createtest' element={<CreateTest />} />
            <Route path='/keyword' element={<Keyword />} />
            <Route path='/analytics/:uniqueCode' element={<Analytics />} />
            <Route path='/pdfreader' element={<PdfReader />} />
            <Route path='/imagereader' element={<OCRComponent />} />
            <Route path='/wordreader' element={<WordReader />} />
          </Route>
          <Route path='/testfinal' element={<TestFinal />} />
        </>
      )}
      {userRole === 'student' && (
        <>
          <Route element={<Layout />}>
            <Route path='/enterCode' element={<EnterCode />} />
            <Route path='/mytests' element={<MyTest />} />
          </Route>
          <Route path='/mocktest/:uniqueCode' element={<MockTest />} />
        </>
      )}
        <Route path='*' element={<NotFoundPage />} />
        
    </Routes>
  );
}

export default App;
