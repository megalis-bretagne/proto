import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastellSnackComponent } from './pastell-snack.component';

describe('PastellSnackComponent', () => {
  let component: PastellSnackComponent;
  let fixture: ComponentFixture<PastellSnackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PastellSnackComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastellSnackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
