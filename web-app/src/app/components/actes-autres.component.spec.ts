import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActesAutresComponent } from './actes-autres.component';

describe('ActesAutresComponent', () => {
  let component: ActesAutresComponent;
  let fixture: ComponentFixture<ActesAutresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActesAutresComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActesAutresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
