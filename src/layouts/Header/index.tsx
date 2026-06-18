import { useNavigate } from 'react-router';

import type { DemoMenuItem } from '../../generated/routes';

import styles from './index.scss';

type HeaderProps = {
  menus: DemoMenuItem[];
  selectedTopLevelKey?: string;
};

const Header = ({ menus, selectedTopLevelKey }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className={styles.demoHeader}>
      <div className={styles.demoHeaderInner}>
        <div className={styles.demoHeaderBrand}>
          <h1 className={styles.demoTitle}>React Demo Lab</h1>
        </div>

        <nav aria-label="Demo sections" className={styles.demoHeaderMenu}>
          {menus.map((item) => (
            <button
              aria-current={item.key === selectedTopLevelKey ? 'page' : undefined}
              className={styles.demoHeaderMenuItem}
              key={item.key}
              onClick={() => item.path && navigate(item.path)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
