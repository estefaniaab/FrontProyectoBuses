import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoBusComponent } from './seguimiento-bus.component';

describe('SeguimientoBusComponent', () => {
  let component: SeguimientoBusComponent;
  let fixture: ComponentFixture<SeguimientoBusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeguimientoBusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeguimientoBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
