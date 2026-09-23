import { useEffect, useRef, useState } from 'react';
import { Badge, Button, Code, Text, Title } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';

import styles from './index.scss';

type Example = {
  slug: string;
  title: string;
  subtitle: string;
  explanation: string;
  code: string;
  observation: string;
};

type Result = {
  status: number;
  statusText: string;
  contentType: string;
  demoHeader: string;
  body: string;
};

const examples: Example[] = [
  {
    slug: 'sync', title: '同步抛错', subtitle: 'throw -> 默认处理器',
    explanation: '路由处理函数中同步抛出的错误由 Express 自动捕获，不需要手动调用 next。',
    code: "router.get('/sync', () => {\n  throw new Error('同步路由中的演示错误');\n});",
    observation: 'HTTP 500；开发环境的默认响应是包含错误堆栈的 HTML，生产环境只显示状态信息。',
  },
  {
    slug: 'async', title: '异步拒绝', subtitle: 'Promise -> 默认处理器',
    explanation: 'Express 5 会自动把返回的 Promise 的拒绝交给错误处理链；这里无需再手动 next(error)。',
    code: "router.get('/async', async () => {\n  await Promise.reject(new Error('异步路由中的演示错误'));\n});",
    observation: '仍然是 HTTP 500；错误进入同一条处理链，而不是让请求一直等待。此行为专指 Express 5。',
  },
  {
    slug: 'callback', title: '回调中的错误', subtitle: 'next(error) -> 默认处理器',
    explanation: '文件读取回调发生在路由调用之后；必须把错误传给 next，Express 才能处理。',
    code: "readFile('/express-error-handling-demo-missing-file', (error) => {\n  if (error) next(error);\n});",
    observation: 'HTTP 500，开发环境响应含 ENOENT；直接在回调中 throw 不会被路由的同步捕获机制接住。',
  },
  {
    slug: 'status', title: '状态与响应头', subtitle: 'next(error) -> 默认处理器',
    explanation: '默认处理器会读取 err.status（或 err.statusCode）以及 err.headers，并生成错误响应。',
    code: "const error = Object.assign(new Error('无效的演示输入'), {\n  status: 422, headers: { 'X-Demo-Error': 'validation' },\n});\nnext(error);",
    observation: 'HTTP 422，并有 X-Demo-Error: validation；若状态码不在 4xx/5xx，默认处理器会改成 500。',
  },
  {
    slug: 'custom', title: '自定义处理器', subtitle: '四参数中间件 -> JSON',
    explanation: '错误处理中间件有四个参数 (err, req, res, next)，需放在路由之后。这里它处理错误并结束响应；其他示例则调用 next(err) 交给默认处理器。',
    code: "router.use((err, req, res, next) => {\n  if (req.path === '/custom') {\n    res.status(500).json({ handler: 'custom', message: '服务器出错' });\n    return;\n  }\n  next(err);\n});",
    observation: 'HTTP 500，Content-Type 为 JSON，响应体没有堆栈；与“同步抛错”的默认 HTML 对照。',
  },
  {
    slug: 'headers-sent', title: '响应已开始', subtitle: 'headersSent -> 连接关闭',
    explanation: '响应头/部分内容已经写出后，不能再发送新的错误页面。自定义处理器检查 res.headersSent 并把错误转交默认处理器。',
    code: "res.write('这部分已经写入');\nnext(new Error('响应开始后出错'));\n// 错误处理器中：if (res.headersSent) return next(err);",
    observation: '浏览器通常报告网络请求失败，而不是拿到一个完整的 HTTP 500 响应；后端终端显示连接关闭。',
  },
];

const ErrorHandling = () => {
  const [selected, setSelected] = useState(examples[0]);
  const [result, setResult] = useState<Result | null>(null);
  const [failure, setFailure] = useState('');
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const url = `/api/error-handling/${selected.slug}`;

  useEffect(() => () => controllerRef.current?.abort(), []);

  const select = (example: Example) => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setSelected(example);
    setResult(null);
    setFailure('');
    setLoading(false);
  };

  const run = async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 5000);

    controllerRef.current = controller;
    setResult(null);
    setFailure('');
    setLoading(true);

    try {
      const response = await fetch(url, { signal: controller.signal });
      const body = await response.text();

      if (controllerRef.current !== controller) {
        return;
      }

      setResult({
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type') ?? '无',
        demoHeader: response.headers.get('x-demo-error') ?? '无',
        body,
      });
    } catch {
      if (controllerRef.current === controller) {
        setFailure(selected.slug === 'headers-sent'
          ? '响应未完整结束（连接中断或代理仍在等待），无法读取完整响应。查看后端终端的 headersSent 和连接关闭日志。'
          : '请求失败或超时。请检查 localhost:3000 后端是否已启动。');
      }
    } finally {
      window.clearTimeout(timeoutId);

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
            <Text c="teal" fw={700} size="sm">EXPRESS / ERROR FLOW</Text>
            <Title order={1}>错误处理</Title>
            <Text c="dimmed">触发真实请求，对照错误如何进入默认或自定义处理器。</Text>
          </div>
          <Badge color="teal" variant="light">Express 5</Badge>
        </header>

        <div className={styles.workspace}>
          <nav aria-label="错误处理示例" className={styles.navigation}>
            {examples.map((example) => (
              <button
                aria-current={selected.slug === example.slug ? 'true' : undefined}
                className={`${styles.navItem} ${selected.slug === example.slug ? styles.active : ''}`}
                key={example.slug}
                onClick={() => select(example)}
                type="button"
              >
                <strong>{example.title}</strong><span>{example.subtitle}</span>
              </button>
            ))}
          </nav>

          <section aria-label="示例详情" className={styles.detail}>
            <div className={styles.detailHeading}>
              <div><Title order={2}>{selected.title}</Title><Text c="dimmed" size="sm">{selected.explanation}</Text></div>
              <Badge color="green" variant="dot">GET</Badge>
            </div>
            <div className={styles.notes}>
              <div><h3>关键代码</h3><pre>{selected.code}</pre></div>
              <div><h3>预期观察</h3><Text size="sm">{selected.observation}</Text></div>
            </div>
            <div className={styles.action}>
              <Code>{url}</Code>
              <Button leftSection={<IconPlayerPlay size={16} />} loading={loading} onClick={() => void run()}>发送请求</Button>
            </div>

            {failure && <Text c="red" role="alert">{failure}</Text>}
            {!loading && !failure && !result && <div className={styles.empty}>等待请求</div>}
            {result && (
              <div className={styles.result}>
                <div className={styles.resultHeading}>
                  <h3>实际响应</h3><Badge color="red" variant="light">HTTP {result.status} {result.statusText}</Badge>
                </div>
                <dl className={styles.headers}>
                  <dt>Content-Type</dt><dd>{result.contentType}</dd>
                  <dt>X-Demo-Error</dt><dd>{result.demoHeader}</dd>
                </dl>
                <h3>响应体（原始文本）</h3>
                <pre>{result.body || '响应体为空'}</pre>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ErrorHandling;
