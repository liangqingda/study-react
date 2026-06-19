import { useEffect, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Code,
  Container,
  Group,
  Kbd,
  List,
  SimpleGrid,
  Slider,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconActivityHeartbeat,
  IconCode,
  IconGauge,
  IconPercentage,
  IconPlayerPause,
  IconPlayerPlay,
  IconRefresh,
  IconRoute,
} from '@tabler/icons-react';

import styles from './index.scss';

type Snapshot = {
  fps: number;
  frames: number;
  progress: number;
  x: number;
};

const initialSnapshot: Snapshot = {
  fps: 0,
  frames: 0,
  progress: 0,
  x: 0,
};

const loopSnippet = `const tick = (now: number) => {
  const delta = (now - previousTime) / 1000;
  previousTime = now;

  progress += direction * speed * delta;
  ball.style.setProperty('--x', \`\${progress * distance}px\`);

  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);`;

const getBoundedProgress = (nextProgress: number, direction: 1 | -1) => {
  if (nextProgress > 1) {
    return {
      direction: -1 as const,
      progress: 2 - nextProgress,
    };
  }

  if (nextProgress < 0) {
    return {
      direction: 1 as const,
      progress: -nextProgress,
    };
  }

  return {
    direction,
    progress: nextProgress,
  };
};

