import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminListPqrsComponent } from './admin-list-pqrs.component';

describe('AdminListPqrsComponent', () => {
  let component: AdminListPqrsComponent;
  let fixture: ComponentFixture<AdminListPqrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminListPqrsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminListPqrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
