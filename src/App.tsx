import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router';
import { Badge, Button, Center, Stack, Text, Title } from '@mantine/core';
import { IconArrowBackUp } from '@tabler/icons-react';

import type { ReactNode } from 'react';

import { defaultRoutePath, demoRoutes } from './generated/routes';
import BasicLayout from './layouts/BasicLayout';

type ResultViewProps = {
  action?: ReactNode;
  status: string;
  subTitle: string;
  title: string;
};

const ResultView = ({ action, status, subTitle, title }: ResultViewProps) => (
  <Center mih="calc(100vh - 56px)" p="xl">
    <Stack align="center" gap="sm" maw={640} ta="center">
      <Badge radius="xl" size="lg" variant="light">
        {status}
      </Badge>
      <Title order={1} size="h2">
        {title}
      </Title>
      <Text c="dimmed" lh={1.7}>
        {subTitle}
      </Text>
      {action}
    </Stack>
  </Center>
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
        <Button
          leftSection={<IconArrowBackUp size={18} stroke={1.8} />}
          onClick={() => navigate(defaultRoutePath)}
          type="button"
        >
          返回默认 Demo
        </Button>
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
