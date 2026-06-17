import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePqrsComponent } from './detalle-pqrs.component';

describe('DetallePqrsComponent', () => {
  let component: DetallePqrsComponent;
  let fixture: ComponentFixture<DetallePqrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetallePqrsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallePqrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
