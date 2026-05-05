# DESIGN.md

## 1. Visual Theme & Atmosphere
The Smart Job Portal & Resume Analyzer employs a **"Modern Enterprise"** aesthetic. The design language communicates trust, efficiency, and cutting-edge technology. It bridges the gap between a corporate HR tool and a sleek, consumer-facing SaaS product. 

* **Mood:** Professional, crisp, intelligent, and highly legible.
* **Density:** Medium-low. The UI utilizes generous whitespace to prevent cognitive overload, especially when displaying dense data like parsed resumes or applicant pipelines.
* **Geometry:** Structured and geometric, but softened with subtle rounding (`rounded-md` to `rounded-lg`) to remain approachable.

## 2. Color Palette & Roles

The system relies on a strictly controlled Indigo and Slate palette to maintain a premium feel. 

| Token | Hex Value | Tailwind Class | Functional Role |
|-------|-----------|----------------|-----------------|
| **Brand Primary** | `#4F46E5` | `bg-indigo-600` | Primary actions (Submit, Apply), active navigation states, primary highlights. |
| **Brand Hover** | `#4338CA` | `bg-indigo-700` | Hover states for primary interactive elements. |
| **Surface Base** | `#F8FAFC` | `bg-slate-50` | Main application background (behind cards and content containers). |
| **Surface Card** | `#FFFFFF` | `bg-white` | Foreground containers, dashboards, and dialogs. |
| **Text Primary** | `#0F172A` | `text-slate-900` | Headings, primary data points, and highly emphasized text. |
| **Text Secondary**| `#64748B` | `text-slate-500` | Body copy, secondary labels, table headers, and placeholders. |
| **Border Soft** | `#E2E8F0` | `border-slate-200` | Dividers, card borders, and inactive input borders. |

### Semantic Status Colors (Crucial for AI Matching)
| Status | Hex Value | Tailwind Classes | Usage |
|--------|-----------|------------------|-------|
| **High Match** | `#22C55E` | `bg-green-100 text-green-800` | AI match score > 80%, "Shortlisted" status. |
| **Med Match** | `#EAB308` | `bg-yellow-100 text-yellow-800` | AI match score 50-79%, "Under Review" status. |
| **Low Match** | `#EF4444` | `bg-red-100 text-red-800` | AI match score < 50%, "Rejected" status, destructive actions. |

## 3. Typography Rules

* **Primary Font Family:** `Inter`, sans-serif (or system default sans-serif).
* **Weights:** Regular (400) for body, Medium (500) for interactive labels, Semibold (600) for subheadings, Bold (700) for primary headings.

| Element | Size / Weight | Tailwind Classes | Example Usage |
|---------|---------------|------------------|---------------|
| **Display** | 36px / Bold | `text-4xl font-bold tracking-tight` | Landing page hero headlines. |
| **Heading 1** | 24px / Semibold | `text-2xl font-semibold tracking-tight` | Dashboard titles (e.g., "Applicant Pipeline"). |
| **Heading 2** | 18px / Medium | `text-lg font-medium` | Card titles, modal headers. |
| **Body** | 14px / Regular | `text-sm font-normal text-slate-500` | Standard paragraph text, resume descriptions. |
| **Micro** | 12px / Medium | `text-xs font-medium uppercase tracking-wider` | Table column headers, tiny status labels. |

## 4. Component Stylings

All components should visually map to the **Shadcn UI** component library default aesthetics, styled with the Tailwind configuration above.

* **Buttons:**
  * **Primary:** `bg-indigo-600 text-white rounded-md px-4 py-2 hover:bg-indigo-700 transition-colors`.
  * **Secondary/Outline:** `bg-transparent border border-slate-200 text-slate-900 hover:bg-slate-100 rounded-md`.
  * **Ghost:** `bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900`.
* **Cards:**
  * Must always use `bg-white border border-slate-200 rounded-lg shadow-sm`.
  * Internal padding should be standardized (e.g., `p-6`).
* **Inputs & Textareas:**
  * Clean borders: `border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`.
* **Badges & Tags (for AI Skills):**
  * Soft backgrounds with matching text: `bg-slate-100 text-slate-700 rounded-full px-2.5 py-0.5 text-xs font-semibold`.
* **Icons:**
  * Exclusively use **Lucide React** icons. Stroke width should remain at the default `2px`.

## 5. Layout Principles

* **Grid System:** Use a standard 12-column CSS grid or Flexbox for major page layouts.
* **Dashboards:** Utilize a persistent left sidebar (`w-64`, `border-r border-slate-200`, `bg-white`) and a main content area (`flex-1`, `bg-slate-50`).
* **Spacing Scale:** Strictly adhere to the standard Tailwind spacing scale (`p-4`, `p-6`, `p-8`, `gap-4`, `gap-6`). Do not use arbitrary spacing values.

## 6. Depth & Elevation

The application uses a very "flat" aesthetic. Shadows are used sparingly to indicate interactability or overlapping layers, not physical depth.

* **Base Layer (0):** `bg-slate-50` (No shadow).
* **Content Layer (1):** Cards, Inputs. Use `shadow-sm`.
* **Overlay Layer (2):** Dropdowns, Popovers, Context Menus. Use `shadow-md border border-slate-200`.
* **Modal Layer (3):** Dialogs, AI Interview Interfaces. Use `shadow-xl` with a dark, semi-transparent backdrop (`bg-slate-900/50`).

## 7. Do's and Don'ts

* **DO** use exact Tailwind classes for colors. Do not write custom CSS unless strictly necessary.
* **DO** prioritize skeleton loaders over spinning indicators for fetching AI match scores or parsing resumes.
* **DO** ensure the AI Chat Interface clearly distinguishes between the AI Agent (left-aligned, `bg-slate-100`) and the User (right-aligned, `bg-indigo-600 text-white`).
* **DON'T** use highly rounded corners (`rounded-full`) except for user avatars and small skill tags. Everything else should be `rounded-md` or `rounded-lg`.
* **DON'T** use heavy drop shadows (`shadow-2xl`) on standard page elements. Keep the UI flat and crisp.
* **DON'T** use pure black (`#000000`). Always use `slate-900` for the darkest text.

## 8. Responsive Behavior

* **Mobile First:** All layouts must stack gracefully. 
* **Tables:** Complex data tables (like the Applicant Pipeline) must allow horizontal scrolling on mobile (`overflow-x-auto`) or transform into a stacked card view below the `md:` breakpoint.
* **Sidebar:** The desktop sidebar should collapse into a hamburger menu (Sheet component) on mobile devices.

## 9. Agent Prompt Guide

*When instructing AI coding agents to build pages for this project, include this quick-reference header:*

> "Use Shadcn UI components and Tailwind CSS. The app background is `bg-slate-50`, cards are `bg-white shadow-sm border-slate-200`. Primary brand color is `indigo-600`. Use Inter font with tight tracking on headings. Use Lucide React for all icons. Follow the DESIGN.md specifications for exact styling."