import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router';

import type { ReactNode } from 'react';

import { defaultRoutePath, demoRoutes } from './generated/routes';
import BasicLayout from './layouts/BasicLayout';

import styles from './App.scss';

type ResultViewProps = {
  action?: ReactNode;
  status: string;
  subTitle: string;
  title: string;
};

const ResultView = ({ action, status, subTitle, title }: ResultViewProps) => (
  <section className={styles.demoResult}>
    <div aria-hidden="true" className={styles.demoResultStatus}>
      {status}
    </div>
    <h1>{title}</h1>
    <p>{subTitle}</p>
    {action ? <div className={styles.demoResultAction}>{action}</div> : null}
  </section>
);

const EmptyRoutes = () => (
  <ResultView
    status="INFO"
    subTitle="在 src/pages 下添加 index.tsx 后，执行 pnpm gen:routes 即可生成菜单和路由。"
    title="还没有 demo 页面"
  />
);

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <ResultView
      action={
        <button
          className={styles.demoPrimaryButton}
          onClick={() => navigate(defaultRoutePath)}
          type="button"
        >
          返回默认 Demo
        </button>
      }
      status="404"
      subTitle="当前地址没有匹配到 demo 页面。"
      title="页面不存在"
    />
  );
};

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
