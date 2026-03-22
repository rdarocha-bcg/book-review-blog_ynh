import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NotificationService] });
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getNotifications() should emit empty array initially', (done) => {
    service.getNotifications().subscribe((list) => {
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(0);
      done();
    });
  });

  it('success() should add a success notification', (done) => {
    service.getNotifications().subscribe((list) => {
      if (list.length > 0 && list[0].type === 'success') {
        expect(list[0].message).toBe('Done');
        expect(list[0].type).toBe('success');
        done();
      }
    });
    service.success('Done', 0);
  });

  it('error() should add an error notification', (done) => {
    service.getNotifications().subscribe((list) => {
      if (list.length > 0 && list[0].type === 'error') {
        expect(list[0].message).toBe('Failed');
        expect(list[0].type).toBe('error');
        done();
      }
    });
    service.error('Failed', 0);
  });

  it('warning() should add a warning notification', (done) => {
    service.getNotifications().subscribe((list) => {
      if (list.length > 0 && list[0].type === 'warning') {
        expect(list[0].type).toBe('warning');
        done();
      }
    });
    service.warning('Careful', 0);
  });

  it('info() should add an info notification', (done) => {
    service.getNotifications().subscribe((list) => {
      if (list.length > 0 && list[0].type === 'info') {
        expect(list[0].type).toBe('info');
        done();
      }
    });
    service.info('Note', 0);
  });

  it('remove() should remove notification by id', (done) => {
    service.success('To remove', 0);
    let idToRemove: string;
    service.getNotifications().subscribe((list) => {
      if (list.length === 1 && !idToRemove) {
        idToRemove = list[0].id;
        service.remove(idToRemove);
      }
      if (list.length === 0) done();
    });
  });

  it('clear() should remove all notifications', (done) => {
    service.success('A', 0);
    service.error('B', 0);
    service.clear();
    service.getNotifications().subscribe((list) => {
      expect(list.length).toBe(0);
      done();
    });
  });
});
