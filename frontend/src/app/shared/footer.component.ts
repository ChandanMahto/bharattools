import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bt-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-main">
        <a class="brand" routerLink="/"
          ><span class="brand-mark">B</span
          ><span>Bharat<span class="brand-light">Tools</span></span></a
        >
        <p>Everyday tools, made for India. Useful by default. Private by design.</p>
      </div>
      <div class="footer-bottom">
        <span>© {{ year }} BharatTools</span>
        <span>Guest calculations run in your browser. No account needed.</span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
