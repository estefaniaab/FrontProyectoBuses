import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TendenciaIncidentesComponent } from './tendencia-incidentes.component';

describe('TendenciaIncidentesComponent', () => {
  let component: TendenciaIncidentesComponent;
  let fixture: ComponentFixture<TendenciaIncidentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TendenciaIncidentesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TendenciaIncidentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
