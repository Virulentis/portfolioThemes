import { AnsubMinimalTheme } from './AnsubMinimal/AnsubMinimalTheme';
import { BrutalistTheme } from './Brutalist/BrutalistTheme';
import { ChiangV4Theme } from './ChiangV4/ChiangV4Theme';
import { ChiangCurrentTheme } from './ChiangCurrent/ChiangCurrentTheme';
import { NickComputerTheme } from './NickComputer/NickComputerTheme';
import { BrianLovinTheme } from './BrianLovin/BrianLovinTheme';
import { JoshBradleyTheme } from './JoshBradley/JoshBradleyTheme';
import { HendoTheme } from './Hendo/HendoTheme';
import { PiTheme } from './Pi/PiTheme';
import { ChiziTheme } from './Chizi/ChiziTheme';
import { GerhardTheme } from './Gerhard/GerhardTheme';
import { AlanaGoyalTheme } from './AlanaGoyal/AlanaGoyalTheme';
import { AmirmxtTheme } from './Amirmxt/AmirmxtTheme';
import { FelixDornerTheme } from './FelixDorner/FelixDornerTheme';
import { JamiePatesTheme } from './JamiePates/JamiePatesTheme';
import { TerminalTheme } from './Terminal/TerminalTheme';
import { StammyTheme } from './Stammy/StammyTheme';
import { StefanFiskTheme } from './StefanFisk/StefanFiskTheme';
import { StefanZweifelTheme } from './StefanZweifel/StefanZweifelTheme';
import { DmythroTheme } from './Dmythro/DmythroTheme';
import { DTCTheme } from './DTC/DTCTheme';
import { KubreTheme } from './Kubre/KubreTheme';
import { PacoTheme } from './Paco/PacoTheme';
import { P5aholicTheme } from './P5aholic/P5aholicTheme';
import { RinkitadhanaTheme } from './Rinkitadhana/RinkitadhanaTheme';
import { U11gTheme } from './U11g/U11gTheme';
import { ShubhamTheme } from './Shubham/ShubhamTheme';
import { PalmesTheme } from './Palmes/PalmesTheme';

