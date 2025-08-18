import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SideNavService {
  isExpanded = false;

  toggle(): void {
    this.isExpanded = !this.isExpanded;
  }

  setExpanded(value: boolean): void {
    this.isExpanded = value;
  }

  getExpanded(): boolean {
    return this.isExpanded;
  }
}
