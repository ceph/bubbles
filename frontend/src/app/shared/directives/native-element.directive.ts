import { Directive, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formControlName]' // eslint-disable-line
})
export class NativeElementDirective implements OnInit {
  constructor(private elementRef: ElementRef, private control: NgControl) {}

  ngOnInit(): void {
    // @ts-ignore
    this.control.control.nativeElement = this.elementRef.nativeElement;
  }
}
