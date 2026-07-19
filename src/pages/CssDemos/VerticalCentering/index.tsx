import {
  Badge,
  Card,
  Code,
  Container,
  Group,
  Kbd,
  List,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlignBoxCenterMiddle,
  IconArrowsMoveVertical,
  IconBoxModel,
  IconCode,
  IconLayoutAlignMiddle,
  IconLayoutGrid,
  IconStack2,
  IconTable,
  IconTextSize,
  IconTransform,
} from '@tabler/icons-react';

import type { ReactNode } from 'react';

import styles from './index.scss';

type CenteringMethod = {
  accent: string;
  code: string;
  icon: ReactNode;
  note: string;
  previewClassName: string;
  previewHint: string;
  title: string;
  usage: string;
  variant?: 'single-line' | 'table';
};

const centeringMethods: CenteringMethod[] = [
  {
    accent: 'blue',
    code: `.parent {
  display: flex;
  align-items: center;
  justify-content: center;
}`,
    icon: <IconStack2 size={20} stroke={1.8} />,
    note: '子元素尺寸未知、数量可变时优先考虑，横向和纵向对齐都稳定。',
    previewClassName: styles.previewFlex,
    previewHint: '弹性容器',
    title: 'Flexbox',
    usage: '通用布局',
  },
  {
    accent: 'teal',
    code: `.parent {
  display: grid;
  place-items: center;
}`,
    icon: <IconLayoutGrid size={20} stroke={1.8} />,
    note: '只有一个核心内容块时最简洁，place-items 同时处理两个轴。',
    previewClassName: styles.previewGrid,
    previewHint: '网格居中',
    title: 'Grid place-items',
    usage: '单块内容',
  },
  {
    accent: 'grape',
    code: `.parent {
  position: relative;
}

.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}`,
    icon: <IconTransform size={20} stroke={1.8} />,
    note: '适合弹层、徽标、浮动元素，不依赖子元素固定高度。',
    previewClassName: styles.previewAbsolute,
    previewHint: '脱离文档流',
    title: 'Absolute + transform',
    usage: '浮层定位',
  },
  {
    accent: 'orange',
    code: `.parent {
  position: relative;
}

.child {
  position: absolute;
  inset-block: 0;
  height: 88px;
  margin-block: auto;
}`,
    icon: <IconBoxModel size={20} stroke={1.8} />,
    note: '子元素高度已知时可用，常见于固定尺寸的面板或图标块。',
    previewClassName: styles.previewMarginAuto,
    previewHint: '已知高度',
    title: 'Position + margin auto',
    usage: '固定尺寸',
  },
  {
    accent: 'cyan',
    code: `.parent {
  display: table-cell;
  vertical-align: middle;
  text-align: center;
}`,
    icon: <IconTable size={20} stroke={1.8} />,
    note: '老项目里很常见，处理文本块和兼容性场景时仍然可靠。',
    previewClassName: styles.previewTable,
    previewHint: '表格单元格',
    title: 'Table-cell',
    usage: '旧式兼容',
    variant: 'table',
  },
  {
    accent: 'pink',
    code: `.parent {
  height: 72px;
  line-height: 72px;
  text-align: center;
}`,
    icon: <IconTextSize size={20} stroke={1.8} />,
    note: '只适合单行文本，内容换行后就应该换成 flex 或 grid。',
    previewClassName: styles.previewLineHeight,
    previewHint: '单行文本',
    title: 'Line-height',
    usage: '单行文字',
    variant: 'single-line',
  },
];

const principles = [
  {
    icon: <IconLayoutAlignMiddle size={18} stroke={1.8} />,
    text: '现代页面优先用 flex 或 grid；它们能处理未知尺寸和响应式变化。',
  },
  {
    icon: <IconArrowsMoveVertical size={18} stroke={1.8} />,
    text: '只做垂直居中时保留原本的横向布局，避免无意识地改变 inline 方向。',
  },
  {
    icon: <IconAlignBoxCenterMiddle size={18} stroke={1.8} />,
    text: '绝对定位适合覆盖层；普通文档流里的内容更适合交给布局容器。',
  },
];

const renderPreviewTarget = (method: CenteringMethod) => (
  <div
    className={`${styles.previewTarget} ${
      method.variant === 'single-line' ? styles.previewTargetSingle : ''
    }`}
  >
    <strong>{method.previewHint}</strong>
    {method.variant !== 'single-line' && <span>内容高度未知</span>}
  </div>
);

