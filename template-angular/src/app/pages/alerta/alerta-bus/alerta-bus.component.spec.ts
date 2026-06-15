import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertaBusComponent } from './alerta-bus.component';

describe('AlertaBusComponent', () => {
  let component: AlertaBusComponent;
  let fixture: ComponentFixture<AlertaBusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertaBusComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertaBusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
