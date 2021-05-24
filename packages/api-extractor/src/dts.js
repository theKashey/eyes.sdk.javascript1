const ts = require('typescript')
const {ReflectionKind} = require('typedoc')

function dts({project, context, externalModules = [], externalGlobals = []}) {
  const exports = project.children.reduce((exports, child) => {
    if (child.kind === ReflectionKind.Class) {
      return exports.concat($class(child, {exported: true}))
    } else if (child.kind === ReflectionKind.Interface) {
      return exports.concat($interface(child, {exported: true}))
    } else if (child.kind === ReflectionKind.TypeAlias) {
      return exports.concat($typedef(child, {exported: true}))
    } else if (child.kind === ReflectionKind.Enum) {
      return exports.concat($enum(child, {exported: true}))
    } else if (child.kind === ReflectionKind.Function) {
      return exports.concat($function(child, {exported: true}).join('\n'))
    } else if (child.kind === ReflectionKind.Variable) {
      return exports.concat($variable(child, {exported: true}))
    } else {
      return exports
    }
  }, [])

  return exports.join('\n\n')

  function $variable(node) {
    return $comment(node.comment) + $export(node) + `const ${node.name}: ${$type(node.type)}`
  }
  function $enum(node) {
    const members = node.children.map(member => {
      return $comment(member.comment) + `${member.name} ${member.defaultValue ? `= ${member.defaultValue}` : ''}`
    })
    return $comment(node.comment) + $export(node) + `enum ${node.name} {${members.join(',\n')}}`
  }
  function $class(node) {
    const extendedType = node.extendedTypes ? $type(node.extendedTypes[0], {ext: true}) : null
    const extendsExpression = extendedType && !extendedType.unknown ? `extends ${extendedType}` : ''
    const implementedTypes = node.implementedTypes
      ? node.implementedTypes.map(type => $type(type)).filter(type => !type.unknown)
      : []
    const implementsExpression = implementedTypes.length ? `implements ${implementedTypes.join(', ')}` : ''

    const replacer = [extendedType, ...implementedTypes].reduce((replacer, typeReference) => {
      if (!typeReference || typeReference.reflection) return replacer
      const typeDeclaration =
        typeReference.declaration ||
        typeReference._target.declarations.find(
          declaration => ts.isClassDeclaration(declaration) || ts.isClassExpression(declaration),
        )
      return typeDeclaration ? $replacer(typeReference, typeDeclaration, replacer) : replacer
    }, null)

    const members = node.children.reduce((members, member) => {
      if (member.inheritedFrom && !extendedType.unknown) return members
      const parent = !member.flags.isStatic ? {_replacer: replacer} : undefined
      if (member.kind === ReflectionKind.Constructor) return members.concat($constructor(member, parent))
      else if (member.kind === ReflectionKind.Property) return members.concat($property(member, parent))
      else if (member.kind === ReflectionKind.Accessor) return members.concat($accessor(member, parent))
      else if (member.kind === ReflectionKind.Method) return members.concat($method(member, parent))
      else return members
    }, [])

    const isNamedExport = node.name !== 'default' && node.name !== 'export='
    const name = !isNamedExport ? node.escapedName : node.name
    const isDuplication =
      !isNamedExport && project.children.some(child => child.name === name && child.kind === ReflectionKind.Class)

    if (isDuplication) {
      return $comment(node.comment) + $export(node) + name
    } else {
      return (
        $comment(node.comment) +
        $export(node) +
        (node.flags.isAbstract ? 'abstract ' : '') +
        `class ${name}${$generics(node)} ${extendsExpression} ${implementsExpression} {${members.join('\n')}}`
      )
    }
  }
  function $interface(node) {
    const extendedTypes = node.extendedTypes
      ? node.extendedTypes.map(type => $type(type, {ext: true})).filter(type => !type.unknown)
      : []
    const extendsExpression = extendedTypes ? `extends ${extendedTypes.join(', ')}` : ''

    const members = node.children.reduce((members, member) => {
      if (member.kindString === 'Constructor') return members.concat($constructor(member))
      else if (member.kindString === 'Property') return members.concat($property(member))
      else if (member.kindString === 'Accessor') return members.concat($accessor(member))
      else if (member.kindString === 'Method') return members.concat($method(member))
      else members
    }, [])

    return (
      $comment(node.comment) +
      $export(node) +
      `interface ${node.name}${$generics(node)} ${extendsExpression} {${members.join('\n')}}`
    )
  }
  function $typedef(node) {
    return (
      $comment(node.comment) + $export(node) + `type ${node.name}${$generics(node)} = ${$type(node.type, {ext: true})}`
    )
  }
  function $function(node) {
    const signatures = $signatures(node.signatures || node.type.declaration.signatures)
    return signatures.map(signature => {
      return $comment(signature.comment) + $export(node) + `function ${node.name}${signature}`
    })
  }

  function $constructor(node) {
    return node.signatures.map(signature => {
      if (signature.name === 'new __type') {
        return $comment(signature.comment) + `new ${$arguments(signature)}: ${$type(signature.type)}`
      } else {
        return $comment(signature.comment) + `${$flags(signature)} constructor${$arguments(signature)}`
      }
    })
  }
  function $accessor(node, parent) {
    const signatures = []
    if (node.getSignature) {
      const getter = node.getSignature
      signatures.push(
        $comment(getter.comment) + `${$flags(getter.flags)} get ${node.name}(): ${$type(getter.type, {parent})}`,
      )
    }
    if (node.setSignature) {
      const setter = node.setSignature
      signatures.push(
        $comment(setter.comment) + `${$flags(setter.flags)} set ${node.name}${$arguments(setter, parent)}`,
      )
    }
    return signatures
  }
  function $method(node, parent) {
    const signatures = $signatures(node.signatures || node.type.declaration.signatures, parent)
    return signatures.map(signature => {
      return (
        $comment(signature.comment) +
        `${$flags(node.flags)} ${node.name}${node.flags.isOptional ? '?' : ''}${signature}`
      )
    })
  }
  function $property(node, parent) {
    const type = $type(node.type, {parent})
    if (type.type === 'reflection' && type.declaration.signatures) return $method(node, parent)
    const name = !/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(node.name) ? `'${node.name}'` : node.name
    return $comment(node.comment) + `${$flags(node.flags)} ${name}${node.flags.isOptional ? '?' : ''}: ${type}`
  }

  function $flags(flags) {
    const modifiers = [
      flags.isPrivate ? 'private' : '',
      flags.isProtected ? 'protected' : '',
      flags.isAbstract ? 'abstract' : '',
      flags.isStatic ? 'static' : '',
      flags.isReadonly ? 'readonly' : '',
    ]
    return modifiers.filter(flag => Boolean(flag)).join(' ')
  }
  function $generics(node) {
    const generics = node.typeParameter || node.typeParameters
    if (!generics) return ''

    const types = generics.map(param => {
      const extendedType = param.type ? $type(param.type) : null
      const extendsExpression = extendedType && !extendedType.unknown ? `extends ${extendedType}` : ''
      return `${param.name} ${extendsExpression} ${param.default ? `= ${$type(param.default)}` : ''}`
    })

    return `<${types.join(', ')}>`
  }
  function $arguments(node, parent) {
    if (!node.parameters) return '()'

    const args = node.parameters.map(param => {
      const paramType = $type(param.type, {parent})
      return `${param.flags.isRest ? '...' : ''}${param.name}${param.flags.isOptional ? '?' : ''}: ${paramType}`
    })

    return `(${args.join(', ')})`
  }

  function $comment(comment) {
    if (!comment || comment.tags.length === 0) return ''
    const tags = comment.tags.map(tag => `@${tag.tagName} ${/[^\s\n\r\t]/.test(tag.text) ? tag.text : ''}`)
    if (tags.length === 1) return `/** ${tags[0]}*/\n`
    return `/**\n${tags.map(tag => ` * ${tag}`).join('\n')}\n */\n`
  }
  function $export(node) {
    if (node.name === 'default') {
      return 'export default '
    } else if (node.name === 'export=') {
      return 'export = '
    } else {
      return 'export '
    }
  }
  function $signatures(signatures, parent) {
    return signatures
      .reduce((signatures, signature) => {
        if (!signature.parameters || signature.parameters.length === 0) return signatures.concat(signature)

        const overloadSignatures = signature.parameters
          .map(param => {
            const types = $type(param.type, {parent, reflection: param}).spread()
            return types.map(type => ({...param, type}))
          })
          .reduce((paramsA, paramsB) => {
            return paramsA.reduce((params, paramA) => {
              return params.concat(paramsB.map(paramB => [].concat(paramA, paramB)))
            }, [])
          })
          .map(params => (Array.isArray(params) ? params : [params]))
          .map(parameters => ({...signature, parameters}))

        return signatures.concat(overloadSignatures)
      }, [])
      .map(signature => ({...signature, toString: () => toString(signature)}))

    function toString(signature) {
      const type = $type(signature.type, {parent, reflection: signature.parent})
      return `${$generics(signature)}${$arguments(signature, parent)}: ${type}`
    }
  }
  function $type(type, {parent = {}, reflection, ext} = {}) {
    const state = {_type: type, _replacer: parent._replacer || type._replacer, spread, toString}
    const wrapper = new Proxy(state, {
      get: (target, key) => Reflect.get(key in target ? target : target._type, key),
    })

    if (reflection) {
      const symbol = project.reflectionIdToSymbolMap.get(reflection.id)
      if (symbol) {
        wrapper._type = context.converter.convertType(context, symbol.declarations[0].type)
      }
    }

    if (wrapper.type === 'reference' && wrapper._replacer) {
      const replacedType = wrapper._replacer(wrapper)
      if (replacedType) {
        wrapper._type = replacedType
        wrapper._replacer = null
      }
    }

    if (
      wrapper.type === 'reference' &&
      !wrapper.reflection &&
      !externalGlobals.some(name => new RegExp(`^${name}(\\.|$)`).test(wrapper.name))
    ) {
      const {unknown, type, replacer} = convert(wrapper)
      if (unknown) wrapper.unknown = unknown
      if (type) wrapper._type = type
      if (replacer) wrapper._replacer = replacer
    }

    return wrapper

    function convert(typeReference) {
      if (!ext) {
        const inheritedType = project.children.find(child => {
          if (child.kind === ReflectionKind.Class) {
            return child.extendedTypes && child.extendedTypes.some(extendedType => typeReference.equals(extendedType))
          } else if (child.kind === ReflectionKind.TypeAlias) {
            return typeReference.equals(child.type)
          }
        })
        if (inheritedType) return {type: {type: 'unknown', name: inheritedType.name}}
      }

      const [declaration] = typeReference._target.declarations
      const source = declaration.getSourceFile()
      if (source) {
        if (source && source.path.includes('node_modules/typescript')) return {builtin: true}
        const moduleName = externalModules.find(name => {
          return source.path.includes(`node_modules/${name}`) || source.path.includes(`node_modules/@types/${name}`)
        })
        const typeName = typeReference._target.escapedName || typeReference.name
        if (moduleName) {
          return {
            type: {
              type: 'unknown',
              name: `import('${moduleName}').${typeName}`,
              typeArguments: typeReference.typeArguments,
            },
          }
        }
      }

      const typeDeclaration = typeReference._target.declarations.find(ts.isTypeAliasDeclaration)
      if (typeDeclaration) {
        const source = typeDeclaration.getSourceFile()
        if (source && source.path.includes('node_modules/typescript')) return {builtin: true}
        return {
          type: context.converter.convertType(context, typeDeclaration.type),
          replacer: typeReference.typeArguments
            ? $replacer(typeReference, typeDeclaration, typeReference._replacer)
            : null,
        }
      }

      return {unknown: true}
    }

    function spread(parent = wrapper) {
      return parent.type === 'union'
        ? parent.types.reduce((types, type) => types.concat(spread($type(type, {parent}))), [])
        : [parent]
    }

    function toString() {
      const parent = wrapper
      if (wrapper.type === 'literal') return `${JSON.stringify(wrapper.value)}`
      if (wrapper.type === 'array') return `(${$type(wrapper.elementType, {parent})})[]`
      if (wrapper.type === 'intersection') return `(${wrapper.types.map(type => $type(type, {parent})).join('&')})`
      if (wrapper.type === 'union') return `${wrapper.types.map(type => $type(type, {parent})).join('|')}`
      if (wrapper.type === 'predicate') return `${wrapper.name} is (${$type(wrapper.targetType, {parent})})`
      if (wrapper.type === 'template-literal') {
        if (wrapper.tail.length === 1) {
          const [[stringifiedType, ending]] = wrapper.tail
          if (wrapper.head === '' && ending === '') {
            if (stringifiedType.type === 'reference' && stringifiedType.reflection.kind === ReflectionKind.Enum) {
              const literals = stringifiedType.reflection.children.reduce((literals, member) => {
                const literal = `${member.defaultValue}`.replace(/"/g, '')
                if (!literals.includes(literal)) literals.push(literal)
                return literals
              }, [])
              return `${$type({type: 'union', types: literals.map(value => ({type: 'literal', value}))})}`
            }
          }
        }
        const templateLiteral = wrapper.tail.reduce((tail, [type, ending]) => {
          return `${tail}\${${$type(type, {parent})}}${ending}`
        }, wrapper.head)
        return `\`${templateLiteral}\``
      }
      if (wrapper.type === 'mapped') {
        const parameterType = $type(wrapper.parameterType, {parent})
        const templateType = $type(wrapper.templateType, {parent})
        return `{[${wrapper.parameter} in ${parameterType}]: ${templateType}}`
      }
      if (wrapper.type === 'reflection') {
        const parts = []
        if (wrapper.declaration.children) {
          const members = wrapper.declaration.children.reduce((members, member) => {
            if (member.kind === ReflectionKind.Property) return members.concat($property(member, parent))
            else if (member.kind === ReflectionKind.Accessor) return members.concat($accessor(member, parent))
            else if (member.kind === ReflectionKind.Method) return members.concat($method(member, parent))
            else if (member.kind === ReflectionKind.Constructor) return members.concat($constructor(member, parent))
          }, [])
          parts.push(...members)
        }
        if (wrapper.declaration.signatures) {
          parts.push(...$signatures(wrapper.declaration.signatures, parent))
        }
        if (wrapper.declaration.indexSignature) {
          const signature = wrapper.declaration.indexSignature
          parts.push(
            `[${signature.parameters[0].name}: ${signature.parameters[0].type}]: ${$type(signature.type, {parent})}`,
          )
        }
        return `{${parts.join('; ')}}`
      }

      const name = wrapper.reflection ? wrapper.reflection.name : wrapper.name

      if (wrapper.typeArguments && wrapper.typeArguments.length > 0) {
        return `${name}<${wrapper.typeArguments.map(type => $type(type, {parent})).join(', ')}>`
      } else {
        return name
      }
    }
  }
  function $replacer(typeReference, typeDeclaration, parent) {
    if (!typeReference.typeArguments) return null
    replace.sequence = parent && parent.sequence ? [...parent.sequence] : []
    replace.sequence.unshift({
      typeArguments: typeReference.typeArguments,
      typeParameters: typeDeclaration.typeParameters,
    })

    return replace

    function replace(type) {
      const replacedType = replace.sequence.reduce((replacedType, {typeArguments, typeParameters}) => {
        return (
          typeArguments.find(
            (_, index) => typeParameters[index] && type.name === typeParameters[index].name.escapedText,
          ) || replacedType
        )
      }, type)
      return replacedType !== type ? replacedType : null
    }
  }
}

module.exports = dts