const renderPreview = (method: CenteringMethod) => {
  if (method.variant === 'table') {
    return (
      <div className={`${styles.previewFrame} ${method.previewClassName}`}>
        <div className={styles.previewTableCell}>
          {renderPreviewTarget(method)}
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.previewFrame} ${method.previewClassName}`}>
      {renderPreviewTarget(method)}
    </div>
  );
};

const VerticalCenteringDemo = () => (
  <main className={styles.centeringDemo}>
    <Container className={styles.centeringShell} size="xl">
      <Stack gap="xl">
        <header className={styles.demoHeader}>
          <Badge
            className={styles.demoKicker}
            color="blue"
            radius="xl"
            variant="light"
          >
            CSS vertical centering
          </Badge>
          <Title className={styles.demoTitle} order={1}>
            CSS 垂直居中方案
          </Title>
          <Text c="dimmed" className={styles.demoSubtitle} lh={1.7} size="lg">
            下面把常用方案放在同一个高度容器里对比：看预览判断对齐效果，
            看代码决定实际页面该用哪一种。
          </Text>
        </header>

        <section className={styles.summaryBand}>
          <div className={styles.summaryLead}>
            <ThemeIcon color="indigo" radius="md" size={42} variant="light">
              <IconCode size={22} stroke={1.8} />
            </ThemeIcon>
            <div>
              <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                quick choice
              </Text>
              <Text className={styles.summaryTitle} fw={800}>
                不确定时先用 <Kbd>display: grid</Kbd> 或{' '}
                <Kbd>display: flex</Kbd>
              </Text>
            </div>
          </div>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="sm">
            {principles.map((item) => (
              <div className={styles.principleItem} key={item.text}>
                <ThemeIcon color="gray" radius="md" size={32} variant="light">
                  {item.icon}
                </ThemeIcon>
                <Text c="dimmed" lh={1.55} size="sm">
                  {item.text}
                </Text>
              </div>
            ))}
          </SimpleGrid>
        </section>

        <SimpleGrid
          className={styles.methodGrid}
          cols={{ base: 1, md: 2, xl: 3 }}
          spacing="lg"
          verticalSpacing="lg"
        >
          {centeringMethods.map((method) => (
            <Card
              className={styles.methodCard}
              key={method.title}
              padding="lg"
              radius="md"
              shadow="sm"
              withBorder
            >
              <Stack gap="md">
                <Group gap="sm" justify="space-between" wrap="nowrap">
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon
                      color={method.accent}
                      radius="md"
                      size={38}
                      variant="light"
                    >
                      {method.icon}
                    </ThemeIcon>
                    <div className={styles.methodHeading}>
                      <Title order={2} size="h4">
                        {method.title}
                      </Title>
                      <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                        {method.usage}
                      </Text>
                    </div>
                  </Group>
                </Group>

                {renderPreview(method)}

                <Text c="dimmed" lh={1.65} size="sm">
                  {method.note}
                </Text>

                <Code block className={styles.codeBlock}>
                  {method.code}
                </Code>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>

        <section className={styles.notesBand}>
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon color="blue" radius="md" size={36} variant="light">
              <IconAlignBoxCenterMiddle size={20} stroke={1.8} />
            </ThemeIcon>
            <Title order={2} size="h3">
              选择顺序
            </Title>
          </Group>

          <List
            center
            className={styles.notesList}
            icon={
              <ThemeIcon color="blue" radius="xl" size={20} variant="light">
                <IconLayoutAlignMiddle size={13} stroke={2} />
              </ThemeIcon>
            }
            spacing="sm"
          >
            <List.Item>
              普通内容区：优先 <Kbd>flex</Kbd> 或 <Kbd>grid</Kbd>。
            </List.Item>
            <List.Item>
              覆盖层和悬浮块：用 <Kbd>position</Kbd> 搭配{' '}
              <Kbd>transform</Kbd>。
            </List.Item>
            <List.Item>
              单行文本：<Kbd>line-height</Kbd> 可以很轻，但不要拿它处理多行。
            </List.Item>
          </List>
        </section>
      </Stack>
    </Container>
  </main>
);

export default VerticalCenteringDemo;
