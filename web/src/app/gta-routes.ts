import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon, IconName } from './icon';
import { longDate } from './format';

export type RouteStatus = 'works' | 'partial' | 'blocked';

interface Source {
  name: string;
  url: string;
}

export interface Route {
  title: string;
  status: RouteStatus;
  label: string;
  text: string;
  source?: Source;
}

interface Player {
  group: string;
  name: string;
  text: string;
  url?: string;
}

/** The parts of data/gta_status.json (kept by hand) this section and the hero read. */
export interface RouteData {
  updated: string;
  routes?: Route[];
  players?: Player[];
  timeline?: { date: string; text: string; source?: Source }[];
}

/** Stage classes from the readiness table, so a route's status reads like an emulator's. */
export const STATUS_CLASS: Record<RouteStatus, string> = { works: 's-playable', partial: 's-menus', blocked: 's-none' };
const safe = (url?: string): string | null => (url && url.startsWith('https://') ? url : null);

/**
 * Every way to get GTA 6 onto a PC, not only PS5 emulation, and who is working on each. Content comes from
 * data/gta_status.json, so news means editing that file, not this component.
 */
@Component({
  selector: 'app-gta-routes',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (data(); as d) {
      @if (d.routes?.length) {
      <section class="sec" id="gta6-routes" aria-labelledby="gta6-routes-h">
        <div class="sec-head">
          <h2 id="gta6-routes-h">Every route to GTA 6 on PC</h2>
          <p class="note">The {{ d.routes!.length }} ways people are trying to get GTA 6 onto a PC, and where each one stands. Checked {{ longDate(d.updated) }}; each card links its source.</p>
        </div>
        <ul class="grid routes" role="list">
          @for (r of d.routes; track r.title) {
            <li class="card route">
              <h3>{{ r.title }}</h3>
              <span class="stage" [class]="'stage ' + statusClass[r.status]">{{ r.label }}</span>
              <p>{{ r.text }}</p>
              @if (safe(r.source?.url); as url) {
                <a class="with-icon route-src" [href]="url" target="_blank" rel="noopener">{{ r.source!.name }}<app-icon name="external" [size]="12" /></a>
              }
            </li>
          }
        </ul>
      </section>
      }

      @if (groups().length) {
        <section class="sec" id="gta6-players" aria-labelledby="gta6-players-h">
          <div class="sec-head">
            <h2 id="gta6-players-h">Who's working on it</h2>
            <p class="note">The projects, people and companies that decide when GTA 6 runs on a PC. This site never links to exploits, jailbreak tools or game files; hacker entries cite news coverage.</p>
          </div>
          <div class="grid two">
            @for (g of groups(); track g.name) {
              <article class="card players">
                <h3><app-icon [name]="g.icon" [size]="16" />{{ g.name }}</h3>
                <dl>
                  @for (p of g.players; track p.name) {
                    <dt>
                      @if (safe(p.url); as url) {
                        <a class="with-icon" [href]="url" target="_blank" rel="noopener">{{ p.name }}<app-icon name="external" [size]="12" /></a>
                      } @else {
                        {{ p.name }}
                      }
                    </dt>
                    <dd>{{ p.text }}</dd>
                  }
                </dl>
              </article>
            }
          </div>
        </section>
      }

      @if (d.timeline?.length) {
        <section class="sec" id="gta6-timeline" aria-labelledby="gta6-timeline-h">
          <div class="sec-head">
            <h2 id="gta6-timeline-h">How we got here</h2>
            <p class="note">The events that shaped every route to GTA 6 on PC, newest first. Each links its source.</p>
          </div>
          <ol class="timeline" role="list">
            @for (t of d.timeline; track t.date + t.text) {
              <li>
                <time [attr.datetime]="t.date">{{ longDate(t.date) }}</time>
                <p>{{ t.text }}
                  @if (safe(t.source?.url); as url) {
                    <a class="with-icon route-src" [href]="url" target="_blank" rel="noopener">{{ t.source!.name }}<app-icon name="external" [size]="12" /></a>
                  }
                </p>
              </li>
            }
          </ol>
        </section>
      }
    }
  `,
})
export class GtaRoutes {
  protected readonly longDate = longDate;
  protected readonly statusClass = STATUS_CLASS;
  protected readonly safe = safe;
  /** data/gta_status.json, loaded once by the app. */
  readonly data = input<RouteData | null>(null);

  protected readonly groups = computed(() => {
    const icons: Record<string, IconName> = {
      'Emulator developers': 'cpu',
      'PS5 hackers (the copy problem)': 'alert',
      'Xbox hackers': 'monitor',
      'Fan porters and PC tools': 'gamepad',
      'Rockstar, Sony and Microsoft': 'globe',
      'Scams to avoid': 'ban',
    };
    const out: { name: string; icon: IconName; players: Player[] }[] = [];
    for (const p of this.data()?.players ?? []) {
      let g = out.find(x => x.name === p.group);
      if (!g) out.push(g = { name: p.group, icon: icons[p.group] ?? 'users', players: [] });
      g.players.push(p);
    }
    return out;
  });

}
