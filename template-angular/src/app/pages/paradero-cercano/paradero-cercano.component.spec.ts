import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParaderoCercanoComponent } from './paradero-cercano.component';

describe('ParaderoCercanoComponent', () => {
  let component: ParaderoCercanoComponent;
  let fixture: ComponentFixture<ParaderoCercanoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ParaderoCercanoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParaderoCercanoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
