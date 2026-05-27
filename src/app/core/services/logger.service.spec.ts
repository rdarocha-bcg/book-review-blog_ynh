import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('in development mode (isProd = false)', () => {
    beforeEach(() => {
      (service as unknown as { isProd: boolean }).isProd = false;
    });

    it('log() should call console.log', () => {
      spyOn(console, 'log');
      service.log('test message');
      expect(console.log).toHaveBeenCalledWith('[INFO] test message');
    });

    it('log() should include context when provided', () => {
      spyOn(console, 'log');
      service.log('msg', { key: 'value' });
      expect(console.log).toHaveBeenCalledWith('[INFO] msg', { key: 'value' });
    });

    it('debug() should call console.debug', () => {
      spyOn(console, 'debug');
      service.debug('debug message');
      expect(console.debug).toHaveBeenCalledWith('[DEBUG] debug message');
    });

    it('warn() should call console.warn', () => {
      spyOn(console, 'warn');
      service.warn('warning');
      expect(console.warn).toHaveBeenCalledWith('[WARN] warning');
    });

    it('error() should call console.error with message', () => {
      spyOn(console, 'error');
      service.error('error message');
      expect(console.error).toHaveBeenCalledWith('[ERROR] error message');
    });

    it('error() should include Error object when provided', () => {
      spyOn(console, 'error');
      const err = new Error('boom');
      service.error('failed', err);
      expect(console.error).toHaveBeenCalledWith('[ERROR] failed', err);
    });
  });

  describe('in production mode (isProd = true)', () => {
    beforeEach(() => {
      (service as unknown as { isProd: boolean }).isProd = true;
    });

    it('log() should NOT call console.log', () => {
      spyOn(console, 'log');
      service.log('should be silent');
      expect(console.log).not.toHaveBeenCalled();
    });

    it('debug() should NOT call console.debug', () => {
      spyOn(console, 'debug');
      service.debug('silent');
      expect(console.debug).not.toHaveBeenCalled();
    });

    it('warn() should still call console.warn', () => {
      spyOn(console, 'warn');
      service.warn('prod warning');
      expect(console.warn).toHaveBeenCalledWith('[WARN] prod warning');
    });

    it('error() should still call console.error', () => {
      spyOn(console, 'error');
      service.error('prod error');
      expect(console.error).toHaveBeenCalledWith('[ERROR] prod error');
    });
  });
});
