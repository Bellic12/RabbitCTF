import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/Home';

export default function App() {
  return (

    // Define application routes

    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}