import {
    JustTag,
    just,
    fromNullable,
    nothing,
    NothingTag,
    ok,
    err
} from '../src'
import {
    fromObject,
    fromString,
    type JustObject,
    type NothingObject
} from '../src/Maybe'

type Fn = (num: number) => string

test('just', () => {
    expect(just(1)).toEqual({ _value: 1 })
    expect(fromObject({ _tag: JustTag, _value: 1 } as JustObject<number>)).toEqual({ _value: { _value: 1 } })
    expect(fromString('{"_tag":"Just","_value":1}')).toEqual({ _value: { _value: 1 } })
    expect(fromNullable(1)).toEqual({ _value: 1 })
})

test('nothing', () => {
    expect(nothing()).toEqual({})
    expect(fromObject({ _tag: NothingTag } as NothingObject)).toEqual({ _value: {} })
    expect(fromString('{"_tag":"Nothing"}')).toEqual({ _value: {} })
    expect(fromNullable(null)).toEqual({})
})

test('just methods', () => {
    expect(just(1).unwrap()).toEqual(1)
    expect(just(1).unwrapOr(2)).toEqual(1)
    expect(just(1).unwrapOrElse(() => 2)).toEqual(1)

    expect(just(1).isJust()).toBe(true)
    expect(just(1).isNothing()).toBe(false)

    expect(just(1).map((v) => v + 1)).toEqual({ _value: 2 })
    expect(just(1).mapOr((v) => v + 1, 3)).toEqual(2)
    expect(just(1).mapOrElse((v) => v + 1, () => 3)).toEqual(2)

    expect(just(1).bind((v) => just(v + 1))).toEqual({ _value: 2 })
    expect(just<Fn>(num => num.toString()).ap(just(1))).toEqual({ _value: '1' })

    expect(just(1).toResult(2)).toEqual(ok(1))

    expect(just(1).do((v) => v + 1, () => 3)).toEqual(2)
    expect(just(1).match((v) => v + 1, () => 3)).toEqual(2)

})

test('nothing methods', () => {
    expect(nothing().unwrap).toThrow('Call unwrap on Nothing!')
    expect(nothing().unwrapOr(1)).toEqual(1)
    expect(nothing().unwrapOrElse(() => 1)).toEqual(1)

    expect(nothing().isJust()).toBe(false)
    expect(nothing().isNothing()).toBe(true)

    expect(nothing<number>().map((v) => v + 1)).toEqual({})
    expect(nothing<number>().mapOr((v) => v + 1, 1)).toEqual(1)
    expect(nothing<number>().mapOrElse((v) => v + 1, () => 1)).toEqual(1)

    expect(nothing<number>().bind((v) => just(v + 1))).toEqual({})
    expect(nothing<Fn>().ap(just(1))).toEqual({})

    expect(nothing().toResult(1)).toEqual(err(1))

    expect(nothing<number>().do((v) => v + 1, () => 1)).toEqual(1)
    expect(nothing<number>().match((v) => v + 1, () => 1)).toEqual(1)
})

test('json stringify', () => {
    expect(JSON.stringify(just(1))).toEqual('{"_tag":"Just","_value":1}')
    expect(JSON.stringify(nothing())).toEqual('{"_tag":"Nothing"}')
})