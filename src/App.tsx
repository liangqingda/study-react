import { BrowserRouter, Navigate, Route, Routes } from 'react-router';

import { defaultRoutePath, demoRoutes } from './generated/routes';
import BasicLayout from './layouts/BasicLayout';
import EmptyRoutes from './pages/errors/EmptyRoutes';
import NotFound from './pages/errors/NotFound';

const DemoRoutes = () => {
  if (demoRoutes.length === 0) {
    return <EmptyRoutes />;
  }

  return (
    <Routes>
      <Route element={<Navigate replace to={defaultRoutePath} />} path="/" />
      {demoRoutes.map(({ Component, path }) => (
        <Route element={<Component />} key={path} path={path} />
      ))}
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <BasicLayout>
      <DemoRoutes />
    </BasicLayout>
  </BrowserRouter>
);

export default App;
