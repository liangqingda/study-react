import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import type { DemoMenuItem, DemoRoute } from '../../generated/routes';

import styles from './index.scss';

type SidebarProps = {
  menus: DemoMenuItem[];
  routes: DemoRoute[];
  sectionKey?: string;
  selectedRoute?: DemoRoute;
};

type SidebarMenuItemProps = {
  item: DemoMenuItem;
  onNavigate: (item: DemoMenuItem) => void;
  selectedMenuKey?: string;
};

const SidebarMenuItem = ({
  item,
  onNavigate,
  selectedMenuKey,
}: SidebarMenuItemProps) => {
  const isSelected = item.key === selectedMenuKey;
  const hasChildren = Boolean(item.children?.length);

  return (
    <li className={styles.demoSidebarItem}>
      {item.path ? (
        <button
          aria-current={isSelected ? 'page' : undefined}
          className={styles.demoSidebarLink}
          onClick={() => onNavigate(item)}
          type="button"
        >
          {item.label}
        </button>
      ) : (
        <div className={styles.demoSidebarGroupLabel}>{item.label}</div>
      )}

      {hasChildren ? (
        <ul className={`${styles.demoSidebarList} ${styles.nested}`}>
          {item.children?.map((child) => (
            <SidebarMenuItem
              item={child}
              key={child.key}
              onNavigate={onNavigate}
              selectedMenuKey={selectedMenuKey}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

const Sidebar = ({
  menus,
  routes,
  sectionKey,
  selectedRoute,
}: SidebarProps) => {
  const navigate = useNavigate();
  const routePathSet = useMemo(
    () => new Set(routes.map((route) => route.path)),
    [routes],
  );

  const handleNavigate = (item: DemoMenuItem) => {
    if (item.path && routePathSet.has(item.path)) {
      navigate(item.path);
    }
  };

  return (
    <aside className={styles.demoSidebar}>
      <nav
        aria-label="Demo pages"
        className={styles.demoSidebarScroll}
        key={sectionKey}
      >
        <ul className={styles.demoSidebarList}>
          {menus.map((item) => (
            <SidebarMenuItem
              item={item}
              key={item.key}
              onNavigate={handleNavigate}
              selectedMenuKey={selectedRoute?.menuKey}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
