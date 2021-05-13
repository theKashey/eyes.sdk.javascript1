function useEmitter() {
  const hooks = {deps: [], vars: [], beforeEach: [], afterEach: []}
  const commands = []
  const types = {}
  const syntax = new Proxy(new Object(), {
    get(target, key) {
      if (key in target) return Reflect.get(target, key)
      throw new Error(
        `EmitTracker don't have an implementation for "${key}" syntax. Use ".addSyntax('${key}', <impl>)" method to add an implementation`,
      )
    },
  })
  const deref = ref => (ref.isRef ? ref.ref() : ref)
  const ref = (name, value) => (value.isRef ? value.ref(name) : value)
  const operators = {
    add: (left, right) => useRef({deref: () => `${deref(left)} + ${deref(right)}`}),
    sub: (left, right) => useRef({deref: () => `${deref(left)} - ${deref(right)}`}),
    mul: (left, right) => useRef({deref: () => `${deref(left)} * ${deref(right)}`}),
    div: (left, right) => useRef({deref: () => `${deref(left)} / ${deref(right)}`}),
    pow: (left, right) => useRef({deref: () => `${deref(left)} ** ${deref(right)}`}),
  }

  return [
    {hooks, commands},
    {useRef, withScope, addSyntax, addExpression, addHook, addCommand, addType, addOperator},
    {operators, ref},
  ]

  function addHook(name, value) {
    switch (name) {
      case 'deps':
      case 'vars':
      case 'beforeEach':
      case 'afterEach':
        return hooks[name].push(value)
      default:
        throw new Error(
          `Unsupported hook ${name}. Please specify one of either ${Object.keys(hooks).join(', ')}`,
        )
    }
  }

  function addCommand(command) {
    if (Array.isArray(command)) {
      const [result] = command.map(command => {
        if (typeof command === 'function') {
          const result = command()
          if (result && result.isRef) {
            addCommand(syntax.return({value: result.ref(), type: result.type()}))
          }
        } else {
          return addCommand(command)
        }
      })
      return result
    }
    const id = commands.push(typeof command === 'function' ? command() : command)
    return useRef({
      deref({name = `var_${id}`, type} = {}) {
        const value = commands[id - 1]
        commands[id - 1] = syntax.var({constant: true, name, value, type})
        return name
      },
    })
  }

  function addExpression(expression) {
    const id = commands.push('') - 1
    return useRef({
      deref({name, type} = {}) {
        if (name) {
          commands[id] = syntax.var({constant: true, name, value: expression, type})
          return name
        } else {
          return expression
        }
      },
    })
  }

  function addSyntax(name, callback) {
    syntax[name] = callback
  }

  function addOperator(name, callback) {
    operators[name] = callback
  }

  function addType(name, options) {
    types[name] = {...options, name}
  }

  function useType(type) {
    if (typeof type === 'object') {
      return typeof type.type === 'string' ? {...type, ...useType(type.type)} : type
    } else if (typeof type !== 'string') {
      return null
    }

    const match = type.match(/(?<name>[A-Za-z][A-Za-z0-9_]*)(<(?<generic>.*)>)?/)
    if (!match) {
      throw new Error(
        'Type format is incorrect. Please follow the convention (e.g. TypeName or Type1<Type2, Type3>)',
      )
    }

    return {
      ...types[match.groups.name],
      name: match.groups.name,
      generic: match.groups.generic ? match.groups.generic.split(/, ?/).map(useType) : null,
    }
  }

  function useRef({deref, type}) {
    const ref = {
      isRef: true,
      _deref: deref,
      _type: useType(type),

      ref(name) {
        if (!name) {
          if (typeof ref._deref === 'function') {
            ref._deref = ref._deref({type: ref._type, name: ref._name})
          }
          return ref._deref
        }
        ref._name = name
        return this
      },
      type(type) {
        if (!type) return ref._type
        ref._type = useType(type)
        return this
      },
      as(type) {
        const castType = useType(type)
        const currentType = ref.type()
        const cast = (currentType && currentType.cast) || syntax.cast
        return useRef({
          deref: () => cast({target: ref.ref(), currentType, castType}),
          type: castType,
        })
      },
      methods(methods) {
        Object.entries(methods).forEach(([name, func]) => {
          ref[name] = func.bind(null, this)
        })
        return this
      },
    }

    return new Proxy(function () {}, {
      get(_target, prop, proxy) {
        if (prop in ref) return Reflect.get(ref, prop, proxy)
        const currentType = ref.type()
        let getter = syntax.getter
        let key = JSON.stringify(prop).slice(1, -1)
        let type
        if (currentType) {
          if (prop === Symbol.iterator && currentType.iterable) {
            let index = 0
            return () => ({next: () => ({value: proxy[index], done: false})})
          }
          getter = currentType.getter || getter
          if (currentType.schema && currentType.schema[prop]) {
            type = currentType.schema[prop]
            key = currentType.schema[prop].rename || key
          } else if (currentType.items) {
            type = currentType.items
          } else if (currentType.recursive) {
            type = currentType
          }
        }
        return useRef({deref: () => getter({target: ref.ref(), type: currentType, key}), type})
      },
      apply(_target, _this, args) {
        const type = ref.type()
        const call = (type && type.call) || syntax.call
        return useRef({deref: () => call({target: ref.ref(), args: Array.from(args), type})})
      },
    })
  }

  function withScope(logic, scope = []) {
    return () => logic(...scope.map(name => useRef({deref: name})))
  }
}

function withHistory(groups) {
  const history = []
  const emitters = Object.entries(groups).reduce((emitters, [name, commands]) => {
    return Object.assign(emitters, {[name]: wrapCommand(name, commands)})
  }, {})
  return [history, emitters]

  function wrapCommand(name, commands) {
    return new Proxy(commands, {
      get(target, key) {
        return wrapCommand(`${name}.${key}`, Reflect.get(target, key))
      },
      apply(target, thisArg, args) {
        const result = Reflect.apply(target, thisArg, args)
        history.push({name, args, result})
        return result
      },
    })
  }
}

exports.useEmitter = useEmitter
exports.withHistory = withHistory
