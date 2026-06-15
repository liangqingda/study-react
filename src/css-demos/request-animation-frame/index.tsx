import { useEffect, useRef, useState } from 'react';

import './index.css';

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

  return (
    <main className="raf-demo">
      <div className="raf-shell">
        <header className="raf-header">
          <span className="raf-kicker">CSS + requestAnimationFrame</span>
          <h1 className="raf-title">用浏览器的刷新节奏驱动 CSS 动画</h1>
          <p className="raf-subtitle">
            这个 demo 每一帧只做三件事：读取 RAF 传入的时间戳、计算位移进度、
            写入 CSS 变量。元素的视觉更新由 `transform` 和 `will-change` 接管。
          </p>
        </header>

        <section className="raf-stage">
          <div className="raf-panel raf-animation-panel">
            <div
              aria-label="requestAnimationFrame animation track"
              className="raf-track"
              ref={trackRef}
            >
              <div className="raf-progress" ref={progressRef} />
              <div className="raf-ball" ref={ballRef} />
            </div>

            <div className="raf-controls">
              <button
                className="raf-button"
                onClick={() => setIsRunning((value) => !value)}
                type="button"
              >
                {isRunning ? '暂停' : '继续'}
              </button>
              <button className="raf-button secondary" onClick={reset} type="button">
                重置
              </button>

              <label className="raf-speed">
                速度：{speed.toFixed(2)} progress/s
                <input
                  max="0.8"
                  min="0.08"
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  step="0.02"
                  type="range"
                  value={speed}
                />
              </label>
            </div>

            <div className="raf-metrics">
              <div className="raf-metric">
                <span>FPS</span>
                <strong>{snapshot.fps.toFixed(0)}</strong>
              </div>
              <div className="raf-metric">
                <span>帧数</span>
                <strong>{snapshot.frames}</strong>
              </div>
              <div className="raf-metric">
                <span>进度</span>
                <strong>{Math.round(snapshot.progress * 100)}%</strong>
              </div>
              <div className="raf-metric">
                <span>位移</span>
                <strong>{Math.round(snapshot.x)}px</strong>
              </div>
            </div>
          </div>

          <aside className="raf-panel raf-notes">
            <h2>学习重点</h2>
            <ul className="raf-list">
              <li>`requestAnimationFrame` 会在浏览器准备绘制下一帧前调用回调。</li>
              <li>回调参数 `now` 是高精度时间戳，用它计算 `delta`。</li>
              <li>每帧更新 `transform` 相关的 CSS 变量，比频繁改 `left/top` 更适合动画。</li>
              <li>组件卸载时调用 `cancelAnimationFrame`，避免后台循环继续运行。</li>
            </ul>
          </aside>
        </section>

        <section className="raf-panel raf-code">
          <h2>核心循环</h2>
          <pre>
            <code>{loopSnippet}</code>
          </pre>
        </section>
      </div>
    </main>
  );
};

export default RequestAnimationFrameDemo;
