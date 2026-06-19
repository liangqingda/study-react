import { useNavigate } from 'react-router';
import { Group, SegmentedControl, ThemeIcon, Title } from '@mantine/core';
import { IconBrandReact } from '@tabler/icons-react';

import type { DemoMenuItem } from '../../generated/routes';

import styles from './index.scss';

type HeaderProps = {
  menus: DemoMenuItem[];
  selectedTopLevelKey?: string;
};

const Header = ({ menus, selectedTopLevelKey }: HeaderProps) => {
  const navigate = useNavigate();
  const activeMenuKey = selectedTopLevelKey ?? menus[0]?.key;
  const menuData = menus.map((item) => ({
    label: item.label,
    value: item.key,
  }));

  const handleMenuChange = (value: string) => {
    const nextMenu = menus.find((item) => item.key === value);

    if (nextMenu?.path) {
      navigate(nextMenu.path);
    }
  };

  return (
    <Group className={styles.demoHeaderInner} gap="lg" h="100%" wrap="nowrap">
      <Group className={styles.demoHeaderBrand} gap="sm" wrap="nowrap">
        <ThemeIcon radius="md" size={34} variant="light">
          <IconBrandReact size={21} stroke={1.8} />
        </ThemeIcon>
        <Title className={styles.demoTitle} order={1}>
          React Demo Lab
        </Title>
      </Group>

      {activeMenuKey && menuData.length > 0 ? (
        <nav aria-label="Demo sections" className={styles.demoHeaderMenu}>
          <SegmentedControl
            className={styles.demoHeaderSegments}
            color="blue"
            data={menuData}
            onChange={handleMenuChange}
            radius="md"
            size="sm"
            value={activeMenuKey}
          />
        </nav>
      ) : null}
    </Group>
  );
};

export default Header;
