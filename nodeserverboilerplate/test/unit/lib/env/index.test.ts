// tslint:disable:no-unused-expression
import { getVar, isTrue, getMode, getModeString, Modes } from '../../../../src/lib/env';
import { expect } from 'chai';

describe(`lib/env unit tests`, () => {

  describe('getVar', () => {

    it(`should get the correct value`, () => {
      process.env.VAR = 'ok';
      expect(getVar('VAR')).to.eql('ok');
    });

    it(`should throw if variable is not found`, () => {
      process.env.VAR = '';
      expect(() => getVar('VAR')).to.throw();
    });

    it(`should not throw if null variable has a default`, () => {
      process.env.VAR = '';
      expect(() => getVar('VAR', 'ok')).to.not.throw();
      expect(getVar('VAR', 'ok')).to.eql('ok');
    });

  });

  describe('isTrue', () => {

    it(`should get the correct value`, () => {
      process.env.VAR = 'true';
      expect(isTrue('VAR')).to.be.true;
      process.env.VAR = 'false';
      expect(isTrue('VAR')).to.be.false;
    });

    it(`should throw if variable is not found`, () => {
      process.env.VAR = '';
      expect(() => isTrue('VAR')).to.throw();
    });

    it(`should not throw if null variable is allowed to be empty`, () => {
      process.env.VAR = '';
      expect(() => isTrue('VAR', true)).to.not.throw();
      expect(isTrue('VAR', true)).to.be.false;
    });

  });

  describe('getMode', () => {

    const oldEnv = process.env.NODE_ENV;

    it(`should get the correct value`, () => {
      process.env.NODE_ENV = 'development';
      expect(getMode()).to.eql(Modes.Development);
      process.env.NODE_ENV = 'testing';
      expect(getMode()).to.eql(Modes.Testing);
      process.env.NODE_ENV = 'tesTING';
      expect(getMode()).to.eql(Modes.Testing);
      process.env.NODE_ENV = 'TESTING';
      expect(getMode()).to.eql(Modes.Testing);
      process.env.NODE_ENV = 'production';
      expect(getMode()).to.eql(Modes.Production);
    });

    it(`should be development if mode is undefined`, () => {
      process.env.NODE_ENV = '';
      expect(getMode()).to.eql(Modes.Development);
    });

    process.env.NODE_ENV = oldEnv;

  });

  describe('getModeString', () => {

    const oldEnv = process.env.NODE_ENV;

    it(`should get the correct value`, () => {
      process.env.NODE_ENV = 'development';
      expect(getModeString()).to.eql('Development');
      process.env.NODE_ENV = 'testing';
      expect(getModeString()).to.eql('Testing');
      process.env.NODE_ENV = 'tesTING';
      expect(getModeString()).to.eql('Testing');
      process.env.NODE_ENV = 'TESTING';
      expect(getModeString()).to.eql('Testing');
      process.env.NODE_ENV = 'production';
      expect(getModeString()).to.eql('Production');
    });

    it(`should be development if mode is undefined`, () => {
      process.env.NODE_ENV = '';
      expect(getModeString()).to.eql('Development');
    });

    process.env.NODE_ENV = oldEnv;

  });

});
