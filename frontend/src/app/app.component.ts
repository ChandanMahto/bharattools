import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/header.component';
import { FooterComponent } from './shared/footer.component';

@Component({
  selector: 'bt-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <bt-header />
    <main class="page-shell"><router-outlet /></main>
    <bt-footer />
  `,
})
export class AppComponent {}
