import { err, ok, type Result } from './Result'

export const enum MaybeTag {
  Just = 'Just',
  Nothing = 'Nothing',
}
export type Maybe<A> = Just<A> | Nothing<A>
/**
 * @description create a Just<A> from value
 * @param value the Maybe<A> value A
 * @returns Maybe<A>
 */
export const just = <A>(value: A) => Just.of(value)
/**
 * @description create a Nothing<A>
 * @returns Maybe<A>
 */
export const nothing = <A>() => Nothing.of<A>()
export interface JustObject<A> {
  _tag: MaybeTag.Just
  _value: A
}
export interface NothingObject {
  _tag: MaybeTag.Nothing
}

/**
 * @description convert a JustObject<A> or NothingObject to a Maybe<A>
 */
export const fromObject = <A>(obj: JustObject<A> | NothingObject): Result<Maybe<A>, string> => {
  try {
    if (!obj || !obj._tag || (obj._tag !== MaybeTag.Just && obj._tag !== MaybeTag.Nothing)) {
      throw new SyntaxError('Cannot parse to a Maybe')
    }
    if (obj._tag === MaybeTag.Just) {
      return ok(just(obj._value))
    } else {
      return ok(nothing())
    }
  } catch (error) {
    return err((error as SyntaxError).message)
  }
}
/**
 * @description convert a string generated by stringify the Maybe<A> to a Maybe<A>
 */
export const fromString = <A>(s: string): Result<Maybe<A>, string> => {
  try {
    const obj: JustObject<A> | NothingObject = JSON.parse(s)
    return fromObject(obj)
  } catch (error) {
    return err((error as SyntaxError).message)
  }
}
/**
 * Creates a Maybe instance from a nullable value.
 * @param {A | null | undefined} value - The value to create the Maybe instance from.
 * @return {Maybe<A>} - The Maybe instance created from the value.
 */
export const fromNullable = <A>(value: A | null | undefined): Maybe<A> => {
  if (value === null || value === undefined) {
    return nothing()
  } else {
    return just(value)
  }
}
export default {
  just,
  nothing,
  JustTag: MaybeTag.Just,
  NothingTag: MaybeTag.Nothing,
  fromObject,
  fromString,
  fromNullable,
}

class Just<A> implements MaybeMethods<A> {
  private _value: A
  constructor(value: A) {
    this._value = value
  }

  static of<A>(value: A): Maybe<A> {
    return new Just(value)
  }

  map<B>(f: (v: A) => B): Maybe<B> {
    return just(f(this.unwrap()))
  }
  mapOr<B>(f: (v: A) => B, defaultValue: B): B {
    return f(this.unwrap())
  }
  mapOrElse<B>(f: (v: A) => B, defaultValue: () => B): B {
    return f(this.unwrap())
  }
  unwrap(): A {
    return this._value
  }
  unwrapOr(elseValue: A): A {
    return this.unwrap()
  }
  unwrapOrElse(f: () => A): A {
    return this.unwrap()
  }
  isJust(): this is Just<A> {
    return true
  }
  isNothing(): this is Nothing<A> {
    return false
  }
  ap<B, A>(other: Maybe<A>): Maybe<B> {
    return other.map(this.unwrap() as (v: A) => B)
  }
  bind<B>(f: (a: A) => Maybe<B>): Maybe<B> {
    return f(this.unwrap())
  }
  toResult<B>(err: B): Result<A, B> {
    return ok(this.unwrap())
  }
  private toJSON(): JustObject<A> {
    return {
      _tag: MaybeTag.Just,
      _value: this.unwrap()
    }
  }
  private get [Symbol.toStringTag](): string {
    return MaybeTag.Just
  }
}

class Nothing<A> implements MaybeMethods<A> {
  static of<A>(): Maybe<A> {
    return new Nothing()
  }
  unwrap(): A {
    throw new TypeError('Call unwrap on Nothing!')
  }
  unwrapOr(elseValue: A): A {
    return elseValue
  }
  unwrapOrElse(f: () => A): A {
    return f()
  }
  isJust(): this is Just<A> {
    return false
  }
  isNothing(): this is Nothing<A> {
    return true
  }
  map<B>(f: (v: A) => B): Maybe<B> {
    return nothing()
  }
  mapOr<B>(f: (v: A) => B, defaultValue: B): B {
    return defaultValue
  }
  mapOrElse<B>(f: (v: A) => B, defaultValue: () => B): B {
    return defaultValue()
  }
  ap<B, A>(f: Maybe<A>): Maybe<B> {
    return nothing()
  }
  bind<B>(f: (a: A) => Maybe<B>): Maybe<B> {
    return nothing()
  }
  toResult<B>(e: B): Result<A, B> {
    return err(e)
  }
  private toJSON(): NothingObject {
    return {
      _tag: MaybeTag.Nothing,
    }
  }
  private get [Symbol.toStringTag](): string {
    return MaybeTag.Nothing
  }
}

interface MaybeFunctor<A> {
  /**
   * @description convert Maybe<A> to Maybe<B> without unwrap the Maybe type which may caust an error
   */
  map: <B>(f: (v: A) => B) => Maybe<B>
}
interface MaybeApplicative<A> {
  /**
   * @description apply a Maybe<(a: A) => B> to a Maybe<A>,
   * note that the caller instance should be Maybe<(a: A) => B>.
   */
  ap: <B>(other: Maybe<A>) => Maybe<B>
}
interface MaybeMonad<A> {
  /**
   * @description apply a function to the Maybe value without concerning about Nothing.
   * return Nothing if Nothing.
   */
  bind: <B>(f: (a: A) => Maybe<B>) => Maybe<B>
}

interface MaybeMethods<A> extends MaybeFunctor<A>, MaybeApplicative<A>, MaybeMonad<A> {
  isJust: () => boolean
  isNothing: () => boolean
  /**
   * @description returns the contained Maybe value, would panic on Nothing.
   */
  unwrap: () => A
  /**
   * @description returns the contained Maybe value or a provided default value(if Nothing).
   */
  unwrapOr: (defaultValue: A) => A
  /**
   * @description returns the contained Maybe value or return the parameter function's return value(if Nothing).
   */
  unwrapOrElse: (f: () => A) => A
  /**
   * @description returns the provided default result (if Nothing),
   * or applies the function to the contained value (if Just).
   */
  mapOr: <B>(f: (v: A) => B, defaultValue: B) => B
  /**
   * @description computes a default function result (if Nothing),
   * or applies a different function to the contained value (if Just).
   */
  mapOrElse: <B>(f: (v: A) => B, defaultValue: () => B) => B
  /**
   * @description transforms the Maybe<A> into a Result<A, B>, mapping Just<A> to Ok<A> and Nothing to Err<B>.
   */
  toResult: <B>(err: B) => Result<A, B>
}
