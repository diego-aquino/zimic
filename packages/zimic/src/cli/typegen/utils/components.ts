import ts from 'typescript';

import { isDefined } from '@/utils/data';

import { NodeTransformationContext } from '../openapi';
import { isNeverType } from './types';

function createComponentsIdentifier(serviceName: string) {
  return ts.factory.createIdentifier(`${serviceName}Components`);
}

export function renameComponentReferences(node: ts.TypeNode, context: NodeTransformationContext): ts.TypeNode {
  if (ts.isArrayTypeNode(node)) {
    const newElementType = renameComponentReferences(node.elementType, context);
    return ts.factory.updateArrayTypeNode(node, newElementType);
  }

  if (ts.isIndexedAccessTypeNode(node)) {
    if (ts.isIndexedAccessTypeNode(node.objectType)) {
      const newObjectType = renameComponentReferences(node.objectType, context);
      return ts.factory.updateIndexedAccessTypeNode(node, newObjectType, node.indexType);
    }

    if (
      ts.isTypeReferenceNode(node.objectType) &&
      ts.isIdentifier(node.objectType.typeName) &&
      node.objectType.typeName.text === 'components'
    ) {
      const newIdentifier = createComponentsIdentifier(context.serviceName);
      const newObjectType = ts.factory.updateTypeReferenceNode(
        node.objectType,
        newIdentifier,
        node.objectType.typeArguments,
      );
      return ts.factory.updateIndexedAccessTypeNode(node, newObjectType, node.indexType);
    }
  }

  return node;
}

function normalizeComponent(component: ts.TypeElement, context: NodeTransformationContext): ts.TypeElement | undefined {
  if (!ts.isPropertySignature(component)) {
    return component;
  }

  if (isNeverType(component.type)) {
    return undefined;
  }

  if (ts.isTypeLiteralNode(component.type)) {
    const newMembers = component.type.members
      .map((component) => normalizeComponent(component, context))
      .filter(isDefined);

    const newType = ts.factory.updateTypeLiteralNode(component.type, ts.factory.createNodeArray(newMembers));

    return ts.factory.updatePropertySignature(
      component,
      component.modifiers,
      component.name,
      component.questionToken,
      newType,
    );
  }

  if (ts.isIndexedAccessTypeNode(component.type)) {
    const newType = renameComponentReferences(component.type, context);

    return ts.factory.updatePropertySignature(
      component,
      component.modifiers,
      component.name,
      component.questionToken,
      newType,
    );
  }

  if (ts.isArrayTypeNode(component.type)) {
    const newType = renameComponentReferences(component.type.elementType, context);

    return ts.factory.updatePropertySignature(
      component,
      component.modifiers,
      component.name,
      component.questionToken,
      ts.factory.updateArrayTypeNode(component.type, newType),
    );
  }

  return component;
}

function normalizeComponentMemberType(componentType: ts.TypeNode, context: NodeTransformationContext) {
  if (ts.isTypeLiteralNode(componentType)) {
    const newMembers = componentType.members
      .map((component) => normalizeComponent(component, context))
      .filter(isDefined);

    return ts.factory.updateTypeLiteralNode(componentType, ts.factory.createNodeArray(newMembers));
  }

  return undefined;
}

function normalizeComponentMember(componentMember: ts.TypeElement, context: NodeTransformationContext) {
  if (!ts.isPropertySignature(componentMember)) {
    return componentMember;
  }

  if (isNeverType(componentMember.type)) {
    return undefined;
  }

  const newType = normalizeComponentMemberType(componentMember.type, context);

  return ts.factory.updatePropertySignature(
    componentMember,
    componentMember.modifiers,
    componentMember.name,
    componentMember.questionToken,
    newType,
  );
}

export function normalizeComponents(components: ts.InterfaceDeclaration, context: NodeTransformationContext) {
  const newIdentifier = createComponentsIdentifier(context.serviceName);

  const newMembers = components.members
    .map((component) => normalizeComponentMember(component, context))
    .filter(isDefined);

  if (newMembers.length === 0) {
    return undefined;
  }

  return ts.factory.updateInterfaceDeclaration(
    components,
    components.modifiers,
    newIdentifier,
    components.typeParameters,
    components.heritageClauses,
    newMembers,
  );
}
