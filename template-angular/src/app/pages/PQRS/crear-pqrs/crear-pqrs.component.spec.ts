import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPqrsComponent } from './crear-pqrs.component';

describe('CrearPqrsComponent', () => {
  let component: CrearPqrsComponent;
  let fixture: ComponentFixture<CrearPqrsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearPqrsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPqrsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
