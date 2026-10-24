import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/Layout/Layout';
import { HomePage } from '../pages/HomePage/HomePage';
import { UnitPage } from '../pages/UnitPage/UnitPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="unit/:unitId" element={<UnitPage />} />
        <Route path="unit/:unitId/topic/:topicId" element={<UnitPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
