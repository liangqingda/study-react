export type Method = {
  name: string;
  slug: string;
  description: string;
  note: string;
  explanation: string;
  code: string;
  observation: string;
};

export const basePath = '/api/response-methods';

export const methods: Method[] = [
  {
    name: 'res.download()', slug: 'download', description: '提示客户端下载文件',
    note: '把服务器上的文件作为附件发送。',
    explanation: '适合导出报表或提供附件。它基于文件发送，但会设置下载相关的响应头，浏览器通常会保存文件。',
    code: "res.download(sampleFile, 'express-download-demo.txt');",
    observation: '查看 Content-Disposition: attachment 和文件名；点击“下载”体验浏览器行为。',
  },
  {
    name: 'res.end()', slug: 'end', description: '结束响应流程',
    note: '结束连接，不再写入响应体。',
    explanation: '适合只需确认请求已处理、不需要返回内容的场景。这里先设为 204，再用 end() 结束响应。',
    code: 'res.status(204).end();',
    observation: '状态码为 204 No Content，Body 为空；它不会自动生成状态文字。',
  },
  {
    name: 'res.json()', slug: 'json', description: '发送 JSON 响应',
    note: '把 JavaScript 值序列化为 JSON。',
    explanation: '最常见的 API 返回方式。Express 会把对象序列化，并设置 JSON 类型的 Content-Type。',
    code: "res.json({ method: 'res.json()', items: ['Express', 'React'] });",
    observation: '响应头包含 application/json，Body 是 JSON 文本。',
  },
  {
    name: 'res.jsonp()', slug: 'jsonp', description: '发送 JSONP 响应',
    note: '把 JSON 包装成回调函数调用。',
    explanation: 'JSONP 是旧式的跨域脚本方案；需要客户端提供 callback 名称。新接口通常使用 CORS 和 res.json()。',
    code: "res.jsonp({ method: 'res.jsonp()' });",
    observation: 'URL 带 callback=showResponse，Body 形如 showResponse({...})，Content-Type 是 JavaScript。',
  },
  {
    name: 'res.redirect()', slug: 'redirect', description: '重定向请求',
    note: '告诉客户端改去另一个地址。',
    explanation: '这里用临时重定向把请求指向 JSON 示例。浏览器的 fetch 会自动跟随，因此页面展示的是最终 JSON 响应。',
    code: "res.redirect(302, '/api/response-methods/json');",
    observation: '页面会显示最终的 200 响应和 URL；在开发者工具的网络面板查看中间的 302 与 Location，或点击“打开跳转”。',
  },
  {
    name: 'res.render()', slug: 'render', description: '渲染视图模板',
    note: '将数据填入服务端模板，返回 HTML。',
    explanation: '适合服务端渲染页面。这个例子使用 EJS，将 title 和 message 注入模板后再发送完整 HTML。',
    code: "res.render('response-demo', { title, message });",
    observation: 'Content-Type 是 HTML；响应体下方会显示渲染预览。',
  },
  {
    name: 'res.send()', slug: 'send', description: '发送多种类型的响应',
    note: '直接发送指定内容。',
    explanation: '可以发送字符串、Buffer 或对象。这里显式指定 text/plain 并发送字符串，便于与 JSON 响应对比。',
    code: "res.type('text/plain').send('res.send() 示例文本');",
    observation: 'Body 是普通文本，Content-Type 是 text/plain，而不是 application/json。',
  },
  {
    name: 'res.sendFile()', slug: 'send-file', description: '发送文件内容',
    note: '直接把磁盘上的文件作为响应发送。',
    explanation: '适合提供可在浏览器中查看的文件。与 download() 不同，这里没有主动设置附件下载头。',
    code: 'res.sendFile(sampleFile);',
    observation: 'Body 是文件内容，Content-Disposition 通常为空；与下载示例使用同一个文件。',
  },
  {
    name: 'res.sendStatus()', slug: 'send-status', description: '发送状态码与状态文字',
    note: '一次设置状态码并结束响应。',
    explanation: '适合只需要状态码和简短状态文字的响应。它与 status(code).end() 不同，会写入状态文字作为 Body。',
    code: 'res.sendStatus(418);',
    observation: '状态码是 418，Body 包含对应的状态文字；与 204 end() 的空 Body 对照。',
  },
];

export const methodUrl = (slug: string) =>
  `${basePath}/${slug}${slug === 'jsonp' ? '?callback=showResponse' : ''}`;
