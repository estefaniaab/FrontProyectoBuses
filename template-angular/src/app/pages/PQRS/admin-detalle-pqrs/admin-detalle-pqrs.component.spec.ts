import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDetallePqrsComponent } from './admin-detalle-pqrs.component';

describe('AdminDetallePqrsComponent', () => {
  let component: AdminDetallePqrsComponent;
  let fixture: ComponentFixture<AdminDetallePqrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDetallePqrsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDetallePqrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
