import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Code, Text, Textarea, Title } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';

import styles from './index.scss';

type Example = {
  key: string;
  name: string;
  summary: string;
  explanation: string;
  code: string;
  observation: string;
  method: 'GET' | 'POST';
};

type DemoResponse = {
  kind: string;
  trace: string[];
  message?: string;
  received?: unknown;
};

const examples: Example[] = [
  {
    key: 'application', name: '应用级中间件', summary: '挂载在 app 上',
    explanation: 'app.use 挂载在 /api/middleware，五个示例都会先经过它。与路由级不同，它不属于某个 Router。',
    code: "app.use('/api/middleware', applicationMiddleware, router);\n// middleware: trace.push('app.use'); next();",
    observation: '执行链先出现 app.use，再进入路由处理器；切换其他示例仍能看到 app.use。', method: 'GET',
  },
  {
    key: 'router', name: '路由级中间件', summary: '挂载在 Router 上',
    explanation: 'router.use 仅对 /router 路径生效；同一个 Router 下的其他路径不会经过它。',
    code: "router.use('/router', (req, res, next) => {\n  trace.push('router.use'); next();\n});",
    observation: '执行链在 app.use 后多出 router.use；切换到应用级示例，这一步消失。', method: 'GET',
  },
  {
    key: 'error', name: '错误处理中间件', summary: '接住 next(error)',
    explanation: '四参数处理器接收 next(error) 传来的错误，负责统一返回状态与消息；普通中间件不会接收这个错误。',
    code: "router.get('/error', (req, res, next) => next(new Error('演示用错误')));\nrouter.use((error, req, res, next) => res.status(500).json(...));",
    observation: 'HTTP 500，执行链从路由直接跳到错误处理器，没有正常成功响应。', method: 'GET',
  },
  {
    key: 'built-in', name: '内置中间件', summary: 'express.json() 解析请求体',
    explanation: 'Express 内置的 express.json() 将 JSON 请求体解析到 req.body；格式错误则交由错误处理中间件返回 400。',
    code: "router.post('/built-in', express.json(), (req, res) => {\n  res.json({ received: req.body });\n});",
    observation: '修改下面的 JSON 并发送，可对照 received；试着输入无效 JSON 观察 400。', method: 'POST',
  },
  {
    key: 'third-party', name: '第三方中间件', summary: 'morgan 记录 HTTP 日志',
    explanation: 'morgan 来自独立 npm 包，作为中间件插入请求链；本例设置 immediate 使日志在路由响应前写入后端终端。',
    code: "router.use('/third-party', morgan(format, { immediate: true }));\nrouter.get('/third-party', handler);",
    observation: '执行链出现 morgan；后端终端还能看到 middleware demo GET /third-party 日志。', method: 'GET',
  },
];

const basePath = '/api/middleware';

const Middleware = () => {
  const [selected, setSelected] = useState(examples[0]);
  const [body, setBody] = useState('{"topic":"Express","count":2}');
  const [result, setResult] = useState<{ status: number; data: DemoResponse } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const select = (example: Example) => {
    controllerRef.current?.abort();
    controllerRef.current = null;

    setSelected(example);
    setResult(null);
    setError('');
    setLoading(false);
  };

  const run = async () => {
    controllerRef.current?.abort();

    const controller = new AbortController();

    controllerRef.current = controller;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${basePath}/${selected.key}`, {
        method: selected.method,
        signal: controller.signal,
        ...(selected.method === 'POST' ? { headers: { 'Content-Type': 'application/json' }, body } : {}),
      });
      const data = await response.json() as DemoResponse;

      if (controllerRef.current === controller) {
        setResult({ status: response.status, data });
      }
    } catch {
      if (controllerRef.current === controller && !controller.signal.aborted) {
        setError('请求失败，请确认后端已在 localhost:3000 启动。');
      }
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <Text c="teal" fw={700} size="sm">EXPRESS / REQUEST FLOW</Text>
            <Title order={1}>五类中间件</Title>
            <Text c="dimmed">发送真实请求，对照中间件的执行链和响应。</Text>
          </div>
          <Badge color="teal" variant="light">5 types</Badge>
        </header>
        <div className={styles.workspace}>
          <nav aria-label="中间件类型" className={styles.navigation}>
            {examples.map((example) => (
              <button
                aria-current={selected.key === example.key ? 'true' : undefined}
                className={`${styles.navItem} ${selected.key === example.key ? styles.active : ''}`}
                key={example.key}
                onClick={() => select(example)}
                type="button"
              >
                <strong>{example.name}</strong><span>{example.summary}</span>
              </button>
            ))}
          </nav>
          <section aria-label="中间件示例" className={styles.detail}>
            <div className={styles.detailHeading}>
              <div><Title order={2}>{selected.name}</Title><Text c="dimmed" size="sm">{selected.explanation}</Text></div>
              <Badge color={selected.method === 'POST' ? 'orange' : 'teal'} variant="light">{selected.method}</Badge>
            </div>
            <div className={styles.notes}>
              <div><h3>关键代码</h3><pre>{selected.code}</pre></div>
              <div><h3>预期观察</h3><Text size="sm">{selected.observation}</Text></div>
            </div>
            {selected.method === 'POST' && (
              <Textarea label="JSON 请求体" minRows={3} onChange={(event) => setBody(event.currentTarget.value)} value={body} />
            )}
            <div className={styles.action}>
              <Code>{selected.method} {basePath}/{selected.key}</Code>
              <Button leftSection={<IconPlayerPlay size={16} />} loading={loading} onClick={() => void run()}>发送请求</Button>
            </div>
            {error && <Text c="red" role="alert">{error}</Text>}
            {!result && !error && <div className={styles.empty}>等待请求</div>}
            {result && (
              <div aria-live="polite" className={styles.result}>
                <div className={styles.resultHeading}><h3>实际结果</h3><Badge color={result.status >= 400 ? 'red' : 'teal'} variant="light">HTTP {result.status}</Badge></div>
                <ol className={styles.trace}>{result.data.trace.map((step) => <li key={step}>{step}</li>)}</ol>
                <h3>响应体</h3><pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default Middleware;
