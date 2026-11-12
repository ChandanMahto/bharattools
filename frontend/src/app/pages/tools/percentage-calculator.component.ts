import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { percentageChange, percentageOf, whatPercentIs } from '../../tools/percentage';
import { formatIndianNumber } from '../../core/format';
import { AccountService } from '../../core/account.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bt-percentage-calculator',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <section class="tool-page">
      <a class="back-link" href="/">← All tools</a>
      <div class="eyebrow">EVERYDAY · CALCULATOR</div>
      <h1>Percentage Calculator</h1>
      <p class="tool-intro">
        Calculate percentages, compare marks, or find the percentage increase or decrease between
        two values.
      </p>
      <div class="percentage-grid">
        <article class="mini-calculator">
          <h2>What is X% of Y?</h2>
          <div class="inline-fields">
            <input type="number" [(ngModel)]="percent" aria-label="Percentage" /><span>% of</span
            ><input type="number" [(ngModel)]="value" aria-label="Value" />
          </div>
          <div class="mini-result">{{ number(percentageOf(value, percent)) }}</div>
        </article>
        <article class="mini-calculator">
          <h2>X is what % of Y?</h2>
          <div class="inline-fields">
            <input type="number" [(ngModel)]="part" aria-label="Part" /><span>of</span
            ><input type="number" [(ngModel)]="whole" aria-label="Whole" />
          </div>
          <div class="mini-result">{{ number(whatPercentIs(part, whole)) }}%</div>
        </article>
        <article class="mini-calculator">
          <h2>Percentage change</h2>
          <div class="inline-fields">
            <input type="number" [(ngModel)]="from" aria-label="Starting value" /><span>to</span
            ><input type="number" [(ngModel)]="to" aria-label="Ending value" />
          </div>
          <div class="mini-result">{{ number(percentageChange(from, to)) }}%</div>
          <p class="field-hint">Positive means increase; negative means decrease.</p>
        </article>
      </div>
      <div class="percentage-save">
        <button type="button" class="primary-button save-button" (click)="save()">
          Save all three calculations
        </button>
        @if (message) {
          <p class="status-message" role="status">
            {{ message }} <a routerLink="/account">Open account</a>
          </p>
        }
      </div>
    </section>
  `,
})
export class PercentageCalculatorComponent {
  private account = inject(AccountService);
  message = '';
  percent = 18;
  value = 1000;
  part = 45;
  whole = 180;
  from = 100;
  to = 125;
  number = formatIndianNumber;
  percentageOf = percentageOf;
  whatPercentIs = whatPercentIs;
  percentageChange = percentageChange;
  save() {
    if (!this.account.signedIn) {
      this.message = 'Sign in to save these calculations.';
      return;
    }
    const inputs = {
      percent: this.percent,
      value: this.value,
      part: this.part,
      whole: this.whole,
      from: this.from,
      to: this.to,
    };
    const result = {
      percentageOf: percentageOf(this.value, this.percent),
      whatPercentIs: whatPercentIs(this.part, this.whole),
      percentageChange: percentageChange(this.from, this.to),
    };
    this.account
      .save({ toolSlug: 'percentage', title: 'Percentage calculations', inputs, result })
      .subscribe({
        next: () => (this.message = 'Calculations saved to your account.'),
        error: () => (this.message = 'Could not save. Please try again.'),
      });
  }
}
