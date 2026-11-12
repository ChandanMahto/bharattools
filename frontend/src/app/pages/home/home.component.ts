import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TOOLS } from '../../core/tool-registry';

@Component({
  selector: 'bt-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="eyebrow"><span class="eyebrow-line"></span> THE EVERYDAY TOOLKIT FOR INDIA</div>
      <h1>Small tasks.<br /><span>Made simpler.</span></h1>
      <p class="hero-copy">
        Calculators and handy tools for everyday life in India. No sign-up, no fuss — just get it
        done.
      </p>
      <label class="search-box">
        <span class="search-icon" aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="What do you want to calculate today?"
          aria-label="Search tools"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
        />
        <kbd>Search</kbd>
      </label>
      <div class="hero-meta">
        <span>✓ Free to use</span><span>✓ Private by default</span><span>✓ Made for India</span>
      </div>
      <div class="hero-decoration" aria-hidden="true"><span>₹</span><i></i><b></b></div>
    </section>

    <section class="section-block" id="popular">
      <div class="section-heading">
        <div>
          <div class="eyebrow">GET STARTED</div>
          <h2>{{ query() ? 'Search results' : 'Popular tools' }}</h2>
        </div>
        <span class="result-count">{{ filteredTools().length }} tools</span>
      </div>
      <div class="tool-grid">
        @for (tool of filteredTools(); track tool.slug) {
          <a class="tool-card" [routerLink]="tool.route">
            <span class="tool-icon" [class.finance-icon]="tool.category === 'Finance'">{{
              iconFor(tool.slug)
            }}</span>
            <span class="tool-category">{{ tool.category }}</span>
            <strong>{{ tool.name }}</strong>
            <span class="tool-description">{{ tool.description }}</span>
            <span class="card-arrow" aria-hidden="true">↗</span>
          </a>
        } @empty {
          <div class="empty-state">No tools found. Try “GST”, “loan” or “percentage”.</div>
        }
      </div>
    </section>

    <section class="trust-strip" id="categories">
      <div class="trust-icon">◈</div>
      <div>
        <strong>Your numbers stay yours.</strong>
        <p>Guest tools calculate on your device. We don't save your inputs or results.</p>
      </div>
      <span class="trust-link">Privacy first <span aria-hidden="true">→</span></span>
    </section>

    <section class="section-block categories-block">
      <div class="eyebrow">BROWSE YOUR WAY</div>
      <h2>Tools for every day</h2>
      <div class="category-pills">
        <span>₹ Finance</span><span>◷ Everyday</span><span>⌘ Developer</span><span>▧ Documents</span
        ><span>✧ Images</span>
      </div>
      <p class="muted-copy">
        More carefully built tools are on the way. Each one will be designed around the way people
        in India actually work and calculate.
      </p>
    </section>
  `,
})
export class HomeComponent {
  readonly query = signal('');
  readonly filteredTools = computed(() => {
    const q = this.query().trim().toLowerCase();
    return TOOLS.filter(
      (tool) =>
        !q ||
        [tool.name, tool.description, tool.category, ...tool.keywords]
          .join(' ')
          .toLowerCase()
          .includes(q),
    );
  });

  iconFor(slug: string): string {
    return slug === 'gst-calculator' ? '₹' : slug === 'emi-calculator' ? '⌂' : '%';
  }
}
