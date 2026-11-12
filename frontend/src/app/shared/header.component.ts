import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bt-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="site-header">
      <a class="brand" routerLink="/" aria-label="BharatTools home">
        <span class="brand-mark">B</span><span>Bharat<span class="brand-light">Tools</span></span>
      </a>
      <nav aria-label="Main navigation">
        <a routerLink="/">All tools</a>
        <a routerLink="/account">Saved calculations</a>
        <a href="#categories">Categories</a>
        <span class="privacy-note"><span class="privacy-dot"></span> Private by default</span>
      </nav>
      <a class="header-cta" routerLink="/account">My account <span aria-hidden="true">↗</span></a>
    </header>
  `,
})
export class HeaderComponent {}
