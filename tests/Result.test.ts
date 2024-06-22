import {
    ErrTag,
    err,
    OkTag,
    ok,
    type ErrObject,
    type OkObject,
    just,
    nothing,
} from '../src'
import { fromObject, fromPromise, fromString } from '../src/Result'

type Fn = (num: number) => string

test('ok', () => {
    expect(ok(1)).toEqual({ _value: 1 })
    expect(fromObject({ _tag: OkTag, _value: 1 } as OkObject<number>)).toEqual({ _value: { _value: 1 } })
    expect(fromString('{"_tag":"Ok","_value":1}')).toEqual({ _value: { _value: 1 } })
    expect(fromPromise(Promise.resolve(1))).resolves.toEqual({ _value: 1 })
})

test('err', () => {
    expect(err(1)).toEqual({ _msg: 1 })
    expect(fromObject({ _tag: ErrTag, _msg: 1 } as ErrObject<number>)).toEqual({ _value: { _msg: 1 } })
    expect(fromString('{"_tag":"Err","_msg":1}')).toEqual({ _value: { _msg: 1 } })
    expect(fromPromise(Promise.reject(1))).resolves.toEqual({ _msg: 1 })
})

test('ok methods', () => {
    expect(ok(1).unwrap()).toEqual(1)
    expect(ok(1).unwrapOr(2)).toEqual(1)
    expect(ok(1).unwrapOrElse(() => 2)).toEqual(1)
    expect(ok(1).unwrapErr).toThrow('Call unwrapErr on Ok!')

    expect(ok(1).isErr()).toBe(false)
    expect(ok(1).isOk()).toBe(true)

    expect(ok(1).map((v) => v + 1)).toEqual({ _value: 2 })
    expect(ok(1).mapOr((v) => v + 1, 2)).toEqual(2)
    expect(ok(1).mapOrElse((v) => v + 1, () => 2)).toEqual(2)
    expect(ok<number, number>(1).mapErr((v) => v + 1)).toEqual({ _value: 1 })

    expect(ok<number, number>(1).bind((v) => ok(v + 1))).toEqual({ _value: 2 })
    expect(ok<Fn, number>(num => num.toString()).ap<number, string>(ok(1))).toEqual({ _value: '1' })

    expect(ok(1).toMaybe()).toEqual(just(1))

    expect(ok(1).do((v) => v + 1, e => e)).toEqual(2)
    expect(ok(1).match((v) => v + 1, e => e)).toEqual(2)
})

test('err methods', () => {
    expect(err(1).unwrap).toThrow('Call unwrap on Err!')
    expect(err(1).unwrapErr()).toEqual(1)
    expect(err(1).unwrapOr(2)).toEqual(2)
    expect(err(1).unwrapOrElse(() => 2)).toEqual(2)

    expect(err(1).isErr()).toBe(true)
    expect(err(1).isOk()).toBe(false)

    expect(err<number, number>(1).map((v) => v + 1)).toEqual({ _msg: 1 })
    expect(err<number, number>(1).mapOr((v) => v + 1, 2)).toEqual(2)
    expect(err<number, number>(1).mapOrElse((v) => v + 1, () => 3)).toEqual(3)
    expect(err<number, number>(1).mapErr((v) => v + 1)).toEqual({ _msg: 2 })

    expect(err<number, number>(1).bind((v) => ok(v + 1))).toEqual({ _msg: 1 })
    expect(err<Fn, number>(1).ap<number, string>(ok(1))).toEqual({ _msg: 1 })

    expect(err(1).toMaybe()).toEqual(nothing())

    expect(err<number, number>(1).do((v) => v + 1, e => e)).toEqual(1)
    expect(err<number, number>(1).match(() => 1, () => 2)).toEqual(2)
})

test('json stringify', () => {
    expect(JSON.stringify(ok(1))).toEqual('{"_tag":"Ok","_value":1}')
    expect(JSON.stringify(err(1))).toEqual('{"_tag":"Err","_msg":1}')
})