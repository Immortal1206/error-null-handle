import {
  just,
  fromNullable,
  nothing,
  ok,
  err
} from '../src'
import { fromString } from '../src/Maybe'

type Fn = (num: number) => string

test('Maybe expect', () => {
  expect(just(1).expect('error')).toEqual(1)
  expect(() => nothing().expect('error')).toThrow('error')
})

test('Maybe unwrap', () => {
  expect(just(1).unwrap()).toEqual(1)
  expect(() => nothing().unwrap()).toThrow('Call unwrap on Nothing!')
})

test('Maybe unwrapOr', () => {
  expect(just(1).unwrapOr(2)).toEqual(1)
  expect(nothing().unwrapOr(2)).toEqual(2)
})

test('Maybe unwrapOrElse', () => {
  expect(just(1).unwrapOrElse(() => 2)).toEqual(1)
  expect(nothing().unwrapOrElse(() => 2)).toEqual(2)
})

test('Maybe map', () => {
  expect(just(1).map((v) => v + 1).unwrap()).toEqual(2)
  expect(() => nothing<number>().map((v) => v + 1).unwrap()).toThrow('Call unwrap on Nothing!')
})

test('Maybe mapOr', () => {
  expect(just(1).mapOr((v) => v + 1, 2)).toEqual(2)
  expect(nothing<number>().mapOr((v) => v + 1, 2)).toEqual(2)
})

test('Maybe mapOrElse', () => {
  expect(just(1).mapOrElse((v) => v + 1, () => 2)).toEqual(2)
  expect(nothing<number>().mapOrElse((v) => v + 1, () => 2)).toEqual(2)
})

test('Maybe andThen', () => {
  expect(just(1).andThen((v) => just(v + 1)).unwrap()).toEqual(2)
  expect(() => nothing<number>().andThen((v) => just(v + 1)).unwrap()).toThrow('Call unwrap on Nothing!')
})

test('Maybe ap', () => {
  expect(just<Fn>(num => num.toString()).ap(just(1)).unwrap()).toEqual('1')
  expect(() => nothing<Fn>().ap(just(1)).unwrap()).toThrow('Call unwrap on Nothing!')
})

test('Maybe toResult', () => {
  expect(just(1).toResult(2)).toEqual(ok(1))
  expect(nothing().toResult(2)).toEqual(err(2))
})

test('Maybe isJust', () => {
  expect(just(1).isJust()).toBe(true)
  expect(nothing().isJust()).toBe(false)
})

test('Maybe isNothing', () => {
  expect(just(1).isNothing()).toBe(false)
  expect(nothing().isNothing()).toBe(true)
})

test('Maybe match', () => {
  expect(just(1).match(() => 1, () => 2)).toEqual(1)
  expect(nothing().match(() => 1, () => 2)).toEqual(2)
})

test('Maybe do', () => {
  expect(just(1).do(() => 1, () => 2)).toEqual(1)
  expect(nothing().do(() => 1, () => 2)).toEqual(2)
})

test('json stringify', () => {
  expect(JSON.stringify(just(1))).toEqual('{"type":"Just","value":1}')
  expect(JSON.stringify(nothing())).toEqual('{"type":"Nothing"}')
})

test('Symbol.toStringTag', () => {
  expect(Object.prototype.toString.call(just(1))).toEqual('[object Just]')
  expect(Object.prototype.toString.call(nothing())).toEqual('[object Nothing]')
})

test('fromNullable', () => {
  expect(fromNullable(1).unwrap()).toEqual(1)
  expect(fromNullable<number>(null).unwrapOr(2)).toEqual(2)
  expect(fromNullable<number>(undefined).unwrapOr(2)).toEqual(2)
})

test('fromString', () => {
  expect(fromString('{"type":"Just","value":1}').unwrap().isJust()).toBe(true)
  expect(fromString('{"type":"Nothing"}').unwrap().isNothing()).toBe(true)
  expect(fromString('{"type":"aaa","value":1}').isErr()).toBe(true)
})