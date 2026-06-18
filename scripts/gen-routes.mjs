#!/usr/bin/env node

import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = path.join(rootDir, 'src/pages');
const outputFile = path.join(rootDir, 'src/generated/routes.tsx');
const indexExtensions = ['tsx', 'jsx', 'ts', 'js'];

const compareByName = (left, right) => left.name.localeCompare(right.name);

const jsString = (value) => JSON.stringify(value);

const pathToRoute = (segments) => `/${segments.join('/')}`;

const toIdentifierPart = (value) =>
  value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('');

const createIdentifier = (segments, usedIdentifiers) => {
  const baseIdentifier = `${segments.map(toIdentifierPart).join('') || 'Demo'}Page`;
  let identifier = baseIdentifier;
  let suffix = 2;

  while (usedIdentifiers.has(identifier)) {
    identifier = `${baseIdentifier}${suffix}`;
    suffix += 1;
  }

  usedIdentifiers.add(identifier);

  return identifier;
};

const directoryExists = async (directory) => {
  try {
    const entries = await readdir(directory, { withFileTypes: true });

    return entries;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const readDirectories = async (directory) => {
  const entries = await directoryExists(directory);

  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .sort(compareByName);
};

const findIndexFile = async (directory) => {
  for (const extension of indexExtensions) {
    const filePath = path.join(directory, `index.${extension}`);

    try {
      await access(filePath);

      return filePath;
    } catch (error) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  return null;
};

const createImportPath = (filePath) => {
  const relativePath = path
    .relative(path.dirname(outputFile), filePath)
    .replaceAll(path.sep, '/')
    .replace(/\.(tsx|jsx|ts|js)$/, '');

  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
};

const createRouteEntry = ({
  filePath,
  label,
  menuKey,
  segments,
  topLevelKey,
  usedIdentifiers,
}) => ({
  importName: createIdentifier(segments, usedIdentifiers),
  importPath: createImportPath(filePath),
  label,
  menuKey,
  path: pathToRoute(segments),
  topLevelKey,
});

const formatRoutes = (routes) => {
  if (routes.length === 0) {
    return '[]';
  }

  const routeBlocks = routes.map(
    (route) => `  {
    path: ${jsString(route.path)},
    menuKey: ${jsString(route.menuKey)},
    topLevelKey: ${jsString(route.topLevelKey)},
    label: ${jsString(route.label)},
    Component: ${route.importName},
  }`,
  );

  return `[\n${routeBlocks.join(',\n')},\n]`;
};

const formatMenuItems = (menuItems) => JSON.stringify(menuItems, null, 2);

const formatMenuMap = (menuMap) => JSON.stringify(menuMap, null, 2);

const generate = async () => {
  const usedIdentifiers = new Set();
  const routes = [];
  const headerMenus = [];
  const sidebarMenusByTopLevel = {};
  const topLevelDirectories = await readDirectories(pagesDir);

  for (const topLevelDirectory of topLevelDirectories) {
    const topLevelPath = path.join(pagesDir, topLevelDirectory.name);
    const topLevelIndex = await findIndexFile(topLevelPath);
    const secondLevelDirectories = await readDirectories(topLevelPath);
    const topLevelKey = pathToRoute([topLevelDirectory.name]);
    const topLevelRoutes = [];
    const secondLevelMenus = [];

    const topLevelRoute = topLevelIndex
      ? createRouteEntry({
          filePath: topLevelIndex,
          label: topLevelDirectory.name,
          menuKey: topLevelKey,
          segments: [topLevelDirectory.name],
          topLevelKey,
          usedIdentifiers,
        })
      : null;

    if (topLevelRoute) {
      topLevelRoutes.push(topLevelRoute);
    }

    for (const secondLevelDirectory of secondLevelDirectories) {
      const secondLevelPath = path.join(topLevelPath, secondLevelDirectory.name);
      const secondLevelIndex = await findIndexFile(secondLevelPath);
      const secondLevelSegments = [topLevelDirectory.name, secondLevelDirectory.name];
      const secondLevelRoute = secondLevelIndex
        ? createRouteEntry({
            filePath: secondLevelIndex,
            label: secondLevelDirectory.name,
            menuKey: pathToRoute(secondLevelSegments),
            segments: secondLevelSegments,
            topLevelKey,
            usedIdentifiers,
          })
        : null;
      const thirdLevelDirectories = await readDirectories(secondLevelPath);
      const thirdLevelRoutes = [];

      for (const thirdLevelDirectory of thirdLevelDirectories) {
        const thirdLevelPath = path.join(secondLevelPath, thirdLevelDirectory.name);
        const thirdLevelIndex = await findIndexFile(thirdLevelPath);

        if (!thirdLevelIndex) {
          continue;
        }

        const thirdLevelSegments = [
          topLevelDirectory.name,
          secondLevelDirectory.name,
          thirdLevelDirectory.name,
        ];

        thirdLevelRoutes.push(
          createRouteEntry({
            filePath: thirdLevelIndex,
            label: thirdLevelDirectory.name,
            menuKey: pathToRoute(thirdLevelSegments),
            segments: thirdLevelSegments,
            topLevelKey,
            usedIdentifiers,
          }),
        );
      }

      if (secondLevelRoute) {
        topLevelRoutes.push(secondLevelRoute);
      }

      topLevelRoutes.push(...thirdLevelRoutes);

      if (thirdLevelRoutes.length > 0) {
        secondLevelMenus.push({
          key: `group:${pathToRoute(secondLevelSegments)}`,
          label: secondLevelDirectory.name,
          children: [
            ...(secondLevelRoute
              ? [
                  {
                    key: secondLevelRoute.menuKey,
                    label: 'index',
                    path: secondLevelRoute.path,
                  },
                ]
              : []),
            ...thirdLevelRoutes.map((route) => ({
              key: route.menuKey,
              label: route.label,
              path: route.path,
            })),
          ],
        });
      } else if (secondLevelRoute) {
        secondLevelMenus.push({
          key: secondLevelRoute.menuKey,
          label: secondLevelRoute.label,
          path: secondLevelRoute.path,
        });
      }
    }

    if (topLevelRoutes.length === 0) {
      continue;
    }

    routes.push(...topLevelRoutes);

    headerMenus.push({
      key: topLevelKey,
      label: topLevelDirectory.name,
      path: topLevelRoute?.path ?? topLevelRoutes[0].path,
    });

    sidebarMenusByTopLevel[topLevelKey] = secondLevelMenus;
  }

  const importLines = routes
    .map((route) => `import ${route.importName} from ${jsString(route.importPath)};`)
    .join('\n');
  const defaultRoutePath = routes[0]?.path ?? '';
  const output = `/* eslint-disable */
// This file is auto-generated by \`pnpm gen:routes\`.
import type { ComponentType } from 'react';
${importLines ? `\n${importLines}\n` : ''}
export type DemoRoute = {
  path: string;
  menuKey: string;
  topLevelKey: string;
  label: string;
  Component: ComponentType;
};

export type DemoMenuItem = {
  key: string;
  label: string;
  path?: string;
  children?: DemoMenuItem[];
};

export const defaultRoutePath = ${jsString(defaultRoutePath)};

export const demoRoutes: DemoRoute[] = ${formatRoutes(routes)};

export const headerMenus: DemoMenuItem[] = ${formatMenuItems(headerMenus)};

export const sidebarMenusByTopLevel: Record<string, DemoMenuItem[]> = ${formatMenuMap(
    sidebarMenusByTopLevel,
  )};
`;

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, output);

  console.log(`Generated ${routes.length} route(s) in ${path.relative(rootDir, outputFile)}`);
};

await generate();
