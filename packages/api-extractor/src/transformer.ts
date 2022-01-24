import './typescript-internals'

import * as ts from 'typescript'
import * as path from 'path'

export interface TransformerConfig {
  /** Main entry point */
  rootFile?: string
  /** List of modules that could be imported when needed */
  allowModules?: string[]
  /** List of namespaces that should remain globally accessible */
  allowGlobalNamespaces?: string[]
  /** Do not emit brand properties. Brands are service properties in format `__<someName>Brand` */
  stripBrands?: boolean | string[]
  /** Do not emit private properties/methods */
  stripPrivate?: boolean
  /** Do not emit protected properties/methods */
  stripProtected?: boolean
  /** Do not emit entities marked with `@internal` JSDoc comment. It is a duplication of the same named property from tsconfig */
  stripInternal?: boolean
  /** Instead of emitting call signatures, methods, or function with union parameters transform them to a bunch of overloads with concrete arguments */
  generateSyntheticOverloads?: boolean
}

export default function transformer(program: ts.Program, config: TransformerConfig = {}): ts.TransformerFactory<ts.SourceFile | ts.Bundle> {
  const checker = program.getTypeChecker()
  const modules = program.getModuleResolutionCache()
  const options = program.getCompilerOptions()

  config.stripInternal ??= options.stripInternal
  config.rootFile ??= 'index.ts'

  // TODO handle missed rootDir, outDir, declarationDir
  const rootFileName = path.resolve(options.rootDir, config.rootFile)
  const declarationFileName = path.resolve(options.declarationDir, path.basename(rootFileName, '.ts') + '.d.ts')

  // collection of everything is exported from the entry point
  const exports = {
    names: new Map<string, {name: string; type: ts.Type; symbol: ts.Symbol}>(), // by names
    types: new Map<ts.Type, {name: string; type: ts.Type; symbol: ts.Symbol}>(), // by types
    symbols: new Map<ts.Symbol, {name: string; type: ts.Type; symbol: ts.Symbol}>(), // by symbols
  }
  // collection of symbols that should be replaced with some other type from entry point imports
  const aliases = new Map<ts.Symbol, {name: string; type: ts.Type; symbol: ts.Symbol}>()

  return function transformerFactory(context) {
    const host = context.getEmitHost()
    host.isEmitBlocked = emitFileName => emitFileName.endsWith('.d.ts') && emitFileName !== declarationFileName

    return function transformSourceFile(sourceFile: ts.SourceFile): ts.SourceFile {
      if (sourceFile.fileName !== rootFileName) return sourceFile

      const module = checker.getSymbolAtLocation(sourceFile)
      for (let symbol of checker.getExportsOfModule(module)) {
        const name = symbol.getName()

        // if alias is exported original symbol should be found, bc only original symbol could reference to the type
        symbol = getAliasedSymbol(symbol)

        let type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile)
        // some symbols (e.g. TypeAlias) cannot resolve type at location, so declared type should be taken
        if (type.flags & ts.TypeFlags.Any) {
          type = checker.getDeclaredTypeOfSymbol(symbol)
        }

        const exported = {name, type, symbol}
        exports.names.set(name, exported)
        if (name !== 'default' && name !== 'export=') {
          exports.symbols.set(symbol, exported)
          exports.types.set(type, exported)
        }

        // some descendant types could replace their ancestors, if ancestor could not be referenced (e.g. base class is shadowed by its derivative class)
        if (symbol.flags & ts.SymbolFlags.Class) {
          const declaration = symbol.valueDeclaration as ts.ClassDeclaration
          const extendingClause = declaration.heritageClauses?.find(heritageClause => heritageClause.token === ts.SyntaxKind.ExtendsKeyword)
          if (extendingClause) {
            const expression = extendingClause.types[0].expression
            let symbol = checker.getSymbolAtLocation(ts.isCallExpression(expression) ? expression.arguments[0] : expression)
            symbol = getAliasedSymbol(symbol)
            if (!exports.symbols.has(symbol) && !program.isSourceFileDefaultLibrary(symbol.declarations[0].getSourceFile()))
              aliases.set(symbol, exported)
          }
        } else if (symbol.flags & ts.SymbolFlags.TypeAlias) {
          const declaration = symbol.declarations[0] as ts.TypeAliasDeclaration
          if (ts.isTypeReferenceNode(declaration.type)) {
            let symbol = checker.getSymbolAtLocation(declaration.type.typeName)
            symbol = getAliasedSymbol(symbol)
            if (!exports.symbols.has(symbol) && !program.isSourceFileDefaultLibrary(symbol.declarations[0].getSourceFile()))
              aliases.set(symbol, exported)
          }
        }
      }

      const statements = [] as ts.Statement[]
      for (const {name, type, symbol} of exports.names.values()) {
        if (name === 'default' || name === 'export=' /* `export default` or `export =` */) {
          statements.push(...createExportDefault({type, node: symbol.valueDeclaration ?? symbol.declarations[0]}))
        } else if (symbol.flags & ts.SymbolFlags.Class /* `export class` */) {
          statements.push(createClassDeclaration({name, type: type as ts.InterfaceType, node: symbol.valueDeclaration as ts.ClassDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.Interface /* `export interface` */) {
          statements.push(createInterfaceDeclaration({name, type: type as ts.InterfaceType, node: symbol.declarations[0] as ts.InterfaceDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.TypeAlias /* `export type` */) {
          statements.push(createTypeAliasDeclaration({name, type, node: symbol.declarations[0] as ts.TypeAliasDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.Function /* `export function` */) {
          statements.push(...createFunctionDeclaration({name, type, node: symbol.valueDeclaration as ts.FunctionDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.Variable /* `export const` or `export let` or `export var` */) {
          statements.push(createVariableDeclaration({name, type, node: symbol.valueDeclaration as ts.VariableDeclaration}))
        } else if (symbol.flags & ts.SymbolFlags.Enum /* `export enum` */) {
          statements.push(createEnumDeclaration({name, type, node: symbol.valueDeclaration as ts.EnumDeclaration}))
        }
      }

      return ts.factory.createSourceFile(statements, ts.factory.createToken(ts.SyntaxKind.EndOfFileToken), ts.NodeFlags.None)
    }
  }

  // #region CHECKERS

  function isStripedBrandProperty(propertyName: string): boolean {
    if (Array.isArray(config.stripBrands)) {
      return config.stripBrands.some(brandName => propertyName === `__${brandName}Brand`)
    }
    return Boolean(config.stripBrands)
  }

  function isStripedDeclaration(declaration: ts.Declaration): boolean {
    if (!declaration) return false
    const modifierFlags = ts.getCombinedModifierFlags(declaration)
    const jsDocTags = ts.getJSDocTags(declaration)
    return Boolean(
      (config.stripPrivate && modifierFlags & ts.ModifierFlags.Private) ||
        (config.stripProtected && modifierFlags & ts.ModifierFlags.Protected) ||
        (config.stripInternal && jsDocTags?.some(tag => tag.tagName?.getText() === 'internal')),
    )
  }

  function isLibType(type: ts.Type): type is ts.TypeReference {
    const symbol = type.symbol ?? type.aliasSymbol
    return Boolean(symbol) && program.isSourceFileDefaultLibrary(symbol.declarations[0].getSourceFile())
  }

  function isImportedType(type: ts.Type): type is ts.TypeReference {
    let symbol = type.aliasSymbol ?? type.symbol
    if (!symbol) return false
    while (symbol.parent) symbol = symbol.parent
    if (symbol.getName() === '__global') {
      return true
    } else if (symbol.flags & ts.SymbolFlags.ValueModule) {
      const namespaceName = symbol.getName()
      if (config.allowGlobalNamespaces?.includes(namespaceName)) return true
      const moduleName = getModuleNameOfType(type)
      return config.allowModules?.includes(moduleName)
    } else if (symbol.flags & ts.SymbolFlags.NamespaceModule) {
      const namespaceName = symbol.getName()
      return config.allowGlobalNamespaces?.includes(namespaceName)
    }
    return false
  }

  function isExportedType(type: ts.Type): type is ts.TypeReference {
    return exports.types.has(type) || exports.symbols.has(type.aliasSymbol ?? type.symbol)
  }

  function isKnownType(type: ts.Type): type is ts.TypeReference {
    return isLibType(type) || isImportedType(type) || isExportedType(type)
  }

  function isTupleType(type: ts.Type): type is ts.TupleTypeReference {
    return Boolean(ts.getObjectFlags(type) & ts.ObjectFlags.Reference && ts.getObjectFlags((<ts.TypeReference>type).target) & ts.ObjectFlags.Tuple)
  }

  function isTypeLiteral(type: ts.Type): type is ts.ObjectType {
    return Boolean(
      type.flags & ts.TypeFlags.Object &&
        type.symbol.flags & (ts.SymbolFlags.TypeLiteral | ts.SymbolFlags.Interface | ts.SymbolFlags.Class | ts.SymbolFlags.Method),
    )
  }

  function isBooleanLiteralType(type: ts.Type): boolean {
    return Boolean(type?.flags & ts.TypeFlags.BooleanLiteral)
  }

  function isPrimitiveType(type: ts.Type): boolean {
    return Boolean(
      type.flags &
        (ts.TypeFlags.Any |
          ts.TypeFlags.Unknown |
          ts.TypeFlags.Never |
          ts.TypeFlags.Null |
          ts.TypeFlags.VoidLike |
          ts.TypeFlags.BooleanLike |
          ts.TypeFlags.NumberLike |
          ts.TypeFlags.BigIntLike |
          ts.TypeFlags.StringLike |
          ts.TypeFlags.ESSymbolLike),
    )
  }

  function isSymbolType(type: ts.Type): type is ts.UniqueESSymbolType {
    return Boolean(type.flags & ts.TypeFlags.ESSymbolLike)
  }

  function isStringLiteral(type: ts.Type): type is ts.StringLiteralType {
    return Boolean(type.flags & ts.TypeFlags.StringLiteral)
  }

  function isOptional(symbol: ts.Symbol): boolean {
    return Boolean(symbol.flags & ts.SymbolFlags.Optional)
  }

  // #endregion CHECKERS

  // #region GETTERS

  function getAliasedSymbol(symbol: ts.Symbol): ts.Symbol {
    return symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol
  }

  function getModuleNameOfType(type: ts.Type): string {
    const symbol = type.aliasSymbol ?? type.symbol
    const sourceFile = symbol.declarations[0].getSourceFile()
    const fileName = sourceFile.fileName
    const dirName = fileName.includes('/node_modules/') ? sourceFile.fileName.replace(/\/node_modules\/.*$/, '') : program.getCurrentDirectory()
    const moduleName = config.allowModules?.find(moduleName => {
      const cache = modules.getOrCreateCacheForModuleName(moduleName, undefined)
      const module = cache.get(dirName) ?? cache.get(`${dirName}/node_modules`)
      if (!module?.resolvedModule) return false
      const moduleSourceFile = program.getSourceFile(module.resolvedModule.resolvedFileName)
      const moduleSymbol = checker.getSymbolAtLocation(moduleSourceFile)
      const moduleExports = checker.getExportsOfModule(moduleSymbol)
      return moduleExports.some(exportedSymbol => getAliasedSymbol(exportedSymbol) === symbol)
    })
    return moduleName ?? path.relative(process.cwd(), fileName)
  }

  function getPropertyName(symbol: ts.Symbol): string | ts.PropertyName {
    if (symbol.nameType && isSymbolType(symbol.nameType)) {
      return ts.factory.createComputedPropertyName(ts.factory.createIdentifier(`Symbol.${symbol.nameType.symbol.getName()}`))
    }
    const name = symbol.nameType && isStringLiteral(symbol.nameType) ? symbol.nameType.value : symbol.getName()
    return !/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name) ? ts.factory.createStringLiteral(name, true /* isSingleQuoted */) : name
  }

  function getTypeName(type: ts.Type): string {
    if (exports.types.has(type)) return exports.types.get(type).name
    let symbol = type.aliasSymbol ?? type.symbol
    if (exports.symbols.has(symbol)) return exports.symbols.get(symbol).name
    const chunks = []
    while (symbol) {
      let name = symbol.getName()
      if (name === '__global') {
        // if global type's name already taken then add `globalThis`, otherwise nothing
        name = exports.names.has(chunks[0]) ? 'globalThis' : ''
      } else if (symbol.flags & ts.SymbolFlags.ValueModule) {
        // if type was imported from a module use import function to access the type
        name = `import('${getModuleNameOfType(type)}')`
      }
      if (name) chunks.unshift(name)

      if (exports.symbols.has(symbol)) break
      else if (exports.names.has(chunks[0]) && !symbol.parent) {
        chunks.unshift('globalThis')
        break
      }
      symbol = symbol.parent
    }
    return chunks.join('.')
  }

  function getTypeAlias(type: ts.Type): ts.Type {
    return aliases.get(type.aliasSymbol)?.type ?? aliases.get(type.symbol)?.type ?? type
  }

  function getBaseTypes(type: ts.InterfaceType): {extendedTypes: ts.Type[]; implementedTypes: ts.Type[]} {
    let extendedTypes = checker.getBaseTypes(type)
    let implementedTypes = [] as ts.Type[]
    const otherBaseTypes = [] as {extendedTypes: ts.Type[]; implementedTypes: ts.Type[]}[]
    if (type.symbol.flags & ts.SymbolFlags.Class) {
      extendedTypes = extendedTypes.filter(type => {
        if (type.isIntersection() /* class C extends {new () => C1 & C2} */) {
          const classTypes = type.types.filter(type => type.symbol.flags & ts.SymbolFlags.Class)
          const interfaceTypes = type.types.filter(type => type.symbol.flags & ts.SymbolFlags.Interface)
          if (interfaceTypes.length > 0) {
            otherBaseTypes.push({
              extendedTypes: classTypes.filter(classType => {
                const isReferable = isKnownType(type)
                if (!isKnownType(type)) otherBaseTypes.push(getBaseTypes(classType as ts.InterfaceType))
                return isReferable
              }),
              implementedTypes: interfaceTypes.filter(interfaceType => isKnownType(interfaceType)),
            })
            return false
          }
          return true
        }
        const isReferable = isKnownType(type)
        if (!isKnownType(type)) otherBaseTypes.push(getBaseTypes(type as ts.InterfaceType))
        return isReferable
      })
      const declaration = type.symbol.valueDeclaration as ts.ClassDeclaration
      const implementationClause = declaration.heritageClauses?.find(heritageClause => heritageClause.token === ts.SyntaxKind.ImplementsKeyword)
      implementedTypes =
        implementationClause?.types
          .map(typeNode => checker.getTypeFromTypeNode(typeNode))
          .filter(type => {
            const isReferable = isKnownType(type)
            if (!isReferable)
              otherBaseTypes.push({
                extendedTypes: [],
                implementedTypes: getBaseTypes(type as ts.InterfaceType).extendedTypes,
              })
            return isReferable
          }) ?? []
    } else if (type.symbol.flags & ts.SymbolFlags.Interface) {
      extendedTypes = extendedTypes.filter(type => {
        // TODO
        const isReferable = isKnownType(type)
        if (!isReferable) otherBaseTypes.push(getBaseTypes(type as ts.InterfaceType))
        return isReferable
      })
    }

    otherBaseTypes.forEach(otherBaseTypes => {
      extendedTypes.push(...otherBaseTypes.extendedTypes)
      implementedTypes.push(...otherBaseTypes.implementedTypes)
    })

    return {extendedTypes, implementedTypes}
  }

  // #endregion GETTERS

  // #region TYPE NODES

  function createTypeNode(options: {type: ts.Type; node?: ts.Node; noReduce?: boolean}): ts.TypeNode {
    const {node, noReduce} = options
    let {type} = options

    type = !noReduce ? getTypeAlias(type) : type

    if (isKnownType(type)) {
      return createTypeReferenceNode({type, node})
    } else if (isPrimitiveType(type)) {
      return checker.typeToTypeNode(type, node, undefined)
    } else if (isTupleType(type)) {
      return createTupleTypeNode({type, node})
    } else if (isTypeLiteral(type)) {
      return createTypeLiteralNode({type, node})
    } else if (type.isIntersection()) {
      return createIntersectionTypeNode({type, node})
    } else if (type.isUnion()) {
      return createUnionTypeNode({type, node})
    } else {
      // if it is not handled then apply the default mechanism
      return checker.typeToTypeNode(type, node, undefined)
    }
  }

  function createTypeReferenceNode(options: {type: ts.TypeReference; node?: ts.Node}): ts.TypeNode {
    const {type, node} = options
    let typeArguments = type.aliasSymbol ? type.aliasTypeArguments : checker.getTypeArguments(type)

    // exclude default type arguments
    if (typeArguments?.length > 0 && type?.target?.localTypeParameters?.length > 0) {
      const index = [...type.target.localTypeParameters].reverse().findIndex((typeParameter, index) => {
        return checker.getDefaultFromTypeParameter(typeParameter) !== typeArguments[index]
      })
      typeArguments = index >= 0 ? typeArguments.slice(0, typeArguments.length - index) : []
    }

    return ts.factory.createTypeReferenceNode(
      getTypeName(type),
      typeArguments?.map(type => createTypeNode({type, node})),
    )
  }

  function createTypeLiteralNode(options: {type: ts.ObjectType; node?: ts.Node}): ts.TypeNode {
    const {type, node} = options

    const members = createTypeMembers({type, node})

    if (members.length === 1) {
      const member = members[0]
      if (ts.isCallSignatureDeclaration(member)) {
        return ts.factory.createFunctionTypeNode(member.typeParameters, member.parameters, member.type)
      }
      if (ts.isConstructSignatureDeclaration(member)) {
        return ts.factory.createConstructorTypeNode(undefined /* modifiers */, member.typeParameters, member.parameters, member.type)
      }
    }

    const typeNode = ts.factory.createTypeLiteralNode(members)
    if (members.length <= 4) ts.setEmitFlags(typeNode, ts.EmitFlags.SingleLine)

    return typeNode
  }

  function createTupleTypeNode(options: {type: ts.TupleTypeReference; node?: ts.Node}): ts.TypeNode {
    // TODO add support of named tuples
    const {type, node} = options
    const typeArguments = checker.getTypeArguments(type)
    const typeNode = ts.factory.createTupleTypeNode(typeArguments?.map(type => createTypeNode({type, node})))
    if (typeArguments.length < 6) ts.setEmitFlags(typeNode, ts.EmitFlags.SingleLine)
    return typeNode
  }

  function createIntersectionTypeNode(options: {type: ts.IntersectionType; node?: ts.Node}): ts.TypeNode {
    const {node} = options
    let {type} = options

    if ((<any>type).origin) {
      // if `origin` property exists it will contain non-reduced type
      type = (<any>type).origin
      delete (<any>type).origin
      if (!type.isIntersection()) return createTypeNode({type, node})
    }

    const typeNodes = []
    for (const typeItem of type.types) {
      const typeNode = createTypeNode({type: typeItem, node})
      if (ts.isTypeLiteralNode(typeNode) && typeNode.members.length === 0) continue
      typeNodes.push(typeNode)
    }

    if (typeNodes.every(typeNode => ts.isTypeLiteralNode(typeNode) || ts.isFunctionTypeNode(typeNode))) {
      const members = typeNodes.reduce((members, typeNode) => {
        if (ts.isTypeLiteralNode(typeNode)) {
          typeNode.members.forEach(member => {
            let name
            if (!member.name) name = Symbol()
            else if (ts.isIdentifier(member.name) || ts.isPrivateIdentifier(member.name)) name = member.name.escapedText as string
            else if (ts.isStringLiteral(member.name)) name = member.name.text
            else name = Symbol()
            members.set(name, member)
          })
        } else if (ts.isFunctionTypeNode(typeNode)) {
          members.set(Symbol(), ts.factory.createCallSignature(typeNode.typeParameters, typeNode.parameters, typeNode.type))
        }
        return members
      }, new Map<string | symbol, ts.TypeElement>())
      return ts.factory.createTypeLiteralNode([...members.values()])
    }

    return ts.factory.createIntersectionTypeNode(typeNodes)
  }

  function createUnionTypeNode(options: {type: ts.UnionType; node?: ts.Node}): ts.TypeNode {
    const {node} = options
    let {type} = options

    if ((<any>type).origin) {
      // if `origin` property exists it will contain non-reduced type
      type = (<any>type).origin
      delete (<any>type).origin
      if (!type.isUnion()) return createTypeNode({type, node})
    }

    const typeNodes = []
    for (let index = 0; index < type.types.length; ++index) {
      // if both boolean literals are in union replace with their base type - boolean
      // TODO the same could be done with enums
      if (isBooleanLiteralType(type.types[index]) && isBooleanLiteralType(type.types[index + 1])) {
        typeNodes.push(createTypeNode({type: checker.getBaseTypeOfLiteralType(type.types[index]), node}))
        index += 1
      } else {
        typeNodes.push(createTypeNode({type: type.types[index], node}))
      }
    }
    return ts.factory.createUnionTypeNode(typeNodes)
  }

  // #endregion TYPE NODES

  // #region LOW LEVEL DECLARATIONS

  function createTypeMembers(options: {type: ts.Type; node?: ts.Node}): ts.TypeElement[] {
    const {type, node} = options

    const members = [] as ts.TypeElement[]

    for (const info of checker.getIndexInfosOfType(type)) {
      members.push(createIndexDeclaration({info, node}))
    }

    for (const signature of type.getCallSignatures()) {
      members.push(...createCallDeclaration({signature, node}))
    }

    for (const signature of type.getConstructSignatures()) {
      if (isStripedDeclaration(signature.declaration) || !signature.declaration) continue
      members.push(...createConstructorDeclaration({signature, node, isSignature: true}))
    }

    for (const symbol of type.getProperties()) {
      if (isStripedBrandProperty(symbol.getName()) || isStripedDeclaration(symbol.declarations?.[symbol.declarations.length - 1])) {
        continue
      }

      if (symbol.flags & ts.SymbolFlags.Method) {
        members.push(...createMethodDeclaration({symbol, node, isSignature: true}))
      } else if (symbol.flags & ts.SymbolFlags.Property) {
        members.push(...createPropertyDeclaration({symbol, node, isSignature: true}))
      }
    }

    return members
  }

  function createClassMembers(options: {type: ts.Type; node?: ts.Node; isExtended?: boolean}): ts.ClassElement[] {
    const {type, node, isExtended} = options
    const isConstructorInterface = !(ts.getObjectFlags(type) & (ts.ObjectFlags.Class | ts.ObjectFlags.Reference))

    const members = [] as ts.ClassElement[]

    for (const symbol of type.getProperties()) {
      if (
        (isExtended && symbol.parent !== type.symbol) || // avoid re-declaration of properties from extended type
        symbol.getName() === 'prototype' ||
        isStripedBrandProperty(symbol.getName()) ||
        isStripedDeclaration(symbol.declarations?.[symbol.declarations.length - 1])
      ) {
        continue
      }

      if (symbol.flags & ts.SymbolFlags.Method) {
        members.push(...createMethodDeclaration({symbol, node, isStatic: isConstructorInterface}))
      } else if (symbol.flags & ts.SymbolFlags.Property) {
        members.push(...createPropertyDeclaration({symbol, node, isStatic: isConstructorInterface}))
      } else if (symbol.flags & ts.SymbolFlags.Accessor) {
        if (symbol.flags & ts.SymbolFlags.GetAccessor) members.push(createGetAccessorDeclaration({symbol, node, isStatic: isConstructorInterface}))
        if (symbol.flags & ts.SymbolFlags.SetAccessor) members.push(createSetAccessorDeclaration({symbol, node, isStatic: isConstructorInterface}))
      }
    }

    if (isConstructorInterface) {
      for (const signature of type.getConstructSignatures()) {
        if (
          !signature.declaration || // avoid declaration of default constructor
          (isExtended && signature.declaration.symbol.parent !== type.symbol) || // avoid re-declaration of constructors from extended type
          isStripedDeclaration(signature.declaration)
        ) {
          continue
        }
        members.push(...createConstructorDeclaration({signature, node}))
      }

      const prototypeProperty = type.getProperty('prototype')
      if (prototypeProperty) {
        const prototypeType = checker.getTypeOfSymbolAtLocation(prototypeProperty, node)
        members.push(...createClassMembers({type: prototypeType, node, isExtended}))
      }
    }

    return members
  }

  function createTypeParameterDeclaration(options: {typeParameter: ts.TypeParameter; node?: ts.Node}): ts.TypeParameterDeclaration {
    const {typeParameter, node} = options
    return checker.typeParameterToDeclaration(typeParameter, node, ts.NodeBuilderFlags.None)
  }

  function createParameterDeclaration(options: {symbol: ts.Symbol; node?: ts.Node}): ts.ParameterDeclaration {
    const {symbol, node} = options
    const type = checker.getTypeOfSymbolAtLocation(
      symbol.target && checker.getTypeOfSymbolAtLocation(symbol.target, node).default ? symbol.target : symbol,
      node,
    )
    const name = symbol.getName()
    const declaration = symbol.valueDeclaration as ts.ParameterDeclaration

    return ts.factory.createParameterDeclaration(
      undefined /* decorators */,
      undefined /* modifiers */,
      declaration.dotDotDotToken,
      name,
      declaration.questionToken,
      createTypeNode({type, node}),
      undefined /* initializer */,
    )
  }

  function createParameterDeclarations(options: {signature: ts.Signature; node?: ts.Node}): ts.ParameterDeclaration[] {
    const {signature, node} = options
    return signature.getParameters().map(symbol => createParameterDeclaration({symbol, node}))
  }

  function createSyntheticParameterDeclarations(options: {signature: ts.Signature; node?: ts.Node}): ts.ParameterDeclaration[][] {
    const {signature, node} = options
    return signature.getParameters().reduce((parameters, symbol) => {
      const parameter = createParameterDeclaration({symbol, node})
      if (!ts.isUnionTypeNode(parameter.type)) {
        return parameters.map(group => [...group, parameter])
      }
      return parameter.type.types.flatMap(typeNode => {
        return parameters.map(parameters => {
          const parameterDeclaration = ts.factory.createParameterDeclaration(
            parameter.decorators,
            parameter.modifiers,
            parameter.dotDotDotToken,
            parameter.name,
            parameter.questionToken,
            typeNode,
            parameter.initializer,
          )
          return [...parameters, parameterDeclaration]
        })
      })
    }, [].concat([[]]))
  }

  function createReturnTypeNode(options: {signature: ts.Signature; node?: ts.Node}): ts.TypeNode | ts.TypePredicateNode {
    const {signature, node} = options
    const typePredicate = checker.getTypePredicateOfSignature(signature)
    const returnType = signature.getReturnType()
    return typePredicate
      ? ts.factory.createTypePredicateNode(
          /* assetModifiers */ undefined,
          typePredicate.parameterName,
          createTypeNode({type: typePredicate.type, node}),
        )
      : createTypeNode({type: returnType, node})
  }

  function createCallDeclaration(options: {signature: ts.Signature; node?: ts.Node}): ts.CallSignatureDeclaration[] {
    const {signature, node} = options
    const typeParameters = signature.getTypeParameters()?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node}))
    const parameters = config.generateSyntheticOverloads
      ? createSyntheticParameterDeclarations({signature, node})
      : [createParameterDeclarations({signature, node})]
    const returnType = createReturnTypeNode({signature, node})

    return parameters.map(parameters => ts.factory.createCallSignature(typeParameters, parameters, returnType))
  }

  function createIndexDeclaration(options: {info: ts.IndexInfo; node?: ts.Node}): ts.IndexSignatureDeclaration {
    const {info, node} = options
    return ts.factory.createIndexSignature(
      undefined /* decorators */,
      info.declaration?.modifiers,
      info.declaration?.parameters, // TODO construct own parameters object
      createTypeNode({type: info.type, node}),
    )
  }

  function createConstructorDeclaration(options: {signature: ts.Signature; node?: ts.Node; isSignature: true}): ts.ConstructSignatureDeclaration[]
  function createConstructorDeclaration(options: {signature: ts.Signature; node?: ts.Node; isSignature?: false}): ts.ConstructorDeclaration[]
  function createConstructorDeclaration(options: {signature: ts.Signature; node?: ts.Node; isSignature?: boolean}) {
    const {signature, node, isSignature} = options
    const modifierFlags = ts.getCombinedModifierFlags(signature.declaration)
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)
    const typeParameters = signature.getTypeParameters()?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node}))
    const parameters = config.generateSyntheticOverloads
      ? createSyntheticParameterDeclarations({signature, node})
      : [createParameterDeclarations({signature, node})]
    const returnType = createTypeNode({type: signature.getReturnType(), node})

    return isSignature
      ? parameters.map(parameters => ts.factory.createConstructSignature(typeParameters, parameters, returnType))
      : parameters.map(parameters => ts.factory.createConstructorDeclaration(/* decorators */ undefined, modifiers, parameters, /* body */ undefined))
  }

  function createPropertyDeclaration(options: {symbol: ts.Symbol; node?: ts.Node; isSignature: true}): ts.PropertySignature[] | ts.MethodSignature[]
  function createPropertyDeclaration(options: {
    symbol: ts.Symbol
    node?: ts.Node
    isSignature?: false
    isStatic?: boolean
  }): ts.PropertyDeclaration[] | ts.MethodDeclaration[]
  function createPropertyDeclaration(options: {symbol: ts.Symbol; node?: ts.Node; isSignature?: boolean; isStatic?: boolean}) {
    const {symbol, node, isSignature, isStatic} = options
    const modifierFlags =
      (symbol.declarations ? ts.getCombinedModifierFlags(symbol.declarations[symbol.declarations.length - 1]) : 0) |
      (isStatic ? ts.ModifierFlags.Static : 0)
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)
    const propertyName = getPropertyName(symbol)
    const optionalToken = isOptional(symbol) ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined
    const type = checker.getTypeOfSymbolAtLocation(
      symbol.target && checker.getTypeOfSymbolAtLocation(symbol.target, node).default ? symbol.target : symbol,
      node,
    )
    const typeNode = createTypeNode({type, node})

    if (ts.isTypeLiteralNode(typeNode) && typeNode.members.every(ts.isCallSignatureDeclaration)) {
      return typeNode.members.map((member: ts.CallSignatureDeclaration) => {
        return isSignature
          ? ts.factory.createMethodSignature(modifiers, propertyName, optionalToken, member.typeParameters, member.parameters, member.type)
          : ts.factory.createMethodDeclaration(
              /* decorators */ undefined,
              modifiers,
              /* asteriskToken */ undefined,
              propertyName,
              optionalToken,
              member.typeParameters,
              member.parameters,
              member.type,
              /* body */ undefined,
            )
      })
    }

    return [
      isSignature
        ? ts.factory.createPropertySignature(modifiers, propertyName, optionalToken, typeNode)
        : ts.factory.createPropertyDeclaration(
            /* decorators */ undefined,
            modifiers,
            propertyName,
            optionalToken,
            typeNode,
            /* initializer */ undefined,
          ),
    ]
  }

  function createGetAccessorDeclaration(options: {symbol: ts.Symbol; node?: ts.Node; isStatic?: boolean}): ts.GetAccessorDeclaration {
    const {symbol, node, isStatic} = options
    const modifierFlags = ts.getCombinedModifierFlags(symbol.declarations[symbol.declarations.length - 1]) | (isStatic ? ts.ModifierFlags.Static : 0)
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)
    const accessorName = getPropertyName(symbol)
    const type = createTypeNode({type: checker.getTypeOfSymbolAtLocation(symbol, node), node})
    return ts.factory.createGetAccessorDeclaration(
      /* decorators */ undefined,
      modifiers,
      accessorName,
      /* parameters */ [],
      type,
      /* body */ undefined,
    )
  }

  function createSetAccessorDeclaration(options: {symbol: ts.Symbol; node?: ts.Node; isStatic?: boolean}): ts.SetAccessorDeclaration {
    const {symbol, node, isStatic} = options
    const modifierFlags = ts.getCombinedModifierFlags(symbol.declarations[symbol.declarations.length - 1]) | (isStatic ? ts.ModifierFlags.Static : 0)
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)
    const accessorName = getPropertyName(symbol)

    return ts.factory.createSetAccessorDeclaration(
      /* decorators */ undefined,
      modifiers,
      accessorName,
      [createParameterDeclaration({symbol, node})],
      /* body */ undefined,
    )
  }

  function createMethodDeclaration(options: {symbol: ts.Symbol; node?: ts.Node; isSignature: true}): ts.MethodSignature[]
  function createMethodDeclaration(options: {symbol: ts.Symbol; node?: ts.Node; isSignature?: false; isStatic?: boolean}): ts.MethodDeclaration[]
  function createMethodDeclaration(options: {symbol: ts.Symbol; node?: ts.Node; isSignature?: boolean; isStatic?: boolean}) {
    const {symbol, node, isSignature, isStatic} = options
    const signatures = checker.getTypeOfSymbolAtLocation(symbol, node).getCallSignatures()
    let modifierFlags = ts.getCombinedModifierFlags(symbol.declarations[symbol.declarations.length - 1])
    modifierFlags |= isStatic ? ts.ModifierFlags.Static : 0 // add `static` modifier
    modifierFlags &= ~ts.ModifierFlags.Async // remove `async` modifier
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)
    const methodName = getPropertyName(symbol)
    const optionalToken = isOptional(symbol) ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined

    return signatures.flatMap<ts.MethodSignature | ts.MethodDeclaration>(signature => {
      const typeParameters = signature.getTypeParameters()?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node}))
      const parameters = config.generateSyntheticOverloads
        ? createSyntheticParameterDeclarations({signature, node})
        : [createParameterDeclarations({signature, node})]
      const returnType = createReturnTypeNode({signature, node})

      return isSignature
        ? parameters.map(parameters => ts.factory.createMethodSignature(modifiers, methodName, optionalToken, typeParameters, parameters, returnType))
        : parameters.map(parameters =>
            ts.factory.createMethodDeclaration(
              /* decorators */ undefined,
              modifiers,
              /* asteriskToken */ undefined,
              methodName,
              optionalToken,
              typeParameters,
              parameters,
              returnType,
              /* body */ undefined,
            ),
          )
    })
  }

  function createEnumMemberDeclaration(options: {symbol: ts.Symbol; node?: ts.Node}): ts.EnumMember {
    const {symbol, node} = options
    const propertyName = getPropertyName(symbol)
    const type = checker.getTypeOfSymbolAtLocation(symbol, node) as ts.LiteralType
    let initializer
    if (typeof type.regularType.value === 'number') {
      initializer = ts.factory.createNumericLiteral(type.regularType.value)
    } else if (typeof type.regularType.value === 'string') {
      initializer = ts.factory.createStringLiteral(type.regularType.value as any, /* isSingleQuote */ true)
    } else {
      initializer = ts.factory.createBigIntLiteral(type.regularType.value)
    }

    return ts.factory.createEnumMember(propertyName, initializer)
  }

  // #endregion LOW LEVEL DECLARATIONS

  // #region TOP LEVEL DECLARATIONS

  function createExportDefault(options: {type: ts.Type; node?: ts.Node; isExportEquals?: boolean}): ts.Statement[] {
    const {type, node, isExportEquals} = options
    if (ts.isExportAssignment(node) || ts.isVariableDeclaration(node)) {
      return [
        ts.factory.createVariableStatement(
          [ts.factory.createModifier(ts.SyntaxKind.DeclareKeyword)],
          ts.factory.createVariableDeclarationList(
            [
              ts.factory.createVariableDeclaration(
                '_default',
                /* exclamationToken */ undefined,
                createTypeNode({type, node}),
                /* initializer */ undefined,
              ),
            ],
            ts.NodeFlags.Const,
          ),
        ),
        ts.factory.createExportAssignment(
          /* decorators*/ undefined,
          /* modifiers */ undefined,
          isExportEquals,
          ts.factory.createIdentifier('_default'),
        ),
      ]
    } else {
      const symbol = type.aliasSymbol ?? type.symbol
      if (exports.symbols.has(symbol)) {
        const typeNode = createTypeNode({type, node}) as ts.TypeReferenceNode
        return [
          ts.factory.createExportAssignment(/* decorators*/ undefined, /* modifiers */ undefined, isExportEquals, typeNode.typeName as ts.Identifier),
        ]
      } else if (symbol.flags & ts.SymbolFlags.Class) {
        return [createClassDeclaration({type: type as ts.InterfaceType, name: '_default', node: node as ts.ClassDeclaration, isDefault: true})]
      } else if (symbol.flags & ts.SymbolFlags.Interface) {
        return [
          createInterfaceDeclaration({type: type as ts.InterfaceType, name: '_default', node: node as ts.InterfaceDeclaration, isDefault: true}),
        ]
      } else if (symbol.flags & ts.SymbolFlags.Function) {
        return [...createFunctionDeclaration({type: type, name: '_default', node: node as ts.FunctionDeclaration, isDefault: true})]
      }
    }
  }

  function createClassDeclaration(options: {type: ts.InterfaceType; name: string; node?: ts.ClassDeclaration; isDefault?: boolean}): ts.Statement {
    const {type, name, node, isDefault} = options

    let modifierFlags = ts.getCombinedModifierFlags(node)
    modifierFlags &= ~ts.ModifierFlags.Ambient // remove `declare` modifier
    modifierFlags |= isDefault ? ts.ModifierFlags.Default : 0 // add `default` modifier
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)
    const {extendedTypes, implementedTypes} = getBaseTypes(type)

    const heritageClauses = [] as ts.HeritageClause[]
    if (extendedTypes.length > 0) {
      const types = extendedTypes.map(type => createTypeNode({type, node}) as ts.ExpressionWithTypeArguments)
      heritageClauses.push(ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, types))
    }
    if (implementedTypes.length > 0) {
      const types = implementedTypes.map(type => createTypeNode({type, node}) as ts.ExpressionWithTypeArguments)
      heritageClauses.push(ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, types))
    }

    const [constructorSignature] = type.getConstructSignatures()

    return ts.factory.createClassDeclaration(
      /* decorators */ undefined,
      modifiers,
      name,
      constructorSignature.getTypeParameters()?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node})),
      heritageClauses,
      createClassMembers({type, node, isExtended: Boolean(extendedTypes[0])}),
    )
  }

  function createInterfaceDeclaration(options: {
    type: ts.InterfaceType
    name: string
    node?: ts.InterfaceDeclaration
    isDefault?: boolean
  }): ts.Statement {
    const {type, name, node, isDefault} = options

    let modifierFlags = ts.getCombinedModifierFlags(node)
    modifierFlags &= ~ts.ModifierFlags.Ambient // remove `declare` modifier
    modifierFlags |= isDefault ? ts.ModifierFlags.Default : 0 // add `default` modifier
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)
    const {extendedTypes} = getBaseTypes(type)

    const heritageClauses = [] as ts.HeritageClause[]
    if (extendedTypes.length > 0) {
      const types = extendedTypes.map(type => createTypeNode({type, node}) as ts.ExpressionWithTypeArguments)
      heritageClauses.push(ts.factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, types))
    }

    return ts.factory.createInterfaceDeclaration(
      /* decorators */ undefined,
      modifiers,
      name,
      /* typeParameters */ [],
      heritageClauses,
      createTypeMembers({type, node}),
    )
  }

  function createFunctionDeclaration(options: {type: ts.Type; name: string; node?: ts.FunctionDeclaration; isDefault?: boolean}): ts.Statement[] {
    const {type, name, node, isDefault} = options

    let modifierFlags = ts.getCombinedModifierFlags(node)
    modifierFlags &= ~ts.ModifierFlags.Ambient // remove `declare` modifier
    modifierFlags &= ~ts.ModifierFlags.Async // remove `async` modifier
    modifierFlags |= isDefault ? ts.ModifierFlags.Default : 0 // add `default` modifier
    const modifiers = ts.factory.createModifiersFromModifierFlags(modifierFlags)

    return type.getCallSignatures().flatMap(signature => {
      const typeParameters = signature.getTypeParameters()?.map(typeParameter => createTypeParameterDeclaration({typeParameter, node}))
      const parameters = config.generateSyntheticOverloads
        ? createSyntheticParameterDeclarations({signature, node})
        : [createParameterDeclarations({signature, node})]
      const returnType = createReturnTypeNode({signature, node})

      return parameters.map(parameters =>
        ts.factory.createFunctionDeclaration(
          /* decorators */ undefined,
          modifiers,
          /* asteriskToken */ undefined,
          name,
          typeParameters,
          parameters,
          returnType,
          /* body */ undefined,
        ),
      )
    })
  }

  function createTypeAliasDeclaration(options: {type: ts.Type; name: string; node?: ts.TypeAliasDeclaration}): ts.Statement {
    const {name, node} = options
    let {type} = options

    type = Object.create(type)
    type.aliasSymbol = undefined

    return ts.factory.createTypeAliasDeclaration(
      undefined /* decorators */,
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      name,
      node.typeParameters, // TODO figure out where it should come from
      createTypeNode({type, node, noReduce: true}),
    )
  }

  function createEnumDeclaration(options: {type: ts.Type; name: string; node?: ts.EnumDeclaration}): ts.Statement {
    const {type, name, node} = options

    return ts.factory.createEnumDeclaration(
      undefined /* decorators */,
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      name,
      type.getProperties().map(symbol => createEnumMemberDeclaration({symbol, node})),
    )
  }

  function createVariableDeclaration(options: {type: ts.Type; name: string; node?: ts.VariableDeclaration}): ts.Statement {
    const {name, node} = options
    let {type} = options

    type = Object.create(type)
    type.aliasSymbol = undefined

    return ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [ts.factory.createVariableDeclaration(name, /* exclamationToken */ undefined, createTypeNode({type, node}), /* initializer */ undefined)],
        ts.NodeFlags.Const,
      ),
    )
  }

  // #endregion TOP LEVEL DECLARATIONS
}
