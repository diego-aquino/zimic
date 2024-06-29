import ts from 'typescript';

import { isDefined } from '@/utils/data';

import { NodeTransformationContext } from '../openapi';
import { normalizeMethod } from './methods';

export function createPathsIdentifier(serviceName: string) {
  return ts.factory.createIdentifier(`${serviceName}Schema`);
}

export function normalizePath(
  path: ts.TypeElement,
  context: NodeTransformationContext,
  options: { isComponent?: boolean } = {},
) {
  const { isComponent = false } = options;

  if (ts.isPropertySignature(path) && path.type && ts.isTypeLiteralNode(path.type)) {
    if (!ts.isStringLiteral(path.name)) {
      return undefined;
    }

    const pathName = path.name.text;

    const newIdentifier = isComponent
      ? path.name
      : ts.factory.createStringLiteral(pathName.replace(/{([^}]+)}/g, ':$1'));

    const newTypeMembers = path.type.members
      .map((pathMethod) => normalizeMethod(pathMethod, context, { pathName }))
      .filter(isDefined);

    if (newTypeMembers.length === 0) {
      return undefined;
    }

    const newType = ts.factory.updateTypeLiteralNode(path.type, ts.factory.createNodeArray(newTypeMembers));

    if (isComponent) {
      context.typeImports.root.add('HttpSchema');

      const wrappedNewType = ts.factory.createTypeReferenceNode(
        ts.factory.createQualifiedName(
          ts.factory.createIdentifier('HttpSchema'),
          ts.factory.createIdentifier('Methods'),
        ),
        [newType],
      );

      return ts.factory.updatePropertySignature(
        path,
        path.modifiers,
        newIdentifier,
        path.questionToken,
        wrappedNewType,
      );
    }

    return ts.factory.updatePropertySignature(path, path.modifiers, newIdentifier, path.questionToken, newType);
  }

  return path;
}

export function normalizePaths(paths: ts.InterfaceDeclaration, context: NodeTransformationContext) {
  const newIdentifier = createPathsIdentifier(context.serviceName);

  const newMembers = paths.members.map((path) => normalizePath(path, context)).filter(isDefined);
  const newType = ts.factory.createTypeLiteralNode(ts.factory.createNodeArray(newMembers));

  context.typeImports.root.add('HttpSchema');

  const wrappedNewType = ts.factory.createTypeReferenceNode(
    ts.factory.createQualifiedName(ts.factory.createIdentifier('HttpSchema'), ts.factory.createIdentifier('Paths')),
    [newType],
  );

  return ts.factory.createTypeAliasDeclaration(paths.modifiers, newIdentifier, paths.typeParameters, wrappedNewType);
}
