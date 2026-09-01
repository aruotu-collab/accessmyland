import Link from "next/link";
import { Logo } from "@/components/Logo";
import { IconArrow, IconCheck } from "@/components/icons";

const STEPS = [
  "Project needs access",
  "Identify the land",
  "Identify owner / occupier",
  "Make contact",
  "Open an offer",
  "Negotiate compensation",
  "Agree conditions",
  "Generate the licence",
  "Sign electronically",
  "Schedule the visit",
  "Evidence access",
  "Record damage",
  "Pay the landowner",
  "Close the case",
];

const SECTORS = ["Rail", "Electricity", "Renewables", "Water", "Highways", "Telecom", "Environmental surveys"];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-slate md:flex">
          <a href="#workflow">Workflow</a>
          <a href="#product">Product</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-forest hover:text-brass-deep">
            Sign in
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-cream hover:bg-forest-deep"
          >
            Open the demo
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-2 lg:pt-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brass-deep">
            Built for Britain’s infrastructure
          </p>
          <h1 className="mt-4 font-serif text-5xl leading-[1.05] text-forest sm:text-6xl">
            The operating system for third-party land access.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate">
            Infrastructure teams still chase landowners through inboxes, PDFs and
            spreadsheets. AccessMyLand runs the whole job: identify, negotiate,
            licence, evidence, pay — and send overflow to an independent land agent.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-cream hover:bg-forest-deep"
            >
              Try the live demo <IconArrow className="h-4 w-4" />
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-forest hover:border-forest"
            >
              See the workflow
            </a>
          </div>
          <p className="mt-6 text-sm text-slate">
            Not a £29/month land-agent app. Built for operators who need 40% more
            landowners without another hire.
          </p>
        </div>

        <div className="relative">
          <div className="map-grid os-contour relative overflow-hidden rounded-3xl border border-line p-6 shadow-[0_30px_80px_-40px_rgba(18,56,43,0.45)]">
            <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-forest/70">
              <span>AML-2026-0142 · Ellis Farm</span>
              <span className="rounded-full bg-brass/20 px-2 py-0.5 text-brass-deep">Negotiating</span>
            </div>
            <div className="rounded-2xl bg-paper/90 p-4 shadow-sm hairline">
              <div className="text-xs text-slate">GI borehole · Lincolnshire arable</div>
              <div className="mt-1 font-serif text-3xl text-forest">£780</div>
              <div className="mt-1 text-xs text-slate">
                County median for similar GI access is £780. Opening offer was £650.
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between rounded-lg bg-cream px-3 py-2">
                  <span>Operator offer</span>
                  <span className="font-medium">£650</span>
                </div>
                <div className="flex justify-between rounded-lg bg-cream px-3 py-2">
                  <span>Landowner counter</span>
                  <span className="font-medium">£950</span>
                </div>
                <div className="flex justify-between rounded-lg bg-forest px-3 py-2 text-cream">
                  <span>Revised offer</span>
                  <span className="font-medium text-brass">£780</span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px]">
              <div className="rounded-xl bg-paper/80 py-3 hairline">
                <div className="font-serif text-lg text-forest">14</div>
                live cases
              </div>
              <div className="rounded-xl bg-paper/80 py-3 hairline">
                <div className="font-serif text-lg text-forest">15%</div>
                agent fee
              </div>
              <div className="rounded-xl bg-paper/80 py-3 hairline">
                <div className="font-serif text-lg text-forest">£10m</div>
                ARR path
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-cream/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-slate">
          <span className="font-medium text-forest">Sectors from day one</span>
          {SECTORS.map((s) => (
            <span key={s} className="rounded-full bg-paper px-3 py-1 hairline">
              {s}
            </span>
          ))}
        </div>
      </section>

      <section id="workflow" className="mx-auto max-w-6xl px-6 py-20">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brass-deep">
          Own one workflow
        </p>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl text-forest">
          Not another GIS with a filing cabinet. The job of getting onto someone else’s land.
        </h2>
        <p className="mt-4 max-w-2xl text-slate">
          Established platforms already store parcels, documents and maps. The gap is
          temporary access: negotiation, compensation, a signed licence, a visit, evidence,
          reinstatement and payment — with a marketplace when your land team is full.
        </p>
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className="rounded-2xl border border-line bg-white/70 p-4"
            >
              <div className="font-serif text-2xl text-brass">{String(i + 1).padStart(2, "0")}</div>
              <div className="mt-2 text-sm font-medium text-forest">{step}</div>
            </li>
          ))}
        </ol>
      </section>

      <section id="product" className="bg-forest-deep py-20 text-cream">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 lg:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brass">
              Three businesses, one platform
            </p>
            <h2 className="mt-3 font-serif text-4xl">SaaS. Marketplace. Intelligence.</h2>
          </div>
          {[
            {
              k: "01",
              t: "SaaS",
              d: "Operators pay to run land access. SMEs from £590 a month; enterprise teams on annual licences. Every case has a single file: parties, offers, conditions, licence, visit, evidence, pay.",
            },
            {
              k: "02",
              t: "Marketplace",
              d: "Sixty parcels, twenty you cannot cover. Assign them to approved independent agents. A £500 professional fee at 15% is £75 to the platform — times thousands of cases.",
            },
            {
              k: "03",
              t: "Intelligence",
              d: "Once you have processed enough agreements you know what was offered, countered and settled — by land type, county, duration and crop. That data becomes the product.",
            },
          ].map((b) => (
            <div key={b.k} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-brass">{b.k}</div>
              <h3 className="mt-2 font-serif text-2xl">{b.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-cream/75">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-serif text-4xl text-forest">
              Approach the market from the project, not the building.
            </h2>
            <p className="mt-4 text-slate">
              Wayleave tools often start with a landlord and an incoming operator.
              AccessMyLand starts the other way: an infrastructure scheme that must
              cross third-party land. Different motion, different buyer, different
              software.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-forest">
              {[
                "Negotiation thread with opening offer, counter and settle",
                "Compensation vs county median, before you send the number",
                "Access licence generated from agreed terms",
                "Independent agents when internal capacity runs out",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-brass-deep" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl bg-cream p-8 hairline">
            <p className="text-xs uppercase tracking-[0.2em] text-brass-deep">The pitch</p>
            <blockquote className="mt-4 font-serif text-2xl leading-snug text-forest">
              “Your land team can manage 40% more landowners without employing additional agents.”
            </blockquote>
            <p className="mt-6 text-sm text-slate">
              That is the return, not “our software stores access”. Five hundred
              organisations at £20,000 a year is £10m ARR — before marketplace
              commission or data products. The surrounding UK category already
              supports businesses of that scale.
            </p>
          </div>
        </div>
      </section>

      <section id="pricing" className="border-t border-line bg-cream/50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-serif text-4xl text-forest">Straightforward commercial terms</h2>
          <p className="mt-3 max-w-xl text-slate">
            Demo pricing for the product you can click through today. Enterprise
            contracts are scoped to programme volume.
          </p>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {[
              {
                name: "Studio",
                price: "£590",
                unit: "/ month",
                points: ["25 open cases", "Licence generation", "Landowner portal", "Email support"],
              },
              {
                name: "Operator",
                price: "£1,800",
                unit: "/ month",
                points: [
                  "Unlimited cases",
                  "Agent marketplace",
                  "Compensation intelligence",
                  "SSO-ready workspace",
                ],
                featured: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                unit: "",
                points: [
                  "Programme licences",
                  "£20k–£100k+ / year",
                  "API and GIS ingest",
                  "Named customer success",
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`rounded-3xl p-7 ${
                  p.featured ? "bg-forest text-cream" : "bg-paper hairline"
                }`}
              >
                <div className="text-sm uppercase tracking-[0.16em] opacity-80">{p.name}</div>
                <div className="mt-3 font-serif text-4xl">
                  {p.price}
                  <span className="text-lg opacity-70">{p.unit}</span>
                </div>
                <ul className="mt-6 space-y-2 text-sm opacity-90">
                  {p.points.map((x) => (
                    <li key={x}>· {x}</li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`mt-8 inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                    p.featured ? "bg-brass text-forest-deep" : "bg-forest text-cream"
                  }`}
                >
                  Open demo
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-slate">
            Marketplace commission is 15% of the professional fee. Intelligence is
            included on Operator and Enterprise.
          </p>
        </div>
      </section>

      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="text-sm text-slate">
            accessmyland.com · Third-party land access for infrastructure · Demo product
          </p>
        </div>
      </footer>
    </div>
  );
}