export const PORTFOLIO_THEMES = [
  {
    id: 'ansub-minimal',
    slug: 'minimal',
    name: 'Minimal',
    description: 'Clean single-page layout powered by CV.yaml. Features a timeline experience view, projects section, and contact info.',
    source: 'https://ansub.com',
    Component: AnsubMinimalTheme,
  },
  {
    id: 'brutalist',
    slug: 'brutalist',
    name: 'Brutalist',
    description: 'No-frills, lightweight design. Just content, system fonts, and zero bullshit.',
    source: null,
    Component: BrutalistTheme,
  },
  {
    id: 'chiang-v4',
    slug: 'developer-dark',
    name: 'Developer Dark',
    description: 'Dark navy portfolio with green accents. Full-page sections with numbered headings.',
    source: 'https://v4.brittanychiang.com',
    Component: ChiangV4Theme,
  },
  {
    id: 'chiang-current',
    slug: 'spotlight',
    name: 'Spotlight',
    description: 'Modern two-column layout with slate colors and teal accents. Sticky navigation with scroll-aware highlighting.',
    source: 'https://brittanychiang.com',
    Component: ChiangCurrentTheme,
  },
  {
    id: 'nick-computer',
    slug: 'creative-dark',
    name: 'Creative Dark',
    description: 'Bold dark theme with Rammetto One display font. Horizontal project cards and clean experience list.',
    source: 'https://nick.computer',
    Component: NickComputerTheme,
  },
  {
    id: 'brian-lovin',
    slug: 'designer',
    name: 'Designer',
    description: 'Clean minimal portfolio with centered content, monospace dates, and elegant project listings.',
    source: 'https://brianlovin.com',
    Component: BrianLovinTheme,
  },
  {
    id: 'josh-bradley',
    slug: 'editorial',
    name: 'Editorial',
    description: 'Two-column layout with italic navigation, justified text, and leader-dot lists. Warm cream background with serif accents.',
    source: 'https://joshbradley.me',
    Component: JoshBradleyTheme,
  },
  {
    id: 'hendo',
    slug: 'hendo',
    name: 'Hendo',
    description: 'Clean minimal design with scramble text animation on hover. Light/dark mode toggle, centered content, and simple navigation.',
    source: 'https://hendo.dev',
    Component: HendoTheme,
  },
  {
    id: 'pi',
    slug: 'research-lab',
    name: 'Research Lab',
    description: 'Monospace timeline layout with featured cards and box shadows. Cream background, serif logo, and vertical timeline with square dots.',
    source: 'https://www.andrewheiss.com',
    Component: PiTheme,
  },
  {
    id: 'chizi',
    slug: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean minimalist design with blue accents. Features a live clock, project cards grid, and smooth hover animations.',
    source: 'https://chizi.me',
    Component: ChiziTheme,
  },
  {
    id: 'gerhard',
    slug: 'plain-text',
    name: 'Plain Text',
    description: 'Ultra-minimal design with system fonts, 60ch width, and automatic dark/light mode. Subtle gray underlines and muted section labels.',
    source: 'https://gerhard.io',
    Component: GerhardTheme,
  },
  {
    id: 'alana-goyal',
    slug: 'notes',
    name: 'Notes',
    description: 'Notes-style layout with emoji icons, golden accent color, and dark mode default. Clean SF Pro typography with lowercase aesthetic.',
    source: 'https://alanagoyal.com',
    Component: AlanaGoyalTheme,
  },
  {
    id: 'amirmxt',
    slug: 'builder',
    name: 'Builder',
    description: 'Clean professional layout with card-based projects and section dividers. Inter font, subtle hover effects, and live footer clock.',
    source: 'https://amirmxt.com',
    Component: AmirmxtTheme,
  },
  {
    id: 'felix-dorner',
    slug: 'timeline',
    name: 'Timeline',
    description: 'Clean professional design with timeline layout, monospace dates, and indigo accent links. Inter font with uppercase section labels.',
    source: 'https://felixdorner.com',
    Component: FelixDornerTheme,
  },
  {
    id: 'terminal',
    slug: 'terminal',
    name: 'Terminal',
    description: 'Hacker-style black terminal with Geist Mono font, ALL CAPS text, blinking cursor, and animated link underlines.',
    source: 'https://ragojose.com',
    Component: TerminalTheme,
  },
  {
    id: 'jamie-pates',
    slug: 'sandbox-save',
    name: 'Sandbox Save',
    description: 'PS1-inspired interface with FF7-style panels, tabbed file views, and a game UI treatment driven by CV.yaml data.',
    source: 'https://www.jamiepates.com',
    Component: JamiePatesTheme,
  },
  {
    id: 'stammy',
    slug: 'stammy',
    name: 'Stammy',
    description: 'Dark olive theme with left icon sidebar, serif typography, and table-style work history.',
    source: 'https://paulstamatiou.com',
    Component: StammyTheme,
  },
  {
    id: 'stefan-fisk',
    slug: 'business-card',
    name: 'Business Card',
    description: 'Ultra-minimal centered contact page with classic serif typography and simple hover-underlined links.',
    source: 'https://stefanfisk.com',
    Component: StefanFiskTheme,
  },
  {
    id: 'stefan-zweifel',
    slug: 'developer',
    name: 'Developer',
    description: 'Clean white portfolio with pride gradient bar, system fonts, underlined links, and tabular date formatting.',
    source: 'https://stefanzweifel.dev',
    Component: StefanZweifelTheme,
  },
  {
    id: 'dmythro',
    slug: 'two-column',
    name: 'Two Column',
    description: 'Modern two-column layout with sticky photo card, accordion sections, timeline with chip dates, and gradient social buttons. Dark mode support.',
    source: 'https://dmythro.com',
    Component: DmythroTheme,
  },
  {
    id: 'dtc',
    slug: 'splash',
    name: 'Splash',
    description: 'Full-screen hero splash with profile picture, colorful project cards, and alternating timeline. Dark theme with Roboto typography.',
    source: 'https://dtc.dev',
    Component: DTCTheme,
  },
  {
    id: 'kubre',
    slug: 'notebook',
    name: 'Notebook',
    description: 'Monospace terminal aesthetic with glitch-style header, yellow accent hovers, and notebook paper dots.',
    source: 'https://kubre.in',
    Component: KubreTheme,
  },
  {
    id: 'paco',
    slug: 'paco',
    name: 'Paco',
    description: 'Minimalist grayscale portfolio with staggered animations, three-column layout, and indigo accent.',
    source: 'https://paco.me',
    Component: PacoTheme,
  },
  {
    id: 'p5aholic',
    slug: 'framed',
    name: 'Framed',
    description: 'Artistic portfolio with border frame, mix-blend-mode difference, left navigation with dot indicators, and right-aligned projects. Sans/Mono toggle.',
    source: 'https://p5aholic.me',
    Component: P5aholicTheme,
  },
  {
    id: 'rinkitadhana',
    slug: 'dashed',
    name: 'Dashed',
    description: 'Clean portfolio with dashed border separators, dot grid header, social pills, and two-column project grid. Geist-inspired typography.',
    source: 'https://rinkitadhana.com',
    Component: RinkitadhanaTheme,
  },
  {
    id: 'u11g',
    slug: 'mainframe',
    name: 'Mainframe',
    description: 'Brutalist dashboard with zinc surfaces, monospace typography, topic cards with colored accents, and grid-based project layout.',
    source: 'https://u11g.com',
    Component: U11gTheme,
  },
  {
    id: 'shubham',
    slug: 'imml',
    name: 'IMML',
    description: 'Minimal page-based portfolio with hash navigation, blockquote work entries, project tables, and dotted link underlines.',
    source: 'https://shubhwym.me',
    Component: ShubhamTheme,
  },
  {
    id: 'palmes',
    slug: '3d-duck',
    name: '3D Duck',
    description: 'Dark portfolio with scroll-synchronized 3D duck animation, cyan gradients, and comprehensive CV display.',
    source: 'https://palmes.dev',
    Component: PalmesTheme,
  },
];

export function getPortfolioTheme(themeId) {
  return PORTFOLIO_THEMES.find((t) => t.id === themeId) || PORTFOLIO_THEMES[0];
}

export function getThemeBySlug(slug) {
  return PORTFOLIO_THEMES.find((t) => t.slug === slug);
}

export function getThemeIdFromPath(pathname) {
  const slug = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (!slug) return null;
  const theme = getThemeBySlug(slug);
  return theme ? theme.id : null;
}
