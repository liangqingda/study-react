import { useMemo } from 'react';
import { useLocation } from 'react-router';

import type { ReactNode } from 'react';

import {
  demoRoutes,
  headerMenus,
  sidebarMenusByTopLevel,
} from '../../generated/routes';
import Header from '../Header';
import Sidebar from '../Sidebar';

import styles from './index.scss';

type BasicLayoutProps = {
  children: ReactNode;
};

const BasicLayout = ({ children }: BasicLayoutProps) => {
  const location = useLocation();
  const selectedRoute = useMemo(
    () => demoRoutes.find((route) => route.path === location.pathname),
    [location.pathname],
  );
  const selectedTopLevelKey = selectedRoute?.topLevelKey ?? headerMenus[0]?.key;
  const sidebarMenus = selectedTopLevelKey
    ? (sidebarMenusByTopLevel[selectedTopLevelKey] ?? [])
    : [];

  return (
    <div className={styles.demoApp}>
      <Header
        menus={headerMenus}
        selectedTopLevelKey={selectedTopLevelKey}
      />

      <div className={styles.demoBody}>
        <Sidebar
          menus={sidebarMenus}
          routes={demoRoutes}
          sectionKey={selectedTopLevelKey}
          selectedRoute={selectedRoute}
        />

        <div className={styles.demoMain}>{children}</div>
      </div>
    </div>
  );
};

export default BasicLayout;
