import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;
  const key = 'test_key';

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StorageService] });
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('setItem() should store value in localStorage', () => {
    const value = { name: 'Test' };
    service.setItem(key, value);
    expect(localStorage.getItem(key)).toBe(JSON.stringify(value));
  });

  it('getItem() should retrieve stored value', () => {
    const value = { id: 1 };
    localStorage.setItem(key, JSON.stringify(value));
    expect(service.getItem(key)).toEqual(value);
  });

  it('getItem() should return null for missing key', () => {
    expect(service.getItem('nonexistent')).toBeNull();
  });

  it('removeItem() should remove key from localStorage', () => {
    service.setItem(key, 'value');
    service.removeItem(key);
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('clear() should clear all localStorage', () => {
    service.setItem('a', 1);
    service.setItem('b', 2);
    service.clear();
    expect(localStorage.length).toBe(0);
  });

  it('hasItem() should return true when key exists', () => {
    service.setItem(key, true);
    expect(service.hasItem(key)).toBe(true);
  });

  it('hasItem() should return false when key does not exist', () => {
    expect(service.hasItem('nonexistent')).toBe(false);
  });
});
