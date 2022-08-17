import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PastellFormComponent } from './pastell-form.component';

describe('PastellFormComponent', () => {
  let component: PastellFormComponent;
  let fixture: ComponentFixture<PastellFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PastellFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PastellFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
