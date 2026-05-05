import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarParaderosModalComponent } from './gestionar-paraderos-modal.component';

describe('GestionarParaderosModalComponent', () => {
  let component: GestionarParaderosModalComponent;
  let fixture: ComponentFixture<GestionarParaderosModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionarParaderosModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarParaderosModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
