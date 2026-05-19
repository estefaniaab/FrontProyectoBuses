import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusIncidentesComponent } from './bus-incidentes.component';

describe('BusIncidentesComponent', () => {
  let component: BusIncidentesComponent;
  let fixture: ComponentFixture<BusIncidentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BusIncidentesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BusIncidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