const RequestAnimationFrameDemo = () => {
  const animationFrameRef = useRef<number | null>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const directionRef = useRef<1 | -1>(1);
  const distanceRef = useRef(0);
  const elapsedRef = useRef(0);
  const frameCountRef = useRef(0);
  const framesSinceSnapshotRef = useRef(0);
  const isRunningRef = useRef(true);
  const lastSnapshotTimeRef = useRef(0);
  const movementProgressRef = useRef(0);
  const previousTimeRef = useRef<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const speedRef = useRef(0.34);
  const trackRef = useRef<HTMLDivElement>(null);

  const [isRunning, setIsRunning] = useState(true);
  const [snapshot, setSnapshot] = useState<Snapshot>(initialSnapshot);
  const [speed, setSpeed] = useState(0.34);

  const paintFrame = (progress: number) => {
    const x = progress * distanceRef.current;

    ballRef.current?.style.setProperty('--rotate', `${x / 180}turn`);
    ballRef.current?.style.setProperty('--x', `${x}px`);
    progressRef.current?.style.setProperty('--progress', String(progress));

    return x;
  };

  const reset = () => {
    directionRef.current = 1;
    elapsedRef.current = 0;
    frameCountRef.current = 0;
    framesSinceSnapshotRef.current = 0;
    lastSnapshotTimeRef.current = 0;
    movementProgressRef.current = 0;
    previousTimeRef.current = null;

    paintFrame(0);
    setSnapshot(initialSnapshot);
  };

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  useEffect(() => {
    const measureDistance = () => {
      const ballWidth = ballRef.current?.clientWidth ?? 0;
      const trackWidth = trackRef.current?.clientWidth ?? 0;

      distanceRef.current = Math.max(trackWidth - ballWidth - 44, 0);
      paintFrame(movementProgressRef.current);
    };

    const tick = (now: number) => {
      if (previousTimeRef.current === null) {
        previousTimeRef.current = now;
        lastSnapshotTimeRef.current = now;
      }

      const delta = Math.min((now - previousTimeRef.current) / 1000, 0.08);

      previousTimeRef.current = now;

      if (isRunningRef.current) {
        const nextProgress =
          movementProgressRef.current +
          directionRef.current * speedRef.current * delta;
        const bounded = getBoundedProgress(nextProgress, directionRef.current);

        movementProgressRef.current = bounded.progress;
        directionRef.current = bounded.direction;
        elapsedRef.current += delta;
        frameCountRef.current += 1;
        framesSinceSnapshotRef.current += 1;

        const snapshotInterval = now - lastSnapshotTimeRef.current;
        const x = paintFrame(bounded.progress);

        if (snapshotInterval >= 180) {
          setSnapshot({
            fps: (framesSinceSnapshotRef.current * 1000) / snapshotInterval,
            frames: frameCountRef.current,
            progress: bounded.progress,
            x,
          });

          framesSinceSnapshotRef.current = 0;
          lastSnapshotTimeRef.current = now;
        }
      }

      animationFrameRef.current = requestAnimationFrame(tick);
    };

    const resizeObserver = new ResizeObserver(measureDistance);

    measureDistance();

    if (trackRef.current) {
      resizeObserver.observe(trackRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      resizeObserver.disconnect();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const metrics = [
    {
      icon: <IconGauge size={18} stroke={1.8} />,
      label: 'FPS',
      value: snapshot.fps.toFixed(0),
    },
    {
      icon: <IconActivityHeartbeat size={18} stroke={1.8} />,
      label: '帧数',
      value: snapshot.frames,
    },
    {
      icon: <IconPercentage size={18} stroke={1.8} />,
      label: '进度',
      value: `${Math.round(snapshot.progress * 100)}%`,
    },
    {
      icon: <IconRoute size={18} stroke={1.8} />,
      label: '位移',
      value: `${Math.round(snapshot.x)}px`,
    },
  ];

  return (
    <main className={styles.rafDemo}>
      <Container className={styles.rafShell} size="lg">
        <Stack gap="xl">
          <header className={styles.rafHeader}>
            <Badge
              className={styles.rafKicker}
              color="teal"
              radius="xl"
              variant="light"
            >
              CSS + requestAnimationFrame
            </Badge>
            <Title className={styles.rafTitle} order={1}>
              用浏览器的刷新节奏驱动 CSS 动画
            </Title>
            <Text c="dimmed" className={styles.rafSubtitle} lh={1.7} size="lg">
            这个 demo 每一帧只做三件事：读取 RAF 传入的时间戳、计算位移进度、
              写入 CSS 变量。元素的视觉更新由 <Kbd>transform</Kbd> 和{' '}
              <Kbd>will-change</Kbd> 接管。
            </Text>
          </header>

          <section className={styles.rafStage}>
            <Card
              className={styles.rafPanel}
              padding="xl"
              radius="md"
              shadow="sm"
              withBorder
            >
              <Stack gap="lg">
                <div
                  aria-label="requestAnimationFrame animation track"
                  className={styles.rafTrack}
                  ref={trackRef}
                >
                  <div className={styles.rafProgress} ref={progressRef} />
                  <div className={styles.rafBall} ref={ballRef} />
                </div>

                <Group align="flex-end" className={styles.rafControls} gap="sm">
                  <Button
                    leftSection={
                      isRunning ? (
                        <IconPlayerPause size={18} stroke={1.8} />
                      ) : (
                        <IconPlayerPlay size={18} stroke={1.8} />
                      )
                    }
                    onClick={() => setIsRunning((value) => !value)}
                    type="button"
                  >
                    {isRunning ? '暂停' : '继续'}
                  </Button>
                  <Button
                    leftSection={<IconRefresh size={18} stroke={1.8} />}
                    onClick={reset}
                    type="button"
                    variant="default"
                  >
                    重置
                  </Button>

                  <Stack className={styles.rafSpeed} gap={6}>
                    <Group gap="xs" justify="space-between" wrap="nowrap">
                      <Text fw={700} size="sm">
                        速度
                      </Text>
                      <Badge color="teal" radius="sm" variant="light">
                        {speed.toFixed(2)} progress/s
                      </Badge>
                    </Group>
                    <Slider
                      color="teal"
                      label={(value) => value.toFixed(2)}
                      max={0.8}
                      min={0.08}
                      onChange={setSpeed}
                      step={0.02}
                      thumbLabel="Animation speed"
                      value={speed}
                    />
                  </Stack>
                </Group>

                <SimpleGrid
                  className={styles.rafMetrics}
                  cols={{ base: 1, xs: 2, md: 4 }}
                  spacing="sm"
                >
                  {metrics.map((metric) => (
                    <div className={styles.rafMetric} key={metric.label}>
                      <ThemeIcon color="teal" radius="md" size={34} variant="light">
                        {metric.icon}
                      </ThemeIcon>
                      <div>
                        <Text c="dimmed" fw={700} size="xs" tt="uppercase">
                          {metric.label}
                        </Text>
                        <Text className={styles.rafMetricValue} fw={800}>
                          {metric.value}
                        </Text>
                      </div>
                    </div>
                  ))}
                </SimpleGrid>
              </Stack>
            </Card>

            <Card
              className={`${styles.rafPanel} ${styles.rafNotes}`}
              padding="xl"
              radius="md"
              shadow="sm"
              withBorder
            >
              <Stack gap="md">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon color="blue" radius="md" size={34} variant="light">
                    <IconActivityHeartbeat size={19} stroke={1.8} />
                  </ThemeIcon>
                  <Title order={2} size="h3">
                    学习重点
                  </Title>
                </Group>

                <List
                  center
                  className={styles.rafList}
                  icon={
                    <ThemeIcon color="teal" radius="xl" size={20} variant="light">
                      <IconActivityHeartbeat size={13} stroke={2} />
                    </ThemeIcon>
                  }
                  spacing="sm"
                >
                  <List.Item>
                    <Kbd>requestAnimationFrame</Kbd>{' '}
                    会在浏览器准备绘制下一帧前调用回调。
                  </List.Item>
                  <List.Item>
                    回调参数 <Kbd>now</Kbd> 是高精度时间戳，用它计算{' '}
                    <Kbd>delta</Kbd>。
                  </List.Item>
                  <List.Item>
                    每帧更新 <Kbd>transform</Kbd> 相关的 CSS 变量，比频繁改{' '}
                    <Kbd>left/top</Kbd> 更适合动画。
                  </List.Item>
                  <List.Item>
                    组件卸载时调用 <Kbd>cancelAnimationFrame</Kbd>
                    ，避免后台循环继续运行。
                  </List.Item>
                </List>
              </Stack>
            </Card>
          </section>

          <Card
            className={`${styles.rafPanel} ${styles.rafCode}`}
            padding="xl"
            radius="md"
            shadow="sm"
            withBorder
          >
            <Stack gap="md">
              <Group gap="sm" wrap="nowrap">
                <ThemeIcon color="dark" radius="md" size={34} variant="light">
                  <IconCode size={19} stroke={1.8} />
                </ThemeIcon>
                <Title order={2} size="h3">
                  核心循环
                </Title>
              </Group>
              <Code block className={styles.rafCodeBlock}>
                {loopSnippet}
              </Code>
            </Stack>
          </Card>
        </Stack>
      </Container>
    </main>
  );
};

export default RequestAnimationFrameDemo;
